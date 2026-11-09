import { Digit } from "./Digit.tsx";
import { pad, type Duration } from "./countdown.ts";

function Unit({ chars, label }: { chars: string; label: string }) {
  return (
    <div className="unit">
      <div className="tiles">
        {[...chars].map((c, i) => (
          <Digit key={i} char={c} />
        ))}
      </div>
      <span className="label">{label}</span>
    </div>
  );
}

export function Display({
  value,
  override,
}: {
  value: Duration;
  override?: string[] | null;
}) {
  const groups = override ?? [
    pad(value.days, 3),
    pad(value.hours),
    pad(value.minutes),
    pad(value.seconds),
  ];
  const label = `${value.days} days, ${value.hours} hours, ${value.minutes} minutes, ${value.seconds} seconds`;
  return (
    <div className="board" role="img" aria-label={label}>
      <Unit chars={groups[0]} label="days" />
      <Unit chars={groups[1]} label="hours" />
      <Unit chars={groups[2]} label="minutes" />
      <Unit chars={groups[3]} label="seconds" />
    </div>
  );
}
