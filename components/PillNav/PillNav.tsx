"use client";

import { useEffect, useRef, useState, FC, CSSProperties } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './PillNav.css';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {

  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const isExternalLink = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('//') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.startsWith('#');

const isRouterLink = (href?: string) => href && !isExternalLink(href);

const PillNav: FC<PillNavProps> = ({

  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobileMenuOpenRef = useRef(isMobileMenuOpen);
  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  
  // Desktop Refs
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const navItemsRef = useRef<HTMLDivElement | null>(null);


  // Mobile Refs
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const mobileContentRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);


  useEffect(() => {
    // Desktop layout effect
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    const initialFrameRef = requestAnimationFrame(() => {
      layout();
    });

    const onResize = () => {
      layout();
      
      // Reset mobile menu on resize to avoid stuck states
      if (window.innerWidth > 768 && isMobileMenuOpenRef.current) {
        setIsMobileMenuOpen(false);
        if (mobileNavRef.current) gsap.set(mobileNavRef.current, { height: 60 });
        const hamburger = hamburgerRef.current;
        if (hamburger) {
          const lines = hamburger.querySelectorAll('.hamburger-line');
          gsap.set(lines[0], { rotation: 0, y: 0 });
          gsap.set(lines[1], { rotation: 0, y: 0 });
        }
      }
    };
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(layout);
      }).catch(() => {});
    }

    if (initialLoadAnimation) {
      const navItems = navItemsRef.current;

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        // Removed auto-expand so it stays collapsed by default
      }
    }

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(initialFrameRef);
    };
  }, [items, ease, initialLoadAnimation]);

  const toggleDesktopMenu = () => {
    const nextState = !isDesktopMenuOpen;
    setIsDesktopMenuOpen(nextState);

    const el = navItemsRef.current;
    if (!el) return;

    if (nextState) {
      gsap.to(el, { width: 'auto', duration: 0.6, ease });
    } else {
      gsap.to(el, { width: 0, duration: 0.6, ease });
    }
  };

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };



  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const nav = mobileNavRef.current;
    const content = mobileContentRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (nav && content) {
      if (newState) {
        // Expand
        content.style.visibility = 'visible';
        content.style.pointerEvents = 'auto';
        
        // Calculate needed height
        const contentHeight = content.scrollHeight;
        const totalHeight = 60 + contentHeight + 16; // 60 top bar + content + padding
        
        gsap.to(nav, { height: totalHeight, duration: 0.4, ease });
        
        const links = content.querySelectorAll('.mobile-menu-link');
        gsap.fromTo(links, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1, ease }
        );
      } else {
        // Collapse
        gsap.to(nav, { height: 60, duration: 0.4, ease });
        
        const links = content.querySelectorAll('.mobile-menu-link');
        gsap.to(links, { 
          y: 10, 
          opacity: 0, 
          duration: 0.2, 
          ease,
          onComplete: () => {
            content.style.visibility = 'hidden';
            content.style.pointerEvents = 'none';
          }
        });
      }
    }

    onMobileMenuClick?.();
  };



  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor
  } as CSSProperties;

  return (
    <div className="pill-nav-container">
      {/* --- DESKTOP NAV --- */}
      <nav className={`pill-nav desktop-only ${className}`} aria-label="Primary Desktop" style={cssVars}>


        <div className="pill-nav-items" ref={navItemsRef} style={{ width: 0, overflow: 'hidden' }}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.href} role="none">
                {isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="pill-menu-toggle" 
          onClick={toggleDesktopMenu}
          aria-label="Toggle Menu"
          aria-expanded={isDesktopMenuOpen}
        >
          {isDesktopMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
        <ThemeToggle />
      </nav>

      {/* --- MOBILE NAV (CardNav expanding pattern) --- */}
      <nav className={`mobile-pill-nav mobile-only ${isMobileMenuOpen ? 'open' : ''} ${className}`} ref={mobileNavRef} style={cssVars}>
        <div className="mobile-pill-nav-top">

          <div style={{ flex: 1 }}></div>

          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>

        <div className="mobile-pill-nav-content" ref={mobileContentRef} aria-hidden={!isMobileMenuOpen}>
          <ul className="mobile-menu-list">
            {items.map(item => (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
            <li className="mobile-theme-toggle-container">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PillNav;
