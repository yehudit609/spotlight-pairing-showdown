import { describe, it, expect } from "vitest";
import { parseNames, encodeNames, decodeNames, pickPair } from "@/lib/raffle";

describe("raffle", () => {
  it("filters empty lines and duplicates", () => {
    expect(parseNames("דנה\n\n  דנה \nרון\n")).toEqual(["דנה", "רון"]);
  });
  it("round-trips Hebrew names through the link", () => {
    const n = ["שרה כהן", "יעל"];
    expect(decodeNames(encodeNames(n))).toEqual(n);
  });
  it("always picks two different, unused names", () => {
    const names = ["א", "ב", "ג", "ד"];
    for (let k = 0; k < 200; k++) {
      const p = pickPair(names, ["א"])!;
      expect(p[0]).not.toBe(p[1]);
      expect(p).not.toContain("א");
    }
  });
  it("returns null when only one participant remains", () => {
    expect(pickPair(["א", "ב", "ג"], ["א", "ב"])).toBeNull();
  });
});
