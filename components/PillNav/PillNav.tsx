"use client";

import { useRef, useState, FC } from 'react';
import { TransitionLink as Link } from '@/components/TransitionLink/TransitionLink';
import { gsap } from 'gsap';
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
  onMobileMenuClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLUListElement>(null);
  const desktopNavItemsRef = useRef<HTMLDivElement>(null);
  const desktopLinksRef = useRef<HTMLUListElement>(null);

  const toggleDesktopMenu = () => {
    const nextState = !isDesktopMenuOpen;
    setIsDesktopMenuOpen(nextState);

    if (desktopNavItemsRef.current && desktopLinksRef.current) {
      if (nextState) {
        // Expand
        gsap.to(desktopNavItemsRef.current, { width: 'auto', duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(desktopLinksRef.current.children,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, delay: 0.1, ease: 'power3.out' }
        );
      } else {
        // Collapse
        gsap.to(desktopLinksRef.current.children, { opacity: 0, x: 10, duration: 0.2, ease: 'power3.in' });
        gsap.to(desktopNavItemsRef.current, { width: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.1 });
      }
    }
  };

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen;
    setIsMobileMenuOpen(nextState);
    onMobileMenuClick?.();

    if (nextState) {
      // Open animation
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        ease: 'power3.out'
      });
      
      if (mobileLinksRef.current) {
        const links = mobileLinksRef.current.children;
        gsap.fromTo(links, 
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
        );
      }
    } else {
      // Close animation
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4,
        ease: 'power3.in'
      });
    }
  };

  return (
    <>
      {/* Desktop Expanding Glass Pill */}
      <div className={`premium-nav-container desktop-only ${className}`}>
        <nav className="premium-nav">
          <div className="premium-nav-items" ref={desktopNavItemsRef}>
            <ul className="premium-nav-list" ref={desktopLinksRef}>
              {items.map((item) => (
                <li key={item.href} style={{ opacity: 0 }}>
                  {isRouterLink(item.href) ? (
                    <Link
                      href={item.href}
                      className={`premium-nav-link ${activeHref === item.href ? 'is-active' : ''}`}
                      aria-label={item.ariaLabel || item.label}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={`premium-nav-link ${activeHref === item.href ? 'is-active' : ''}`}
                      aria-label={item.ariaLabel || item.label}
                      target={item.href.startsWith('http') ? '_blank' : '_self'}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : ''}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <button 
            className="premium-menu-toggle"
            onClick={toggleDesktopMenu}
            aria-label="Toggle menu"
          >
            {isDesktopMenuOpen ? 'CLOSE' : 'MENU'}
          </button>
        </nav>
      </div>

      {/* Mobile Floating Button */}
      <div className={`premium-mobile-btn-container mobile-only ${className}`}>
        <button 
          className={`premium-mobile-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="burger-line top"></span>
          <span className="burger-line bottom"></span>
        </button>
      </div>

      {/* Mobile Fullscreen Glass Overlay */}
      <div className="premium-mobile-overlay" ref={overlayRef}>
        <div className="premium-mobile-overlay-bg"></div>
        <nav className="premium-mobile-nav">
          <ul className="premium-mobile-list" ref={mobileLinksRef}>
            {items.map((item) => (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={`premium-mobile-link ${activeHref === item.href ? 'is-active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`premium-mobile-link ${activeHref === item.href ? 'is-active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default PillNav;
