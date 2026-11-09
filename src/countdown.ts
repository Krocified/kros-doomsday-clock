export interface Clock {
  name: string;
  date: Date;
}

export const CLOCKS: Clock[] = [
  { name: "Japan", date: new Date("2027-04-14T00:00:00") },
  { name: "Malaysia", date: new Date("2026-12-04T00:00:00") },
];

export interface Duration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ponytail: floor to whole seconds so the display never jumps a unit early.
export function splitDuration(ms: number): Duration {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export const pad = (n: number, width = 2) => String(n).padStart(width, "0");
