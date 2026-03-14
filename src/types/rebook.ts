import type { FlightLeg } from "./flight.ts";
import type { CabinClass } from "./traveler.ts";
import type { MonetaryAmount } from "./common.ts";

export type ScoreComponent = {
  name: string;
  score: number;
  weight: number;
  weighted: number;
  explanation: string;
};

export type RebookScore = {
  total: number;
  components: ScoreComponent[];
};

export type RebookOption = {
  id: string;
  legs: FlightLeg[];
  cabinClass: CabinClass;
  price: MonetaryAmount;
  totalDurationMinutes: number;
  layoverMinutes?: number;
  score: RebookScore;
  rank: number;
};

export type RawAlternative = {
  id: string;
  legs: FlightLeg[];
  cabinClass: CabinClass;
  price: MonetaryAmount;
  totalDurationMinutes: number;
  layoverMinutes?: number;
};
