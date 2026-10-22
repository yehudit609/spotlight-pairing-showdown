import { describe, it, expect } from "vitest";
import { patternFor, TOTAL_ROUNDS } from "@/lib/rhythm";

describe("countdown rhythm", () => {
  it("keeps every hit inside its own second, in order, and audible", () => {
    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      const hits = patternFor(round);
      expect(hits.length).toBeGreaterThanOrEqual(2);
      hits.forEach((h, i) => {
        expect(h.at).toBeGreaterThanOrEqual(0);
        expect(h.at).toBeLessThan(1);
        expect(h.gain).toBeGreaterThan(0);
        expect(h.gain).toBeLessThanOrEqual(1);
        if (i > 0) expect(h.at).toBeGreaterThan(hits[i - 1]!.at);
      });
    }
  });

  it("gets busier as the countdown runs out", () => {
    const counts = Array.from({ length: TOTAL_ROUNDS }, (_, i) => patternFor(TOTAL_ROUNDS - i).length);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]!).toBeGreaterThanOrEqual(counts[i - 1]!);
    }
    expect(patternFor(10).length).toBe(2);
    expect(patternFor(1).length).toBeGreaterThan(patternFor(2).length);
    expect(patternFor(1).length).toBeGreaterThanOrEqual(12);
  });

  it("grows louder across the final second", () => {
    const finale = patternFor(1);
    expect(finale[finale.length - 1]!.gain).toBeGreaterThan(finale[0]!.gain);
  });
});
