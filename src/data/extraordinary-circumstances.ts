export const extraordinaryCircumstances: readonly string[] = [
  "weather",
  "air-traffic-control",
  "security-threat",
  "political-instability",
  "bird-strike",
  "hidden-manufacturing-defect",
] as const;

export function isExtraordinaryCircumstance(cause: string): boolean {
  return extraordinaryCircumstances.includes(cause);
}
