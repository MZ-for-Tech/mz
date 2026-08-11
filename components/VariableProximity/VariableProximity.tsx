'use client';

import { forwardRef, useMemo, useRef, useEffect, useCallback, useState, RefObject, HTMLAttributes } from 'react';

import styles from './VariableProximity.module.css';

type Callback = () => void;

/**
 * rAF loop that only runs while `active` is true. The callback is held in a
 * ref so re-renders never tear down and restart the loop (the original
 * implementation re-subscribed on every callback identity change).
 */
function useAnimationFrame(callback: Callback, active: boolean) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    let frameId: number;
    const loop = () => {
      callbackRef.current();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [active]);
}

function useMousePositionRef(containerRef: RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef]);

  return positionRef;
}

interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: 'linear' | 'exponential' | 'gaussian';
  className?: string;
  wordClassName?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = 'linear',
    className = '',
    wordClassName = '',
    onClick,
    style,
    ...restProps
  } = props;

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const interpolatedSettingsRef = useRef<string[]>([]);
  // Last written rgb string per letter — skips redundant style writes.
  const lastColorsRef = useRef<string[]>([]);
  const mousePositionRef = useMousePositionRef(containerRef);
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  const isCoarse = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px), (hover: none)');
    isCoarse.current = mq.matches;
    const on = () => { isCoarse.current = mq.matches; };
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Gating: the rAF loop only runs while the element is on screen AND the
  // page is visible. Off-screen / hidden-tab → no per-frame work at all.
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const inViewRef = useRef(true);
  const hiddenRef = useRef(false);
  const [active, setActive] = useState(true);
  const updateActive = useCallback(() => {
    setActive(inViewRef.current && !hiddenRef.current);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      updateActive();
    }, { threshold: 0 });
    io.observe(el);
    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      updateActive();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [updateActive]);

  // Proximity tint colors, pre-resolved to RGB.
  //
  // The effect writes one color per letter per frame. The original code used
  // `color-mix(in srgb, var(--color-brand-yellow) p%, var(--color-text))`,
  // forcing the CSS engine to parse a color-mix() expression with two var()
  // resolutions for every letter on every frame (136 spans in the Manifesto).
  // `color-mix(in srgb, A p%, B)` is defined by spec as a linear sRGB
  // interpolation — A·(p/100) + B·(1 − p/100) — so computing it in JS and
  // writing a plain `rgb(r, g, b)` string is mathematically identical output
  // at a fraction of the parse cost.
  const tintRef = useRef<{ from: [number, number, number]; to: [number, number, number] }>({
    from: [255, 231, 141], // --color-brand-yellow (dark) until resolved
    to: [245, 245, 240],   // --color-text (dark) until resolved
  });

  useEffect(() => {
    const resolveRgb = (hexVar: string, rgbVar: string): [number, number, number] => {
      const styles = getComputedStyle(document.documentElement);
      // Prefer the comma-separated "-rgb" twin if defined (both themes ship one).
      const rgbRaw = styles.getPropertyValue(rgbVar).trim();
      const nums = rgbRaw.match(/\d+(?:\.\d+)?/g);
      if (nums && nums.length >= 3) {
        return [Math.round(parseFloat(nums[0])), Math.round(parseFloat(nums[1])), Math.round(parseFloat(nums[2]))];
      }
      // Fallback: parse the hex value of the main variable.
      const hex = styles.getPropertyValue(hexVar).trim().match(/^#([a-f\d]{6})$/i);
      if (hex) {
        const n = parseInt(hex[1], 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
      return [255, 255, 255];
    };

    const update = () => {
      tintRef.current = {
        from: resolveRgb("--color-brand-yellow", "--color-brand-yellow-rgb"),
        to: resolveRgb("--color-text", "--color-text-rgb"),
      };
    };
    update();

    // Re-resolve if the theme flips at runtime (same pattern as Grainient /
    // DataStreamHero; layout sets data-theme statically today, so this is
    // cheap insurance).
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") {
          update();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // F7: when from === to there is nothing to interpolate — skip the per-frame
  // fontVariationSettings write entirely (it computes a value that never changes).
  const hasFontVariation = fromFontVariationSettings !== toFontVariationSettings;

  const centres = useRef<{x:number;y:number}[]>([]);
  const measure = useCallback(() => {
    const c = containerRef.current?.getBoundingClientRect();
    if (!c) return;
    centres.current = letterRefs.current.map(el => {
      if (!el) return { x: -9999, y: -9999 };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
    });
  }, [containerRef]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure, { passive: true });
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr: string) =>
      new Map(
        settingsStr
          .split(',')
          .map(s => s.trim())
          .map(s => {
            const [name, value] = s.split(' ');
            return [name.replace(/['"]/g, ''), parseFloat(value)];
          })
      );

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const calculateFalloff = (distance: number) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
    switch (falloff) {
      case 'exponential':
        return norm ** 2;
      case 'gaussian':
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      case 'linear':
      default:
        return norm;
    }
  };

  useAnimationFrame(() => {
    if (!containerRef?.current) return;
    if (isCoarse.current) return;
    const { x, y } = mousePositionRef.current;
    if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
      return;
    }
    lastPositionRef.current = { x, y };

    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef) return;
      
      const c = centres.current[index];
      if (!c) return;

      const distance = calculateDistance(x, y, c.x, c.y);

      if (distance >= radius) {
        if (hasFontVariation) letterRef.style.fontVariationSettings = fromFontVariationSettings;
        lastColorsRef.current[index] = "";
        letterRef.style.color = '';
        letterRef.style.setProperty('--glow', '0');
        letterRef.style.transform = '';
        return;
      }

      const falloffValue = calculateFalloff(distance);
      if (hasFontVariation) {
        const newSettings = parsedSettings
          .map(({ axis, fromValue, toValue }) => {
            const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
            return `'${axis}' ${interpolatedValue}`;
          })
          .join(', ');

        interpolatedSettingsRef.current[index] = newSettings;
        letterRef.style.fontVariationSettings = newSettings;
      }
      
      const intensity = falloffValue;

      // sRGB lerp — identical to color-mix(in srgb, yellow p%, text).
      const { from: yc, to: tc } = tintRef.current;
      const r = Math.round(yc[0] + (tc[0] - yc[0]) * intensity);
      const g = Math.round(yc[1] + (tc[1] - yc[1]) * intensity);
      const b = Math.round(yc[2] + (tc[2] - yc[2]) * intensity);
      const color = `rgb(${r}, ${g}, ${b})`;
      // Skip the write when this letter's color is unchanged since last frame
      // (letters far from the cursor shift imperceptibly per mouse-pixel).
      if (lastColorsRef.current[index] !== color) {
        lastColorsRef.current[index] = color;
        letterRef.style.color = color;
      }
      letterRef.style.setProperty('--glow', String(intensity));
      letterRef.style.transform = `translateY(${-intensity * 5}px) scale(${1 + (intensity * 0.05)})`;
    });
  }, active);

  const words = label.split(' ');
  let letterIndex = 0;

  return (
    <span
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={`${className} ${styles.variableProximity}`}
      onClick={onClick}
      style={{ display: 'inline', ...style }}
      {...restProps}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={`${styles.wordSpan} ${wordClassName}`}>
          {word.split('').map((letter) => {
            const currentLetterIndex = letterIndex++;
            return (
              <span
                key={currentLetterIndex}
                ref={(el) => {
                  if (el) {
                    letterRefs.current[currentLetterIndex] = el;
                  }
                }}
                className={styles.letterSpan}
                style={{
                  fontVariationSettings: fromFontVariationSettings
                }}
                aria-hidden="true"
                data-char={letter}
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && <span className={styles.spaceSpan}>&nbsp;</span>}
        </span>
      ))}
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
});

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;
