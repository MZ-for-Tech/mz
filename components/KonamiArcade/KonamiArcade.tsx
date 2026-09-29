"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./KonamiArcade.module.css";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const SONIC_ROM =
  "https://files6.retrogames.cc/MndKa1p4bHJhSmpqbEpKcENaVnJONWMrbmtMWExmN3RySjd4Z2daV0F6Wi9zMVErN09wajFJWnZoQldMZHdqMzl6dnZPRFRTdjNJOQ%3D%3D/sonic-1-contemporary.7z";
const SONIC_MANIA_EMBED =
  "https://kbhgames.com/wp-content/themes/v1/embed.php?url=https%3A%2F%2Fkdata1.com%2F5000%2F2026%2Fsonicmania%2F1.65%2F&canonical=https%3A%2F%2Fkbhgames.com%2Fgame%2Fsonic-mania-plus&w=960&h=600&pid=171080&thumb=https%3A%2F%2Fkbhgames.com%2Fwp-content%2Fuploads%2F2026%2F05%2Fsonicmania.webp&title=Sonic+Mania+Plus&agelimit=&s=no";

const GAMES = {
  mania: {
    title: "Sonic Mania Plus",
    thumbnail: "/images/games/sonic-mania-plus-cover.webp",
  },
  sonic1: {
    title: "Sonic the Hedgehog",
    thumbnail: "/images/games/sonic-1-cover.webp",
  },
} as const;

type GameId = keyof typeof GAMES;

const GAME_FRAME = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>html,body,#game{width:100%;height:100%;margin:0;overflow:hidden;background:#000}body{font-family:system-ui,sans-serif}</style>
    <script>
      var EJS_player = "#game";
      var EJS_gameUrl = "${SONIC_ROM}";
      var EJS_core = "segaMD";
      var EJS_gameName = "Sonic 1: Contemporary";
      var EJS_gameID = 44958;
      var EJS_pathtodata = "https://www.emulatorjs.com/data/";
    </script>
  </head>
  <body>
    <div id="game"></div>
    <script src="https://www.emulatorjs.com/loader.js" crossorigin></script>
  </body>
</html>`;

export default function KonamiArcade() {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const firstGameRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let progress = 0;
    const advance = (key: string) => {
      const wasTracking = progress > 0;
      if (key === CODE[progress]) {
        progress += 1;
        if (progress === CODE.length) {
          progress = 0;
          returnFocusRef.current = document.activeElement as HTMLElement | null;
          document.documentElement.dataset.arcadeOpen = "true";
          setOpen(true);
        }
        return wasTracking;
      }

      progress = key === CODE[0] ? 1 : 0;
      return false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      advance(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    };
    const onGamepadInput = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; consumed: boolean }>).detail;
      if (detail?.key) detail.consumed = advance(detail.key);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mz-gamepad-input", onGamepadInput);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mz-gamepad-input", onGamepadInput);
    };
  }, []);

  const close = useCallback(() => {
    delete document.documentElement.dataset.arcadeOpen;
    document.documentElement.classList.remove("mz-gamepad-active");
    setOpen(false);
    setSelectedGame(null);
  }, []);

  useEffect(() => {
    if (open && selectedGame) iframeRef.current?.focus({ preventScroll: true });
    else if (open) firstGameRef.current?.focus({ preventScroll: true });
    else returnFocusRef.current?.focus();
  }, [open, selectedGame]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }
      if ((event.target as HTMLElement | null)?.closest?.("button")) return;
    };
    const onArcadeClose = () => close();

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("mz-arcade-close", onArcadeClose);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("mz-arcade-close", onArcadeClose);
    };
  }, [close, open]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} data-game-active>
      <section
        className={styles.cabinet}
        role="dialog"
        aria-modal="true"
        aria-label="Secret game"
      >
        <div className={styles.screen}>
          <button
            ref={closeButtonRef}
            className={styles.close}
            onClick={close}
            aria-label="Close game"
          >
            <span aria-hidden="true">×</span>
          </button>
          {selectedGame ? (
            <iframe
              ref={iframeRef}
              className={styles.game}
              data-arcade-game
              src={selectedGame === "mania" ? SONIC_MANIA_EMBED : undefined}
              srcDoc={selectedGame === "sonic1" ? GAME_FRAME : undefined}
              title={`${GAMES[selectedGame].title} game`}
              width="600"
              height="450"
              frameBorder={0}
              allowFullScreen
              scrolling="no"
              allow="cross-origin-isolated; gamepad"
              tabIndex={0}
              onLoad={() => iframeRef.current?.focus({ preventScroll: true })}
            />
          ) : (
            <div className={styles.picker} aria-label="Choose a game">
              {(Object.keys(GAMES) as GameId[]).map((game, index) => (
                <button
                  key={game}
                  ref={index === 0 ? firstGameRef : undefined}
                  className={styles.gameChoice}
                  type="button"
                  data-tile
                  aria-label={`Play ${GAMES[game].title}`}
                  onClick={() => setSelectedGame(game)}
                >
                  <Image
                    className={styles.thumbnail}
                    src={GAMES[game].thumbnail}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 44vw, 405px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
