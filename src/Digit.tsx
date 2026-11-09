import { useEffect, useState } from "react";

// ponytail: read once at module load; reduced-motion pref rarely flips live.
const reduced =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Digit({ char }: { char: string }) {
  const [current, setCurrent] = useState(char);
  const [next, setNext] = useState(char);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (char === current || flipping) return;
    if (reduced) {
      setCurrent(char);
      return;
    }
    setNext(char);
    setFlipping(true);
  }, [char, current, flipping]);

  return (
    <div className="digit" aria-hidden="true">
      <div className="half cliptop">
        <span className="g">{flipping ? next : current}</span>
      </div>
      <div className="half clipbottom">
        <span className="g">{current}</span>
      </div>
      {flipping && (
        <div
          className="digit__flap"
          onAnimationEnd={() => {
            setCurrent(next);
            setFlipping(false);
          }}
        >
          <div className="half cliptop">
            <span className="g">{current}</span>
          </div>
          <div className="half clipbottom digit__flap-back">
            <span className="g">{next}</span>
          </div>
        </div>
      )}
    </div>
  );
}
