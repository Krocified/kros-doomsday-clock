import { useEffect, useRef, useState } from "react";
import { Digit } from "./Digit.tsx";
import { clack } from "./audio.ts";

const WORD = "ELAPSED";
const STEP = 140;

export function ElapsedWord({ sound }: { sound: boolean }) {
  const [chars, setChars] = useState(() => WORD.split("").map(() => " "));
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    const timers = WORD.split("").map((target, i) =>
      window.setTimeout(() => {
        setChars((prev) => {
          const next = [...prev];
          next[i] = target;
          return next;
        });
        if (soundRef.current) clack();
      }, 200 + i * STEP),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="board" role="img" aria-label="elapsed">
      {chars.map((c, i) => (
        <Digit key={i} char={c} />
      ))}
    </div>
  );
}
