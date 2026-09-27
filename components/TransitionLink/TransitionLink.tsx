"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import React from "react";
import { wantsWipe } from "@/lib/mzNav";

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Play the exit wipe, then navigate.
 *
 * Exported, and not only reachable through the component, because two kinds of
 * caller need it and only one of them is a link:
 *
 *   - An `<a>`, which is most of the site.
 *   - A programmatic navigation — `router.push` from a key handler, or a
 *     button that is not a link at all. `WorkShelf` is the case that
 *     mattered: its tiles are `role="button"` with a two-press arm/confirm
 *     interaction, so there is no anchor to hang a click handler on, and it
 *     was pushing straight to the case study with no transition. The visitor
 *     saw the legacy page slam into place while every other navigation in the
 *     launcher faded.
 *
 * The wipe decision is NOT made here. It is delegated to `wantsWipe` in
 * lib/mzNav, which is the single place that knows the site's two worlds, so a
 * caller cannot accidentally get the wrong transition by importing the wrong
 * helper — and so launcher-internal navigation keeps skipping the wipe
 * exactly as it does through the component.
 *
 * Resolves once the navigation has been committed, so a caller can await it.
 */
export async function transitionTo(router: { push: (href: string, opts?: { scroll?: boolean }) => void }, href: string) {
  const targetUrl = new URL(href, window.location.href);

  // Already here. Bail before the wipe, or the screen would cover and uncover
  // for a navigation that goes nowhere.
  if (targetUrl.pathname === window.location.pathname) return;

  // Start-screen ↔ launcher navigations never wipe: the unified background
  // stays on screen and the foreground handles its own animation.
  if (!wantsWipe(window.location.pathname, targetUrl.pathname)) {
    window.scrollTo(0, 0);
    router.push(href, { scroll: true });
    return;
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

  // Wait for the exit wipe to fully cover the screen
  await tl;

  // Force scroll to top before navigation handoff
  window.scrollTo(0, 0);

  // Now trigger the navigation — React will swap the page out underneath
  // the dark screen, and the new template.tsx will remove this overlay
  // and play the entrance wipe.
  router.push(href, { scroll: true });
}

export const TransitionLink = ({ children, href, className, style, ...props }: TransitionLinkProps) => {
  const router = useRouter();

  const handleTransition = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    // If the consumer passed an onClick (like closing a menu), call it now
    if (props.onClick) {
      props.onClick(e);
    }

    await transitionTo(router, href);
  };

  // Remove onClick from props before spreading to avoid overriding handleTransition
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onClick: _onClick, ...restProps } = props;

  return (
    <Link href={href} className={className} style={style} onClick={handleTransition} onMouseEnter={() => router.prefetch(href)} {...restProps}>
      {children}
    </Link>
  );
};
