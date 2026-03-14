import type { TravelerProfile } from "../types/traveler.ts";
import { mockTraveler } from "../data/mock-traveler.ts";
import { simulateApi } from "./api.ts";

export function getTravelerProfile(): Promise<TravelerProfile> {
  return simulateApi(mockTraveler);
}
