/** ISO 8601 datetime string */
export type ISODateTime = string;

/** 3-letter IATA airport code */
export type IATACode = string;

/** 2-letter IATA airline code */
export type AirlineCode = string;

export type Currency = "EUR" | "GBP" | "USD";

export type MonetaryAmount = {
  value: number;
  currency: Currency;
};
