"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { gsap } from "@/lib/gsap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isStartScreenFirstRender } from "@/lib/mzNav";
import VariableProximity from "@/components/VariableProximity/VariableProximity";
// Only the permission helper, not the hook: the hook is imported by MzLogo3D
// and is only useful once the sensor is mounted. The grant has to be made
// from here because it must happen inside the visitor's first gesture, and
// MzLogo3D is code-split behind the entry wipe.
import { requestDeviceTilt } from "@/components/Logo/useDeviceTilt";

/**
 * The start screen.
 *
 * This is the only thing left of the old scrolling homepage — everything
 * below the hero (manifesto, services, products, work, research, CTA) was
 * retired into the /menu panels.
 *
 * The screen itself does not scroll, and the nav pill that used to sit in its
 * corner is gone: this is a cinematic splash with one job, so a competing
 * navigation surface on it was pure noise. Clicking anywhere on it — or
 * pressing SPACE/ENTER — plays `launch()`: the hero elements leave, the
 * unified background stays, and the launcher converges in on /menu. See
 * lib/mzNav for why no wipe plays.
 */

/**
 * Is the 3D logo's canvas currently claiming a drag?
 *
 * MzLogo3D sets `data-mz-dragging` on its canvas once a drag is
 * unambiguous, because its drag and this screen's swipe-to-launch are the
 * same pointer movement and only one of them can own it. The flag is cleared
 * on pointerup, so it reads true only while a drag is genuinely in progress.
 *
 * Two accessors, because the two launch gestures carry different amounts of
 * information. A `wheel` or `touch` event has a target, so the touch path can
 * check what was actually touched. A `wheel` event does not — there is no
 * pointer to read — so it has to ask the document. `closest` is the accurate
 * test; the attribute query is the blunt one, and it is only safe here because
 * the flag is scoped to a single element that exists only while a drag runs.
 *
 * Both return false when the logo is not mounted, so the launch costs nothing
 * on the pages without it.
 */
function isDraggingLogo(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest("canvas[data-mz-dragging]") !== null
  );
}

