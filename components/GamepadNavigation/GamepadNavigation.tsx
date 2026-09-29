"use client";

import { useEffect } from "react";
import { resolveMove } from "@/lib/spatialNav";

const TILE_SELECTOR =
  '[data-tile], a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), iframe, [tabindex]:not([tabindex="-1"])';
const AXIS_DEADZONE = 0.55;
const MOVE_REPEAT_MS = 230;

function visibleTargets(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(TILE_SELECTOR)).filter(
    (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        !element.closest('[aria-hidden="true"], [inert]')
      );
    },
  );
}

function directionFor(gamepad: Gamepad): string | null {
  const [x = 0, y = 0] = gamepad.axes;
  const buttons = gamepad.buttons;
  const left = buttons[14]?.pressed || x < -AXIS_DEADZONE;
  const right = buttons[15]?.pressed || x > AXIS_DEADZONE;
  const up = buttons[12]?.pressed || y < -AXIS_DEADZONE;
  const down = buttons[13]?.pressed || y > AXIS_DEADZONE;

  // Prefer the strongest axis when the stick is held diagonally.
  if ((left || right) && (up || down)) {
    if (Math.abs(x) >= Math.abs(y)) return left ? "ArrowLeft" : "ArrowRight";
    return up ? "ArrowUp" : "ArrowDown";
  }
  if (left) return "ArrowLeft";
  if (right) return "ArrowRight";
  if (up) return "ArrowUp";
  if (down) return "ArrowDown";
  return null;
}

function pressButton(button: GamepadButton | undefined): boolean {
  return Boolean(button?.pressed);
}

