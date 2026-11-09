import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, WheelEvent as ReactWheelEvent } from "react";
import type { Clock } from "./countdown.ts";

const STEP = 52; // degrees between options on the arc
const RADIUS = 68; // px from dial centre
const VISIBLE = 80; // max degrees from the top slot before an option fades out

export function WheelMenu({
  clocks,
  selected,
  onSelect,
}: {
  clocks: Clock[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(0);
  const n = clocks.length;

  const move = (dir: number) => onSelect((selected + dir + n) % n);

  // Stay open once opened; close only on pick, Escape, or a click outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onWheel = (e: ReactWheelEvent) => {
    const now = Date.now();
    if (now - wheelLock.current < 120) return;
    wheelLock.current = now;
    move(e.deltaY > 0 ? 1 : -1);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="wheel" data-open={open} ref={wrapRef} onKeyDown={onKeyDown}>
      <div className="wheel-panel" aria-hidden={!open}>
        <div className="wheel-dial" onWheel={onWheel}>
          {clocks.map((c, i) => {
            const angle = (i - selected) * STEP;
            const norm = (((angle + 180) % 360) + 360) % 360 - 180;
            const shown = Math.abs(norm) <= VISIBLE;
            const rad = (angle * Math.PI) / 180;
            const x = Math.sin(rad) * RADIUS;
            const y = -Math.cos(rad) * RADIUS;
            return (
              <button
                key={c.name}
                type="button"
                className="wheel-item"
                data-active={i === selected}
                tabIndex={open ? 0 : -1}
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  opacity: shown ? 1 : 0,
                  pointerEvents: shown ? "auto" : "none",
                }}
                onClick={() => {
                  onSelect(i);
                  setOpen(false);
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="wheel-trigger"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen((o) => !o)}
      >
        {clocks[selected].name}
      </button>
    </div>
  );
}
