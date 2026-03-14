import type { Trip } from "../types/flight.ts";

export const mockTrips: Trip[] = [
  {
    id: "trip-1",
    name: "London \u2192 Berlin via Frankfurt",
    legs: [
      {
        id: "leg-1a",
        flightNumber: "LH903",
        airline: { code: "LH", name: "Lufthansa", alliance: "Star Alliance" },
        origin: { code: "LHR", name: "Heathrow", city: "London" },
        destination: { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt" },
        scheduledDeparture: "2026-03-15T07:30:00Z",
        scheduledArrival: "2026-03-15T10:15:00Z",
        status: "cancelled",
      },
      {
        id: "leg-1b",
        flightNumber: "LH182",
        airline: { code: "LH", name: "Lufthansa", alliance: "Star Alliance" },
        origin: { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt" },
        destination: { code: "BER", name: "Berlin Brandenburg", city: "Berlin" },
        scheduledDeparture: "2026-03-15T12:00:00Z",
        scheduledArrival: "2026-03-15T13:10:00Z",
        status: "scheduled",
      },
    ],
  },
  {
    id: "trip-2",
    name: "Paris \u2192 London",
    legs: [
      {
        id: "leg-2a",
        flightNumber: "BA357",
        airline: { code: "BA", name: "British Airways", alliance: "Oneworld" },
        origin: { code: "CDG", name: "Charles de Gaulle", city: "Paris" },
        destination: { code: "LHR", name: "Heathrow", city: "London" },
        scheduledDeparture: "2026-03-18T14:00:00Z",
        scheduledArrival: "2026-03-18T14:45:00Z",
        actualDeparture: "2026-03-18T18:00:00Z",
        actualArrival: "2026-03-18T18:45:00Z",
        status: "delayed",
      },
    ],
  },
  {
    id: "trip-3",
    name: "London \u2192 Milan (return)",
    legs: [
      {
        id: "leg-3a",
        flightNumber: "AZ207",
        airline: { code: "AZ", name: "ITA Airways", alliance: "SkyTeam" },
        origin: { code: "LHR", name: "Heathrow", city: "London" },
        destination: { code: "MXP", name: "Malpensa", city: "Milan" },
        scheduledDeparture: "2026-03-22T09:00:00Z",
        scheduledArrival: "2026-03-22T12:05:00Z",
        status: "scheduled",
      },
      {
        id: "leg-3b",
        flightNumber: "AZ208",
        airline: { code: "AZ", name: "ITA Airways", alliance: "SkyTeam" },
        origin: { code: "MXP", name: "Malpensa", city: "Milan" },
        destination: { code: "LHR", name: "Heathrow", city: "London" },
        scheduledDeparture: "2026-03-25T17:30:00Z",
        scheduledArrival: "2026-03-25T18:35:00Z",
        actualDeparture: "2026-03-25T18:15:00Z",
        actualArrival: "2026-03-25T19:20:00Z",
        status: "delayed",
      },
    ],
  },
];
