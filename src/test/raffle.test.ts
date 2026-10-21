import { describe, it, expect } from "vitest";
import { parseNames, encodeNames, decodeNames, pickPair } from "@/lib/raffle";
import { DEFAULT_NAMES } from "@/lib/participants";

describe("raffle", () => {
  it("prefills exactly the 28 supplied participants in order", () => {
    expect(DEFAULT_NAMES).toEqual([
      "מרים מושקוביץ", "חני ברלינגר", "מלכי ראנד", "שולמית מולדובן",
      "צפורה חן", "דבורה אלטוסקי", "שרי בן שלום", "אסתר ברנר",
      "חוי גיטלר", "חני גלוזיוס", "רבקי גרינולד", "בתיה הוף",
      "אביגיל וינטר", "מירי אהרונסון", "איילת חבורה", "דסי טברסקי",
      "תמר טנצמן", "לאה יצחק", "חני כהן", "אסתר סולברג",
      "לביאה פוסטבסקי", "בת שבע פורייס", "חני פלס", "דבורי שניצר",
      "חני פרוש", "אלישבע פרידמן", "שרה צאיט", "מרים קפלן",
    ]);
    expect(parseNames(DEFAULT_NAMES.join("\n"))).toHaveLength(28);
  });
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
