"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { transitionTo } from "@/components/TransitionLink/TransitionLink";

type ResearchPortalLinkProps = {
  children: ReactNode;
  className: string;
  actionClassName: string;
  title: string;
  "aria-label": string;
};

/** Expands the selected launcher tile before handing off to Research's loader. */
export default function ResearchPortalLink({
  children,
  className,
  actionClassName,
  title,
  "aria-label": ariaLabel,
}: ResearchPortalLinkProps) {
  const router = useRouter();
  const navigating = useRef(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    event.preventDefault();
    if (navigating.current) return;
    navigating.current = true;

    const source = event.currentTarget;
    if (prefersReducedMotion()) {
      void transitionTo(router, "/research");
      return;
    }

    const rect = source.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      void transitionTo(router, "/research");
      return;
    }

    const portal = source.cloneNode(true) as HTMLAnchorElement;
    portal.querySelector(`.${CSS.escape(actionClassName)}`)?.remove();
    portal.removeAttribute("href");
    portal.removeAttribute("data-tile");
    portal.setAttribute("aria-hidden", "true");
    portal.setAttribute("data-research-portal", "");

    // Canvas contents are not included by cloneNode. Freeze the live symbol
    // field into the portal copy so it remains visually continuous as it grows.
    source.querySelectorAll("canvas").forEach((canvas, index) => {
      const copy = portal.querySelectorAll("canvas")[index];
      if (!copy) return;
      copy.width = canvas.width;
      copy.height = canvas.height;
      copy.getContext("2d")?.drawImage(canvas, 0, 0);
    });

    const computed = window.getComputedStyle(source);
    Object.assign(portal.style, {
      position: "fixed",
      display: "block",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      flex: "none",
      aspectRatio: "auto",
      transform: "none",
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
      zIndex: "999999",
      pointerEvents: "none",
      willChange: "left, top, width, height, border-radius",
    });
    document.body.appendChild(portal);
    const portalCanvases = portal.querySelectorAll("canvas");
    const streamLayer = portal.querySelector<HTMLElement>("[class*='heroStream']");
    const expandedStream = streamLayer && portalCanvases[0]
      ? createExpandedStream(portalCanvases[0], rect.width, rect.height, window.innerWidth, window.innerHeight)
      : null;
    if (expandedStream && streamLayer) streamLayer.appendChild(expandedStream);

    // Build the loader surface inside the expanding card. Once the card fills
    // the viewport this fades in, then the real Research loader takes over
    // with the same paper-and-skeleton composition.
    const loaderSurface = document.createElement("div");
    Object.assign(loaderSurface.style, {
      position: "absolute",
      inset: "0",
      zIndex: "5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: researchPaperColor(),
      opacity: "0",
      pointerEvents: "none",
    });

    const loaderLines = document.createElement("div");
    Object.assign(loaderLines.style, {
      display: "flex",
      flexDirection: "column",
      gap: "0.625rem",
      width: "100%",
      maxWidth: "28rem",
      padding: "0 2rem",
      boxSizing: "border-box",
    });

    ["72%", "100%", "84%", "60%"].forEach((width) => {
      const line = document.createElement("div");
      Object.assign(line.style, {
        width,
        height: "5px",
        flex: "none",
        borderRadius: "9999px",
        background: researchInkColor(),
        opacity: "0.06",
      });
      loaderLines.appendChild(line);
    });
    loaderSurface.appendChild(loaderLines);
    portal.appendChild(loaderSurface);

    gsap.to(portal, {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: 1.05,
      ease: "power3.inOut",
      onStart: () => {
        // Crossfade the card-sized snapshot to a viewport-sized rendering.
        // The portal reveals more symbols as it grows, while each glyph stays
        // at its original CSS-pixel size instead of being stretched.
        gsap.to(portalCanvases, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
        if (expandedStream) {
          gsap.to(expandedStream, { opacity: 1, duration: 0.2, ease: "power2.out" });
        }
      },
      onComplete: () => {
        gsap.to(loaderSurface, {
          opacity: 1,
          duration: 0.42,
          ease: "power2.inOut",
          onStart: () => {
            gsap.fromTo(
              loaderLines.children,
              { opacity: 0 },
              { opacity: 0.06, duration: 0.28, stagger: 0.045, ease: "power1.out" },
            );
          },
          onComplete: () => {
            void transitionTo(router, "/research");
          },
        });
      },
    });
  };

  return (
    <Link
      href="/research"
      data-tile
      className={className}
      title={title}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

function createExpandedStream(
  source: HTMLCanvasElement,
  cardWidth: number,
  cardHeight: number,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  Object.assign(canvas.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: `${width}px`,
    height: `${height}px`,
    opacity: "0",
    pointerEvents: "none",
  });

  const context = canvas.getContext("2d");
  if (!context) return null;
  context.scale(dpr, dpr);

  const symbols = ["∫", "∑", "∂", "∇", "α", "β", "μ", "σ", "φ", "θ", "λ", "π", "∞", "≈", "≠", "≤", "≥"];
  const serif = getComputedStyle(document.documentElement).getPropertyValue("--font-serif").trim() || "serif";
  const gap = Math.max(30, Math.sqrt((width * height * 0.9) / 840));
  context.fillStyle = "rgba(26, 18, 8, 0.22)";

  // Keep the clicked card's exact symbol arrangement where it starts, then
  // continue the field beyond its edges at native size as the portal opens.
  context.drawImage(source, 0, 0, cardWidth, cardHeight);

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      if (x < cardWidth && y < cardHeight) continue;
      if (Math.random() <= 0.1) continue;
      const size = Math.floor(Math.random() * 12 + 10);
      context.font = `${size}px ${serif}`;
      context.fillText(symbols[Math.floor(Math.random() * symbols.length)], x, y);
    }
  }

  return canvas;
}

function researchPaperColor() {
  const theme = window.localStorage.getItem("research-theme");
  if (theme === "dark") return "#1e1b18";
  if (theme === "modern-light") return "#fff";
  if (theme === "modern-dark") return "#000";
  return "#f5f2ed";
}

function researchInkColor() {
  const theme = window.localStorage.getItem("research-theme");
  if (theme === "dark") return "#e6ded3";
  if (theme === "modern-light") return "#000";
  if (theme === "modern-dark") return "#fff";
  return "#111";
}
