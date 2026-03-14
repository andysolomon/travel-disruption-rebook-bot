import { getDistanceKm } from "./airport-distances.ts";

describe("getDistanceKm", () => {
  it("returns distance for a known pair", () => {
    expect(getDistanceKm("LHR", "BER")).toBe(930);
  });

  it("is bidirectional", () => {
    expect(getDistanceKm("BER", "LHR")).toBe(getDistanceKm("LHR", "BER"));
  });

  it("is case-insensitive", () => {
    expect(getDistanceKm("lhr", "ber")).toBe(930);
    expect(getDistanceKm("Lhr", "Ber")).toBe(930);
  });

  it("returns undefined for an unknown route", () => {
    expect(getDistanceKm("LHR", "SFO")).toBeUndefined();
  });

  it("returns undefined for empty strings", () => {
    expect(getDistanceKm("", "")).toBeUndefined();
  });
});
