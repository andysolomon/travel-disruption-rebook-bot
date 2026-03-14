import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { Claim } from "../types/claim.ts";
import { mockClaims } from "../data/mock-claims.ts";
import { ClaimsContext } from "./claims-context-value.ts";
import { getStored, setStored, STORAGE_KEYS } from "../services/storage.ts";

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<Claim[]>(
    () => getStored<Claim[]>(STORAGE_KEYS.CLAIMS) ?? mockClaims,
  );

  useEffect(() => {
    setStored(STORAGE_KEYS.CLAIMS, claims);
  }, [claims]);

  const addClaim = useCallback((claim: Claim) => {
    setClaims((prev) => [...prev, claim]);
  }, []);

  const hasClaimForDisruption = useCallback(
    (disruptionId: string) => claims.some((c) => c.disruptionId === disruptionId),
    [claims],
  );

  return (
    <ClaimsContext.Provider value={{ claims, addClaim, hasClaimForDisruption }}>
      {children}
    </ClaimsContext.Provider>
  );
}
