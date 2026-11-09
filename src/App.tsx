import { useEffect, useRef, useState } from "react";
import { CLOCKS, splitDuration } from "./countdown.ts";
import { Display } from "./Display.tsx";
import { ElapsedWord } from "./ElapsedWord.tsx";
import { WheelMenu } from "./WheelMenu.tsx";
import { tickTock, toll, unlock } from "./audio.ts";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return target.getTime() - now;
}

// Random-flip: after a selection, scramble every tile, then settle on the real value.
function useScramble(trigger: number): string[] | null {
  const [chars, setChars] = useState<string[] | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const widths = [3, 2, 2, 2];
    const rand = () =>
      widths.map((len) =>
        Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join(""),
      );
    setChars(rand());
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      setChars(rand());
      if (step >= 6) clearInterval(id);
    }, 160);
    // settle a beat after the last scramble so no digit is mid-flip and dropped
    const settle = setTimeout(() => setChars(null), 6 * 160 + 220);
    return () => {
      clearInterval(id);
      clearTimeout(settle);
    };
  }, [trigger]);

  return chars;
}

export default function App() {
  const [selected, setSelected] = useState(0);
  const [sound, setSound] = useState(false);
  const alternate = useRef(false);
  const first = useRef(true);
  const tolled = useRef(false);

  const target = CLOCKS[selected].date;
  const remaining = useCountdown(target);
  const elapsed = remaining <= 0;
  const scramble = useScramble(selected);
  const seconds = Math.floor(remaining / 1000);

  useEffect(() => {
    tolled.current = false;
  }, [selected]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!sound || elapsed) return;
    alternate.current = !alternate.current;
    tickTock(alternate.current);
  }, [seconds, sound, elapsed]);

  useEffect(() => {
    if (!elapsed || tolled.current) return;
    tolled.current = true;
    if (sound) toll();
  }, [elapsed, sound]);

  const body = elapsed ? (
    <ElapsedWord sound={sound} />
  ) : (
    <Display value={splitDuration(remaining)} override={scramble} />
  );

  return (
    <main className="app-bg flex min-h-screen items-center justify-center p-6">
      <div className="casing">{body}</div>
      <WheelMenu clocks={CLOCKS} selected={selected} onSelect={setSelected} />
      <button
        type="button"
        className="sound-toggle"
        aria-pressed={sound}
        onClick={() => {
          if (!sound) unlock();
          setSound((s) => !s);
        }}
      >
        {sound ? "sound on" : "sound off"}
      </button>
    </main>
  );
}
