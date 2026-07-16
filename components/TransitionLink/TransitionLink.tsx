"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import React from "react";

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  style?: React.CSSProperties;
}

export const TransitionLink = ({ children, href, className, style, ...props }: TransitionLinkProps) => {
  const router = useRouter();

  const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    
    const targetUrl = new URL(href, window.location.href);
    if (targetUrl.pathname === window.location.pathname) {
      return; // Already on this page
    }

    const columns = 5;
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.pointerEvents = "none";
    container.style.zIndex = "999999";
    container.style.display = "flex";
    container.setAttribute("data-transition-exit", ""); // Template.tsx will remove this

    const cols: HTMLDivElement[] = [];

    for (let i = 0; i < columns; i++) {
      const col = document.createElement("div");
      col.style.position = "absolute";
      col.style.left = `${(100 / columns) * i}%`;
      col.style.width = `calc(${100 / columns}% + 1px)`; // +1px to prevent subpixel gaps
      col.style.height = "130vh"; 
      col.style.transform = "translateY(100vh)";
      col.style.display = "flex";
      col.style.flexDirection = "column";
      
      const accentTop = document.createElement("div");
      accentTop.style.height = "15vh";
      accentTop.style.backgroundColor = "var(--color-brand-yellow)";
      accentTop.style.width = "100%";
      
      const primary = document.createElement("div");
      primary.style.height = "100vh";
      primary.style.backgroundColor = "var(--color-bg)";
      primary.style.width = "100%";

      const accentBottom = document.createElement("div");
      accentBottom.style.height = "15vh";
      accentBottom.style.backgroundColor = "var(--color-brand-yellow)";
      accentBottom.style.width = "100%";

      col.appendChild(accentTop);
      col.appendChild(primary);
      col.appendChild(accentBottom);
      
      cols.push(col);
      container.appendChild(col);
    }

    document.body.appendChild(container);

    const tl = gsap.timeline();
    
    // Sweep UP: Olive enters first, followed by Dark.
    // Ends at -15vh so the Olive stripe goes off the top edge, leaving Dark covering the screen.
    tl.to(cols, {
      y: "-15vh",
      duration: 0.9,
      ease: "power4.inOut",
      stagger: 0.04,
    });

    await tl.play();
    
    // Force scroll to top before navigation handoff
    window.scrollTo(0, 0);
    router.push(href, { scroll: true });
  };

  return (
    <Link href={href} className={className} style={style} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
};
