import type { TravelerProfile } from "../types/traveler.ts";

export const mockTraveler: TravelerProfile = {
  id: "traveler-1",
  firstName: "Elena",
  lastName: "Kowalski",
  email: "elena.kowalski@example.com",
  preferences: {
    seatPreference: "aisle",
    cabinClass: "business",
    preferredAirlines: ["LH", "LX", "OS", "SN"],
    loyaltyPrograms: [
      {
        alliance: "Star Alliance",
        tier: "Gold",
        number: "220 948 3371",
      },
    ],
    maxLayoverMinutes: 120,
  },
};
