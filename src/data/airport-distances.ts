/** Approximate great-circle distances in km between airport pairs. */
const distances: Record<string, number> = {
  "BER-FRA": 432,
  "BER-LHR": 930,
  "BER-CDG": 878,
  "BER-MXP": 845,
  "CDG-FRA": 450,
  "CDG-LHR": 340,
  "CDG-MXP": 640,
  "FRA-LHR": 660,
  "FRA-MXP": 535,
  "LHR-MXP": 960,
  "IST-LHR": 2500,
  "JFK-LHR": 5555,
};

function normalizeKey(a: string, b: string): string {
  return [a.toUpperCase(), b.toUpperCase()].sort().join("-");
}

export function getDistanceKm(origin: string, destination: string): number | undefined {
  return distances[normalizeKey(origin, destination)];
}
