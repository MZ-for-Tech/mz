"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DarkVeil, { DARKVEIL_THEME } from "@/components/DarkVeil/DarkVeil";
import styles from "./SiteBackground.module.css";

/**
 * Site-wide DarkVeil background.
 *
 * Mounted once from the root layout, so it is the only WebGL context that
 * lives for the whole session — the start screen, the launcher and every
 * panel share it instead of each owning a copy. Content moves; this does not.
 *
 * It is held back until the entry wipe finishes (same gating the hero used to
 * do) so the shader is never seen mid-reveal.
 *
 * IT IS SWITCHED OFF ON /privacy
 *
 * The shader is the studio's signature, and a policy page is the one place
 * on the site that should not have it. Everything else here — the launcher,
 * the panels, the start screen — is an argument, and the background is part
 * of the argument. A privacy policy is a document: it has to be read, and
 * the moving gold is a live, high-contrast element directly behind body copy
 * the whole way down.
 *
 * So on that route the canvas is never mounted at all — not faded out, not
 * paused, unmounted. That is a real saving rather than a cosmetic one: it
 * is the site's single WebGL context, so a visitor reading the policy
 * spends that time with no GL context, no shader program and no RAF loop
 * alive at all. The page falls back to the `body` background
 * (`--color-bg`, #0D0F08), which is the same near-black the shader sits on,
 * so the only visible difference is that the type stops moving.
 *
 * The check is a path prefix rather than an equality so a future
 * `/privacy/cookies` or similar inherits the decision without a second
 * branch.
 */
const PLAIN_ROUTES = ["/privacy"];

export default function SiteBackground() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  const isPlain = PLAIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    // A route that never shows the shader has nothing to gate. Returning
    // here rather than resetting `mounted`/`visible` is deliberate: the
    // render below already refuses to mount the canvas unless `mounted`, and
    // resetting two pieces of state to the values they were cleared to
    // would be a second source of truth for "is the shader on this route".
    if (isPlain) return;

    let r1 = 0;
    let r2 = 0;

    const onReady = () => {
      setMounted(true);
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setVisible(true));
      });
    };

    window.addEventListener("mz-transition-done", onReady, { once: true });
    // Fallback in case the event fired before this mounted.
    const timer = setTimeout(onReady, 1500);

    return () => {
      window.removeEventListener("mz-transition-done", onReady);
      clearTimeout(timer);
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [isPlain]);

  /* The canvas is mounted only where it is wanted AND already unlocked, so
     a plain route never creates the WebGL context in the first place —
     there is no state to reset, and no moment where it exists and is then
     torn down. */
  const showCanvas = mounted && !isPlain;

  return (
    <div
      className={styles.background}
      data-visible={showCanvas && visible ? "" : undefined}
      data-plain={isPlain ? "" : undefined}
      aria-hidden="true"
    >
      {showCanvas && <DarkVeil {...DARKVEIL_THEME} resolutionScale={0.75} />}
    </div>
  );
}
