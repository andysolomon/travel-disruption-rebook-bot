import { createContext } from "react";
import type { Claim } from "../types/claim.ts";

export type ClaimsContextValue = {
  claims: Claim[];
  addClaim: (claim: Claim) => void;
  hasClaimForDisruption: (disruptionId: string) => boolean;
};

export const ClaimsContext = createContext<ClaimsContextValue | null>(null);
