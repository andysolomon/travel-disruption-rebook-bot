import type { Claim } from "../types/claim.ts";
import { mockClaims } from "../data/mock-claims.ts";
import { simulateApi } from "./api.ts";

export function getClaims(): Promise<Claim[]> {
  return simulateApi(mockClaims);
}

export function getClaimById(id: string): Promise<Claim | undefined> {
  return simulateApi(mockClaims.find((c) => c.id === id));
}
