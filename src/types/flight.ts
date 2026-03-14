import type { IATACode, AirlineCode, ISODateTime } from "./common.ts";

export type Airport = {
  code: IATACode;
  name: string;
  city: string;
};

export type Airline = {
  code: AirlineCode;
  name: string;
  alliance?: string;
};

export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "in-air"
  | "landed"
  | "delayed"
  | "cancelled";

export type FlightLeg = {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: Airport;
  destination: Airport;
  scheduledDeparture: ISODateTime;
  scheduledArrival: ISODateTime;
  actualDeparture?: ISODateTime;
  actualArrival?: ISODateTime;
  status: FlightStatus;
};

export type Trip = {
  id: string;
  name: string;
  legs: FlightLeg[];
};
