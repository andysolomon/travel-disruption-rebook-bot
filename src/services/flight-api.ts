import type { FlightLeg, FlightStatus } from "../types/flight.ts";
import type { ISODateTime } from "../types/common.ts";

export function isRealApiAvailable(): boolean {
  return Boolean(import.meta.env.VITE_FLIGHT_API_KEY);
}

const statusMap: Record<string, FlightStatus> = {
  active: "in-air",
  landed: "landed",
  cancelled: "cancelled",
  scheduled: "scheduled",
  incident: "delayed",
  diverted: "delayed",
  unknown: "scheduled",
};

function mapStatus(apiStatus: string): FlightStatus {
  return statusMap[apiStatus] ?? "scheduled";
}

type AviationStackFlight = {
  flight_status: string;
  departure: {
    iata: string;
    airport: string;
    scheduled: string;
    actual: string | null;
  };
  arrival: {
    iata: string;
    airport: string;
    scheduled: string;
    actual: string | null;
  };
  airline: {
    iata: string;
    name: string;
  };
  flight: {
    iata: string;
  };
};

type AviationStackResponse = {
  data: AviationStackFlight[];
};

export async function fetchFlightLegs(flightNumber: string): Promise<FlightLeg[] | null> {
  const apiKey = import.meta.env.VITE_FLIGHT_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(apiKey)}&flight_iata=${encodeURIComponent(flightNumber)}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const json = await response.json() as AviationStackResponse;
    if (!json.data || json.data.length === 0) return null;

    return json.data.map((f, i) => ({
      id: `live-${flightNumber}-${i}`,
      flightNumber: f.flight.iata,
      airline: { code: f.airline.iata, name: f.airline.name },
      origin: { code: f.departure.iata, name: f.departure.airport, city: "" },
      destination: { code: f.arrival.iata, name: f.arrival.airport, city: "" },
      scheduledDeparture: f.departure.scheduled as ISODateTime,
      scheduledArrival: f.arrival.scheduled as ISODateTime,
      ...(f.departure.actual && { actualDeparture: f.departure.actual as ISODateTime }),
      ...(f.arrival.actual && { actualArrival: f.arrival.actual as ISODateTime }),
      status: mapStatus(f.flight_status),
    }));
  } catch {
    return null;
  }
}
