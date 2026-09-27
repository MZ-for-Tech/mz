"use client";

import { useSyncExternalStore } from "react";
import styles from "./LocalClock.module.css";

/**
 * A live clock for the studio's own timezone.
 *
 * Cairo (UTC+3, no DST) rather than the viewer's. A clock showing the
 * visitor's local time would be a widget about them; this one is a statement
 * about where the work happens, which is the thing worth putting on screen.
 *
 * Formatted in an explicit `en-GB` locale with an explicit timeZone, so the
 * output depends on neither the browser's locale nor its ICU data.
 */
function formatIn(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

/* A clock is by definition never the same on the server and on the client, so
 * any render that computes one during hydration is a mismatch by construction.
 * A lazy `useState` initializer guarded by `typeof window` does not avoid that,
 * it just moves the disagreement: the server emits the placeholder and the
 * first client render emits a real time, and React is right to complain.
 *
 * `useSyncExternalStore` is the pattern that actually fits, because a clock IS
 * an external store — something outside React that React subscribes to. The
 * server snapshot and the hydration snapshot are both the placeholder, so the
 * two agree exactly; the real store is only read once the client has mounted,
 * and the subscription is the thing that starts the timer.
 *
 * Reading the current time inside `getSnapshot` keeps this a genuine store
 * rather than a hook that fakes one: the component never holds a copy that can
 * go stale, and there is no cascading render to pay for. `Date.now()` is
 * floor'd to the second, so a re-render mid-second returns the identical
 * string and the snapshot stays referentially stable — without that, every
 * unrelated re-render would tear a clock that updates in whole seconds. */
function subscribe(onChange: () => void) {
  // Align to the next whole second, then tick. Starting at a raw 1000ms
  // interval means the displayed second can sit a fraction behind the wall
  // clock, which is visible on a readout whose entire job is to be right.
  let interval: number | undefined;
  const timeout = window.setTimeout(() => {
    onChange();
    interval = window.setInterval(onChange, 1000);
  }, 1000 - (Date.now() % 1000));

  return () => {
    window.clearTimeout(timeout);
    if (interval !== undefined) window.clearInterval(interval);
  };
}

const PLACEHOLDER = "--:--:--";

export function LocalClock({
  timeZone = "Africa/Cairo",
  className,
}: {
  timeZone?: string;
  className?: string;
}) {
  const time = useSyncExternalStore(
    subscribe,
    () => formatIn(timeZone),
    () => PLACEHOLDER
  );

  return (
    <div className={className ? `${styles.clock} ${className}` : styles.clock}>
      {/* Tabular figures: a proportional clock shifts the whole cluster
          sideways every time the digit widths change, which at 1Hz is a
          visible twitch. */}
      <span className={styles.time}>{time}</span>
      <span className={styles.zone}>Cairo</span>
    </div>
  );
}
