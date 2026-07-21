"use client";

import { useRef, useState, FC, useEffect } from 'react';
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const isFirstRender = useRef(true);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!navItemsRef.current || !linksRef.current) return;

    const isMobile = window.innerWidth <= 768;

    if (isOpen) {
      // Expand
      if (isMobile) {
        gsap.to(navItemsRef.current, { height: 'auto', width: 'auto', duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(linksRef.current.children,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, delay: 0.1, ease: 'power3.out' }
        );
      } else {
        gsap.to(navItemsRef.current, { width: 'auto', duration: 0.6, ease: 'power3.out' });
        gsap.fromTo(linksRef.current.children,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, delay: 0.1, ease: 'power3.out' }
        );
      }
    } else {
      // Collapse
      if (isMobile) {
        gsap.to(linksRef.current.children, { opacity: 0, y: -10, duration: 0.2, ease: 'power3.in' });
        gsap.to(navItemsRef.current, { height: 0, width: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.1 });
      } else {
        gsap.to(linksRef.current.children, { opacity: 0, x: 10, duration: 0.2, ease: 'power3.in' });
        gsap.to(navItemsRef.current, { width: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.1 });
      }
    }
  }, [isOpen]);

  return (
    <div className={`premium-nav-container ${className}`}>
      <nav className="premium-nav">
        <div className="premium-nav-items" ref={navItemsRef}>
          <ul className="premium-nav-list" ref={linksRef}>
            {items.map((item) => (
              <li key={item.href} style={{ opacity: 0 }}>
                {isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={`premium-nav-link ${activeHref === item.href ? 'is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <Link 
          href="/start" 
          className="premium-hire-btn"
          onClick={() => setIsOpen(false)}
        >
          Hire us
        </Link>

        <button 
          className={`premium-menu-toggle ${isOpen ? 'is-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="burger-line top"></span>
          <span className="burger-line bottom"></span>
        </button>
      </nav>
    </div>
  );
};

export default PillNav;
