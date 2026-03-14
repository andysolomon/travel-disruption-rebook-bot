import { isExtraordinaryCircumstance } from "./extraordinary-circumstances.ts";

describe("isExtraordinaryCircumstance", () => {
  it("returns true for known extraordinary circumstances", () => {
    expect(isExtraordinaryCircumstance("weather")).toBe(true);
    expect(isExtraordinaryCircumstance("bird-strike")).toBe(true);
    expect(isExtraordinaryCircumstance("security-threat")).toBe(true);
  });

  it("returns false for non-extraordinary causes", () => {
    expect(isExtraordinaryCircumstance("crew-shortage")).toBe(false);
    expect(isExtraordinaryCircumstance("mechanical-failure")).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isExtraordinaryCircumstance("Weather")).toBe(false);
    expect(isExtraordinaryCircumstance("WEATHER")).toBe(false);
  });
});
