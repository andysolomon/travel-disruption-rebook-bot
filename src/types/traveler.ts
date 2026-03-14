export type SeatPreference = "window" | "aisle" | "middle" | "no-preference";

export type CabinClass = "economy" | "premium-economy" | "business" | "first";

export type LoyaltyProgram = {
  alliance: string;
  tier: string;
  number: string;
};

export type TravelerPreferences = {
  seatPreference: SeatPreference;
  cabinClass: CabinClass;
  preferredAirlines: string[];
  loyaltyPrograms: LoyaltyProgram[];
  maxLayoverMinutes: number;
};

export type TravelerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  preferences: TravelerPreferences;
};