export default function GamepadNavigation() {
  useEffect(() => {
    let frame = 0;
    let pollTimeout = 0;
    let lastDirection: string | null = null;
    let lastMoveAt = 0;
    let wasConfirmPressed = false;
    let wasBackPressed = false;
    let wasStartPressed = false;
    let wasLeftBumperPressed = false;
    let wasRightBumperPressed = false;
    let active = false;
    let hasVirtualPointer = false;
    let cursorX = 0;
    let cursorY = 0;
    let hasKnownCursor = false;
    let previousTickAt = 0;
    let cursorSuppressedUntilNeutral = false;

    const setActive = (value: boolean) => {
      active = value;
      document.documentElement.classList.toggle("mz-gamepad-active", value);
    };

    const move = (direction: string) => {
      const targets = visibleTargets();
      const focused = document.activeElement as HTMLElement | null;
      const next = resolveMove(targets, focused ?? document.body, direction);
      next?.focus({ preventScroll: false });
    };

    const iframeTargetAt = (
      iframe: HTMLIFrameElement,
      screenX: number,
      screenY: number,
    ): HTMLElement | null => {
      const doc = iframe.contentDocument;
      const view = doc?.defaultView;
      const bounds = iframe.getBoundingClientRect();
      if (!doc || !view || bounds.width === 0 || bounds.height === 0) return null;

      const x = ((screenX - bounds.left) / bounds.width) * view.innerWidth;
      const y = ((screenY - bounds.top) / bounds.height) * view.innerHeight;
      const target = doc.elementFromPoint(x, y) as HTMLElement | null;
      if (!target) return null;

      target.dispatchEvent(
        new view.MouseEvent("mousemove", { bubbles: true, clientX: x, clientY: y }),
      );
      target.dispatchEvent(
        new view.MouseEvent("mouseover", { bubbles: true, clientX: x, clientY: y }),
      );
      return target;
    };

    const activate = () => {
      if (hasVirtualPointer) {
        const pointedAt = document.elementFromPoint(cursorX, cursorY);
        const underCursor = pointedAt?.closest<HTMLElement>(TILE_SELECTOR);
        if (underCursor instanceof HTMLIFrameElement) {
          const innerTarget = iframeTargetAt(underCursor, cursorX, cursorY);
          innerTarget?.click();
          underCursor.focus({ preventScroll: true });
        } else if (underCursor && visibleTargets().includes(underCursor)) {
          underCursor.click();
        }
        return;
      }

      if (document.documentElement.dataset.arcadeOpen === "true") {
        const startButton = document
          .querySelector<HTMLIFrameElement>("[data-arcade-game]")
          ?.contentDocument?.querySelector<HTMLElement>(".ejs_start_button");
        startButton?.click();
        return;
      }

      const targets = visibleTargets();
      const focused = document.activeElement as HTMLElement | null;
      const target =
        focused && targets.includes(focused)
          ? focused
          : document.querySelector<HTMLElement>("[data-controller-default]") ?? targets[0];
      if (!target) return;
      target.focus({ preventScroll: false });
      target.click();
    };

    const navigateTab = (direction: -1 | 1) => {
      const tabs = Array.from(
        document.querySelectorAll<HTMLElement>('nav[aria-label="Sections"] a[href]'),
      );
      if (tabs.length === 0) return;

      const focusedIndex = tabs.indexOf(document.activeElement as HTMLElement);
      const activeIndex = tabs.findIndex((tab) => tab.getAttribute("aria-current") === "page");
      const currentIndex = focusedIndex >= 0 ? focusedIndex : Math.max(activeIndex, 0);
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      const next = tabs[nextIndex];
      if (!next) return;

      setActive(true);
      next.focus({ preventScroll: false });
      next.click();
    };

    const sendGamepadInput = (key: string) => {
      const detail = { key, consumed: false };
      window.dispatchEvent(new CustomEvent("mz-gamepad-input", { detail }));
      return detail.consumed;
    };

    const onExternalInput = (event: Event) => {
      if (!event.isTrusted) return;
      if (
        event.type === "keydown" ||
        event.type === "pointerdown" ||
        event.type === "mousemove"
      ) {
        setActive(false);
        cursorSuppressedUntilNeutral = true;
        hasVirtualPointer = false;
      }
    };
    const rememberPointer = (event: MouseEvent) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      hasKnownCursor = true;
    };

    const tick = (time: number) => {
      const dt = previousTickAt ? Math.min((time - previousTickAt) / 1000, 0.05) : 0;
      previousTickAt = time;
      const gamepads = navigator.getGamepads?.();
      let connected = false;

      if (gamepads) {
        for (const gamepad of Array.from(gamepads)) {
          if (!gamepad?.connected) continue;
          connected = true;
          const arcadeOpen = document.documentElement.dataset.arcadeOpen === "true";
          const direction = directionFor(gamepad);

          // Standard gamepad axes 2/3 are the right stick. Move a virtual
          // pointer independently from the left-stick spatial navigation.
          const rightX = gamepad.axes[2] ?? 0;
          const rightY = gamepad.axes[3] ?? 0;
          const rightStickActive = Math.abs(rightX) > 0.16 || Math.abs(rightY) > 0.16;
          if (!rightStickActive) cursorSuppressedUntilNeutral = false;
          if (!cursorSuppressedUntilNeutral && rightStickActive) {
            setActive(true);
            if (!hasVirtualPointer) {
              hasVirtualPointer = true;
              if (!hasKnownCursor) {
                cursorX = window.innerWidth / 2;
                cursorY = window.innerHeight / 2;
                hasKnownCursor = true;
              }
            }
            cursorX = Math.max(0, Math.min(window.innerWidth, cursorX + rightX * 900 * dt));
            cursorY = Math.max(0, Math.min(window.innerHeight, cursorY + rightY * 900 * dt));

            window.dispatchEvent(
              new MouseEvent("mousemove", {
                clientX: cursorX,
                clientY: cursorY,
              }),
            );
            window.dispatchEvent(
              new CustomEvent("mz-gamepad-cursor-move", {
                detail: { x: cursorX, y: cursorY },
              }),
            );
            const pointedAt = document.elementFromPoint(cursorX, cursorY);
            if (pointedAt) {
              pointedAt.dispatchEvent(
                new MouseEvent("mouseover", {
                  bubbles: true,
                  clientX: cursorX,
                  clientY: cursorY,
                }),
              );
              if (pointedAt instanceof HTMLIFrameElement) {
                iframeTargetAt(pointedAt, cursorX, cursorY);
              }
              const focusTarget = pointedAt.closest<HTMLElement>(TILE_SELECTOR);
              if (focusTarget && document.activeElement !== focusTarget) {
                focusTarget.focus({ preventScroll: true });
              }
            }
          }

          if (direction) {
            const consumedByCode =
              !arcadeOpen && direction !== lastDirection && sendGamepadInput(direction);
            if (!arcadeOpen && !consumedByCode && (
              direction !== lastDirection ||
              time - lastMoveAt >= MOVE_REPEAT_MS
            )) {
              setActive(true);
              move(direction);
              lastMoveAt = time;
            }
          }
          lastDirection = direction;

          // Standard Xbox mapping: A confirms, B goes back, Menu/Start
          // activates the focused item. Edge detection prevents held buttons
          // from repeatedly activating links or submitting forms.
          const confirmPressed = pressButton(gamepad.buttons[0]);
          const backPressed = pressButton(gamepad.buttons[1]);
          const leftBumperPressed = pressButton(gamepad.buttons[4]);
          const rightBumperPressed = pressButton(gamepad.buttons[5]);
          const startPressed = pressButton(gamepad.buttons[9]);

          if (
            arcadeOpen &&
            leftBumperPressed &&
            rightBumperPressed &&
            (!wasLeftBumperPressed || !wasRightBumperPressed)
          ) {
            window.dispatchEvent(new Event("mz-arcade-close"));
          }

          if (confirmPressed && !wasConfirmPressed) {
            if (arcadeOpen) {
              activate();
            } else {
              const consumedByCode = sendGamepadInput("a");
              if (!consumedByCode) {
                setActive(true);
                activate();
              }
            }
          }
          if (backPressed && !wasBackPressed) {
            const consumedByCode = sendGamepadInput("b");
            if (!consumedByCode && !arcadeOpen) {
              setActive(true);
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
            }
          }
          if (!arcadeOpen && leftBumperPressed && !wasLeftBumperPressed) navigateTab(-1);
          if (!arcadeOpen && rightBumperPressed && !wasRightBumperPressed) navigateTab(1);
          if (!arcadeOpen && startPressed && !wasStartPressed) {
            setActive(true);
            activate();
          }

          wasConfirmPressed = confirmPressed;
          wasBackPressed = backPressed;
          wasLeftBumperPressed = leftBumperPressed;
          wasRightBumperPressed = rightBumperPressed;
          wasStartPressed = startPressed;
        }
      }

      if (!connected) {
        lastDirection = null;
        wasConfirmPressed = false;
        wasBackPressed = false;
        wasLeftBumperPressed = false;
        wasRightBumperPressed = false;
        wasStartPressed = false;
        if (active) setActive(false);
      }

      if (connected) {
        frame = window.requestAnimationFrame(tick);
      } else {
        // Some browsers expose a controller only after its first button press.
        // A light poll discovers it without running a permanent animation loop.
        pollTimeout = window.setTimeout(() => tick(performance.now()), 250);
      }
    };

    window.addEventListener("keydown", onExternalInput);
    window.addEventListener("pointerdown", onExternalInput);
    window.addEventListener("mousemove", onExternalInput);
    window.addEventListener("mousemove", rememberPointer);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(pollTimeout);
      window.removeEventListener("keydown", onExternalInput);
      window.removeEventListener("pointerdown", onExternalInput);
      window.removeEventListener("mousemove", onExternalInput);
      window.removeEventListener("mousemove", rememberPointer);
      document.documentElement.classList.remove("mz-gamepad-active");
    };
  }, []);

  return null;
}
