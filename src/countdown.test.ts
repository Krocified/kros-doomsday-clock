import { describe, expect, it } from "vitest";
import { splitDuration, pad } from "./countdown.ts";

describe("splitDuration", () => {
  it("splits a known duration", () => {
    const ms = ((400 * 86400 + 3 * 3600 + 2 * 60 + 5) * 1000);
    expect(splitDuration(ms)).toEqual({ days: 400, hours: 3, minutes: 2, seconds: 5 });
  });

  it("floors sub-second and clamps negatives to zero", () => {
    expect(splitDuration(1999)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 });
    expect(splitDuration(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("pad", () => {
  it("zero-pads to two digits", () => {
    expect(pad(0)).toBe("00");
    expect(pad(9)).toBe("09");
    expect(pad(59)).toBe("59");
    expect(pad(100)).toBe("100");
  });

  it("pads days to three digits", () => {
    expect(pad(7, 3)).toBe("007");
    expect(pad(412, 3)).toBe("412");
  });
});
