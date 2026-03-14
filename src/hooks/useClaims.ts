import { useContext } from "react";
import { ClaimsContext } from "../context/claims-context-value.ts";

export function useClaims() {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx;
}
