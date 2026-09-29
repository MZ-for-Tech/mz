"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient tilt from the device's own motion sensors.
 *
 * This is the mobile counterpart to the mark's existing mouse parallax. On
 * desktop the logo already leans toward the cursor via `state.pointer` in
 * MzLogo3D's frame loop; a phone has no cursor, and tilting the device is the
 * same idea expressed with the body instead of a hand. It is deliberately NOT
 * an extension of the drag: the drag writes into `dragRotation` (a persistent
 * spin that decays), while this returns a bounded per-frame value that the
 * parallax term reads. They are different axes and cannot collide, which is
 * what keeps the swipe-to-launch conflict resolved as it is.
 *
 * WHY THE GESTURE ARITHMETIC IS DELIBERATELY BLUNT:
 *
 * `DeviceOrientationEvent` reports absolute orientation (beta/gamma in
 * degrees, -180..180) on a device that is flat on a table as some fixed
 * number, not zero. So the raw reading is only meaningful relative to however
 * the visitor happened to be holding the phone. Rather than calibrate against
 * an assumed neutral, this takes the FIRST reading as neutral and reports the
 * change from it. That is the gesture the visitor already performs: pick the
 * phone up, hold it however you like, and it leans from there. It also means
 * the mark is at rest on arrival, instead of snapping to an absolute angle
 * when the first event fires.
 *
 * Returns zero for both axes until a reading arrives, so the mark sits in its
 * existing neutral pose on a device that never reports (or is denied) — no
 * special case at the call site, and no visual change for a desktop browser
 * that does not implement the API at all.
 */
export function useDeviceTilt() {
  const tilt = useRef({ x: 0, y: 0 });
  const neutral = useRef<{ beta: number; gamma: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;

    // iOS 13+ gates the sensor behind an explicit grant that is only valid
    // inside a user gesture — see `requestDeviceTilt` for when that is asked
    // for. Until that grant lands no events are delivered, so subscribing
    // here is harmless and this listener simply never fires.
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      if (!neutral.current) {
        neutral.current = { beta: e.beta, gamma: e.gamma };
        return;
      }

      // Small phone movements should move the mark immediately. Ignore a
      // fraction of a degree of sensor drift, then reach full input after an
      // 8° tilt: that makes an ordinary wrist adjustment visible without
      // needing an exaggerated phone movement.
      const dBeta = e.beta - neutral.current.beta;
      const dGamma = e.gamma - neutral.current.gamma;
      tilt.current.x = normalizeTilt(dGamma);
      tilt.current.y = normalizeTilt(dBeta);
    };

    window.addEventListener("deviceorientation", onOrientation, { passive: true });

    // Re-neutralise on screen change: the angle a visitor holds the phone at
    // in portrait is not the angle they hold it at in landscape, and without
    // this the mark stays leaning after a rotation.
    const onOrientationChange = () => {
      neutral.current = null;
    };
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  return tilt;
}

/**
 * Ask for the motion sensor, if the platform requires asking.
 *
 * Only iOS has this gate, and it is why the call has to happen inside a real
 * user gesture — the browser rejects it from a timer, an effect, or anything
 * else outside the event. Android and every desktop browser report orientation
 * without a grant, so this is a no-op there.
 *
 * Safe to call unconditionally and safe to call twice: the second call after
 * a grant is a no-op, and a rejected call resolves without throwing. Returns
 * whether the sensor is now live, so a caller can avoid asking again.
 */
export async function requestDeviceTilt(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("DeviceOrientationEvent" in window)) return false;

  const DOE = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<"granted" | "denied">;
  };

  if (typeof DOE.requestPermission !== "function") {
    // No gate on this platform — events are already flowing.
    return true;
  }

  try {
    const result = await DOE.requestPermission();
    return result === "granted";
  } catch {
    // The call throws if it somehow lands outside a user gesture. Treated as
    // "not available" rather than as an error worth surfacing: the mark works
    // fine without the sensor.
    return false;
  }
}

// A local clamp so this module has no dependency on three.js. These values
// are a plain normalised device reading, not a vec3, and importing the whole
// library for one min/max would pull three into a hook that otherwise has
// none.
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeTilt(degrees: number): number {
  const deadZone = 0.35;
  const responsiveDegrees = Math.sign(degrees) * Math.max(0, Math.abs(degrees) - deadZone);
  return clamp(responsiveDegrees / 8, -1, 1);
}