function isLogoDragging(): boolean {
  return document.querySelector("canvas[data-mz-dragging]") !== null;
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const launchingRef = useRef(false);
  // Whether the motion-sensor grant has already been requested this session.
  const tiltAskedRef = useRef(false);
  const router = useRouter();

  const [isReadyForHeavy, setIsReadyForHeavy] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [MzLogo3DComponent, setMzLogo3DComponent] = useState<React.ComponentType<{
    className?: string;
    onLoad?: () => void;
    assemblyStartDelayMs?: number;
  }> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Loaded on every device. This used to be skipped on coarse pointers, on
  // the reasoning that a 480-mesh WebGL scene on a phone was too much — a
  // judgement made when the start screen was still a long scroll carrying two
  // `DarkVeil` layers and three `Grainient` cards alongside it. It is a splash
  // screen now, with nothing else on the page, so the scene is competing with
  // nothing and the mark is the whole reason to look at the screen.
  //
  // MzLogo3D already scales its own cost down on coarse pointers (dpr 1 rather
  // than 1.5, ceiling 1.25 rather than 2, antialias off) and only renders
  // while it is on screen. The gesture that used to conflict with it — an
  // upward swipe launching the menu — is resolved in favour of the launch, so
  // a phone keeps the only way it has in.
  useEffect(() => {
    import('@/components/Logo/MzLogo3D').then(m => {
      setMzLogo3DComponent(() => m.default);
    });
  }, []);

  useEffect(() => {
    // The 3D logo (and its WebGL context) is not created until the entry wipe
    // has finished — same gate the hero background used before the background
    // moved to the root layout.
    const onReady = () => setIsReadyForHeavy(true);
    window.addEventListener('mz-transition-done', onReady, { once: true });

    // Fallback just in case event fired before mount
    const timer = setTimeout(onReady, 1500);
    return () => {
      window.removeEventListener('mz-transition-done', onReady);
      clearTimeout(timer);
    };
  }, []);

  // Returning to the start screen (Escape, back button, logo link) replays the
  // intro — but compressed, so the user never waits through the 3s cold-load
  // choreography twice. `mz-launching` is cleared here too: it is what hands
  // the hero transforms back to the CSS entry animations.
  useEffect(() => {
    if (!isStartScreenFirstRender()) {
      document.documentElement.classList.add("mz-returned");
      const t = setTimeout(() => {
        document.documentElement.classList.remove("mz-returned");
      }, 3000);
      document.documentElement.classList.remove("mz-launching");
      return () => clearTimeout(t);
    }
    document.documentElement.classList.remove("mz-launching");
  }, []);

  /**
   * Hero out → navigate. The background is never touched: it lives in the
   * root layout, so it simply sits there while the foreground clears.
   */
  const launch = useCallback((href: string) => {
    if (launchingRef.current) return;
    launchingRef.current = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = () => router.push(href, { scroll: true });

    if (reduce) {
      go();
      return;
    }

    // CSS animations outrank inline styles, so the entry animations have to be
    // detached before GSAP can move the same elements. Both happen in this
    // synchronous block, before the next paint — no flash of the reset state.
    document.documentElement.classList.add("mz-launching");
    gsap.set(".hero-word-inner", { yPercent: 0, rotate: 0, opacity: 1 });
    gsap.set(".hero-subtext", { opacity: 1, y: 0 });
    gsap.set(".hero-desc", { opacity: 1, y: 0 });

    gsap.timeline({ onComplete: go })
      .to(".hero-word-inner", {
        yPercent: -140,
        rotate: -5,
        duration: 0.65,
        ease: "power4.in",
        stagger: 0.05,
      }, 0)
      .to(".hero-subtext", { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }, 0.08)
      .to(".hero-desc", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, 0.14)
      .to(".hero-enter", { opacity: 0, y: 14, duration: 0.3, ease: "power2.in" }, 0)
      .to(".hero-logo-3d", { opacity: 0, duration: 0.45, ease: "power2.in" }, 0.1);
  }, [router]);

  // SPACE / ENTER anywhere on the start screen launches the menu.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      // Let focused links/buttons handle their own activation.
      if (target?.closest?.("a, button, input, textarea, select")) return;
      e.preventDefault();
      launch("/home");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launch]);

  /**
   * A scroll gesture launches the menu, the same as a click or SPACE/ENTER.
   *
   * The whole point of this screen is that it has nothing to scroll, and a
   * visitor arriving from a traditional website will scroll first — out of
   * habit, before reading the prompt. On every other site that gesture means
   * "there's more below". Here it means "this is all there is", so it does
   * what they were actually reaching for and opens the menu.
   *
   * THREE THINGS MAKE THIS SAFE RATHER THAN TRIGGER-HAPPY:
   *
   * 1. The screen genuinely cannot scroll. The hero is `100svh` with
   *    `overflow: hidden` and nothing below it, so there is no content a
   *    scroll could be reaching for — the gesture is never stolen from a real
   *    scroll position. This is the whole reason it is safe, and it is also
   *    why the gesture must never be added to a page that does scroll.
   *
   * 2. A direction, an intent threshold, and a one-way lockout. A single
   *    trackpad flick arrives as a burst of momentum events, so counting
   *    events would fire on the first one and then re-fire a dozen times
   *    through the rest of the flick. Instead the gesture accumulates
   *    distance until it passes a threshold in one consistent direction, and
   *    `launchingRef` then latches it shut for good. Upward scrolls are
   *    ignored entirely: nobody scrolls up to ask for more.
   *
   * 3. It is registered passively and never calls preventDefault. Lenis
   *    owns the wheel on this site (`smoothWheel`), and a non-passive
   *    listener here would race it — the browser would wait on this handler
   *    before Lenis ever saw the event. Letting the event through untouched
   *    means the launch is purely additive: on a page that cannot scroll,
   *    Lenis has nothing to do with it either way.
   */
  useEffect(() => {
    let accumulated = 0;

    const reset = () => {
      accumulated = 0;
    };

    const onWheel = (e: WheelEvent) => {
      // `launch()` owns the latch: it sets `launchingRef` itself and returns
      // early on a second call. Setting it here first would make that guard
      // fire on the very call we meant to run, and the navigation would never
      // happen. Checking it is enough — it is the same one-way switch.
      if (launchingRef.current) return;

      // Horizontal intent belongs to a carousel or a sideways swipe, not to
      // "show me more". A diagonal trackpad swipe stays ambiguous.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return reset();

      // `deltaMode` decides the unit, and the unit is not always pixels.
      // Firefox and some Linux setups report whole LINES (~3 units) per
      // notch, where a pixel threshold would need thirty notches to trip and
      // the gesture would silently never fire. Page mode is the only one
      // already in pixels. Normalising here is what makes the threshold mean
      // the same thing on every browser.
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const delta = e.deltaY * unit;

      // Reversing direction abandons the gesture rather than cancelling the
      // distance already banked — a user who scrolls down, changes their
      // mind and scrolls back up should land back at zero, not launch.
      if (accumulated !== 0 && Math.sign(delta) !== Math.sign(accumulated)) {
        reset();
      }
      if (delta <= 0) return reset();

      // A trackpad drag across the logo is the same conflict as the touch
      // swipe, and it needs the same gate — except a `wheel` event carries no
      // target, so there is nothing to test the pointer against. It asks the
      // document instead: MzLogo3D sets the flag on real mouse movement and
      // clears it on pointerup, so this reads true only while a drag is
      // genuinely in progress.
      if (isLogoDragging()) return;

      accumulated += delta;
      if (accumulated < 90) return;

      launch("/home");
    };

    // Touch: the same gesture without a wheel event. The start screen has no
    // scroll of its own, so on a phone the only way to express "keep going"
    // is a swipe — and this is the audience the idea is really for, since a
    // phone browser is where the expectation of a scrolling page is
    // strongest. Measured in px rather than in events, for the same reason
    // the wheel path is.
    //
    // ONE EXCEPTION, and it is the 3D logo. A drag on the mark and a swipe to
    // launch are both a movement across the middle of the hero, and the logo
    // binds its own pointer handlers — so the two were competing. MzLogo3D
    // marks its canvas with `data-mz-dragging` once a drag is unambiguous, and
    // the drag wins that case.
    //
    // Which case is only a mouse or a pen, deliberately. A phone has no
    // hover, no `grab` cursor, and no fine pointer, so there is nothing to
    // tell the visitor the mark is draggable — and the upward flick is the
    // only launch gesture a phone has. If touch were gated out too, a phone
    // would lose its only way in, and the drag would win a gesture nobody
    // asked for. So touch always launches; the mouse gets the drag.
    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (isDraggingLogo(e.target)) return;
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null || launchingRef.current) return;
      if (isDraggingLogo(e.target)) return;
      const y = e.touches[0]?.clientY;
      if (y === undefined) return;
      // Finger moving UP the screen is content scrolling away, which is the
      // gesture that means "next" everywhere else.
      if (touchStartY - y < 90) return;
      touchStartY = null;
      launch("/home");
    };
    const onTouchEnd = () => {
      touchStartY = null;
    };

    // Ask for the motion sensor on the visitor's first touch, and never again.
    //
    // iOS 13+ will not deliver `deviceorientation` without an explicit grant
    // made inside a user gesture, which is the only reason this is here at all
    // — Android and desktop need no prompt and get the tilt for free. The
    // request is fire-and-forget: the mark sways on its own until a grant
    // lands, and works exactly the same if it never does.
    //
    // Two deliberate exclusions:
    //
    //   - ENTER. A tap there is a decision to leave. Putting a modal system
    //     dialog in front of someone who has already chosen to go would be the
    //     worst possible moment to ask for anything, and the page they land
    //     on does not use the sensor anyway.
    //   - Once per session. A second prompt for the same permission, after a
    //     denial, is nagging rather than asking.
    const onFirstTouch = (e: Event) => {
      if (tiltAskedRef.current) return;
      const target = e.target;
      if (target instanceof Element && target.closest("button")) return;
      tiltAskedRef.current = true;
      void requestDeviceTilt();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchstart", onFirstTouch, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // A wheel burst arrives as discrete events, and a momentum scroll can
    // pause long enough to look finished. The idle reset stops two separate
    // flicks a few seconds apart from summing into one launch, which would
    // otherwise fire on a gesture the user never made as a single movement.
    const idle = window.setInterval(reset, 400);

    return () => {
      window.clearInterval(idle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchstart", onFirstTouch);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [launch]);

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      <main ref={mainRef} className={styles.main}>

        {/* 01 — Start screen */}
        <section className={`${styles.hero} hero-section`}>
          {/* NO click-to-launch, and no `cursor: pointer` on the hero.

              The 3D logo underneath is a real drag object: MzLogo3D binds its
              own pointerdown/pointermove to spin the mark, and sets
              `cursor: grab` on hover. A section-level click handler swallows
              that — the pointer goes down, the mark starts turning, and the
              menu opens underneath it, so the drag is unusable and the logo
              is worth touching in the first place.

              The explicit Enter control below, SPACE/ENTER, and a scroll
              gesture all still open the menu, and none of them can collide
              with a drag. A click that lands on empty background now simply
              does nothing, which is the correct result: there is no target
              there, and the affordance is stated rather than implied. */}

          {/* 3D Logo — every device, deferred until the entry wipe finishes */}
          {isReadyForHeavy && MzLogo3DComponent && (
            <div
              className={`${styles.heroLogo3D} hero-logo-3d`}
              style={{
                opacity: isLogoLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
              }}
            >
              <MzLogo3DComponent
                onLoad={() => setIsLogoLoaded(true)}
                // Data is usually ready ~1.1–1.5s after load (wipe ends at
                // 1.02s). The fade-in waits for the assembly to start (one
                // short beat later) so the pre-assembly hold is never
                // visible — the logo appears mid-flight and converges as
                // the hero words land (~2.8s). 400ms keeps that window
                // tight enough that there's no "empty hero" feel.
                assemblyStartDelayMs={400}
              />
            </div>
          )}

          <div className={styles.heroContent}>
            <h1 className={styles.heroWordsRow}>
              <span className={`${styles.heroWord} hero-word ${styles.heroWordHover}`}>
                <span className="hero-word-inner">
                  <Link href="/research">
                    {reduceMotion ? "RESEARCH." : (
                      <VariableProximity
                        label="RESEARCH."
                        fromFontVariationSettings="'wght' 400"
                        toFontVariationSettings="'wght' 900"
                        containerRef={mainRef}
                        radius={200}
                        falloff="exponential"
                      />
                    )}
                  </Link>
                </span>
              </span>
              <span className={`${styles.heroWord} hero-word`}>
                <span className="hero-word-inner">
                  {reduceMotion ? "SOFTWARE." : (
                    <VariableProximity
                      label="SOFTWARE."
                      fromFontVariationSettings="'wght' 400"
                      toFontVariationSettings="'wght' 900"
                      containerRef={mainRef}
                      radius={200}
                      falloff="exponential"
                    />
                  )}
                </span>
              </span>
              <span className={`${styles.heroWord} hero-word`}>
                <span className="hero-word-inner">
                  {reduceMotion ? "KNOWLEDGE." : (
                    <VariableProximity
                      label="KNOWLEDGE."
                      fromFontVariationSettings="'wght' 400"
                      toFontVariationSettings="'wght' 900"
                      containerRef={mainRef}
                      radius={200}
                      falloff="exponential"
                    />
                  )}
                </span>
              </span>
            </h1>
            <div className={`${styles.heroSubtext} hero-subtext`}>In that order.</div>
          </div>

          <div className={`${styles.heroDescription} hero-desc`}>
            Engineered in Cairo. Owned by you. We build proprietary systems and transfer the exact knowledge you need to run them.
          </div>

          {/* Two affordances on two axes, deliberately.

              ENTER is a real <button> but draws as bare type — no frame, no
              fill — so it reads as the console's idle "press to start" line
              rather than as the page's primary action. The hit area around it
              is still comfortably larger than the word, because a target does
              not have to be visible to be real.

              The scroll cue that used to sit in the centre is gone. It taught
              the swipe that opens the menu, but on a touch device it was
              teaching a gesture the 3D logo also wants, and a 1px line was a
              poor enough bargain for that conflict. The gesture is still
              live — it is the launch handler above — and now that the mark
              takes the middle of the screen, the drag owns that space and the
              swipe owns everything around it.

              Nothing here says "click anywhere" — that handler was removed so
              it could not swallow the 3D logo's drag. These two are the whole
              advertised surface: one button, one gesture. */}
          <button
            type="button"
            className={`${styles.enterPrompt} hero-enter`}
            onClick={() => launch("/home")}
            aria-label="Enter the menu"
          >
            <span className={styles.enterLabel}>Enter</span>
          </button>

        </section>
      </main>
    </div>
  );
}
