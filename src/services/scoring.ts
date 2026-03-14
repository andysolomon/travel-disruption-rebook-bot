import type { RawAlternative } from "../types/rebook.ts";
import type { RebookScore, RebookOption, ScoreComponent } from "../types/rebook.ts";
import type { TravelerPreferences, CabinClass } from "../types/traveler.ts";
import type { ISODateTime } from "../types/common.ts";

const CABIN_ORDER: CabinClass[] = ["economy", "premium-economy", "business", "first"];

function cabinIndex(cabin: CabinClass): number {
  return CABIN_ORDER.indexOf(cabin);
}

function scoreAirlinePreference(alt: RawAlternative, preferences: TravelerPreferences): ScoreComponent {
  const preferred = preferences.preferredAirlines;
  const airlines = alt.legs.map((l) => l.airline.code);
  const allMatch = airlines.every((a) => preferred.includes(a));
  const someMatch = airlines.some((a) => preferred.includes(a));

  let score: number;
  let explanation: string;
  if (allMatch) {
    score = 100;
    explanation = "All legs on preferred airlines";
  } else if (someMatch) {
    score = 50;
    explanation = "Some legs on preferred airlines";
  } else {
    score = 0;
    explanation = "No preferred airlines";
  }

  const weight = 0.2;
  return { name: "airlinePreference", score, weight, weighted: score * weight, explanation };
}

function scoreAllianceMatch(alt: RawAlternative, preferences: TravelerPreferences): ScoreComponent {
  const loyaltyAlliances = preferences.loyaltyPrograms.map((lp) => lp.alliance);
  const alliances = alt.legs.map((l) => l.airline.alliance).filter(Boolean);
  const matches = alliances.some((a) => loyaltyAlliances.includes(a as string));

  const score = matches ? 100 : 0;
  const weight = 0.15;
  return {
    name: "allianceMatch",
    score,
    weight,
    weighted: score * weight,
    explanation: matches ? "Alliance matches loyalty program" : "No alliance match",
  };
}

function scoreCabinClass(alt: RawAlternative, preferences: TravelerPreferences): ScoreComponent {
  const prefIdx = cabinIndex(preferences.cabinClass);
  const altIdx = cabinIndex(alt.cabinClass);
  const diff = prefIdx - altIdx;

  let score: number;
  let explanation: string;
  if (diff === 0) {
    score = 100;
    explanation = "Cabin class matches preference";
  } else if (diff === 1) {
    score = 30;
    explanation = "One-step cabin downgrade";
  } else if (diff >= 2) {
    score = 0;
    explanation = "Two-step cabin downgrade";
  } else {
    score = 100;
    explanation = "Cabin upgrade from preference";
  }

  const weight = 0.2;
  return { name: "cabinClassMatch", score, weight, weighted: score * weight, explanation };
}

function scoreLayover(alt: RawAlternative, preferences: TravelerPreferences): ScoreComponent {
  const weight = 0.15;

  if (alt.layoverMinutes === undefined || alt.layoverMinutes === 0) {
    return { name: "layoverTolerance", score: 100, weight, weighted: 100 * weight, explanation: "Direct flight" };
  }

  const max = preferences.maxLayoverMinutes;
  let score: number;
  let explanation: string;

  if (alt.layoverMinutes <= max) {
    score = 100;
    explanation = `Layover ${alt.layoverMinutes}min within ${max}min tolerance`;
  } else if (alt.layoverMinutes >= max * 2) {
    score = 0;
    explanation = `Layover ${alt.layoverMinutes}min exceeds 2× tolerance`;
  } else {
    score = Math.round(100 * (1 - (alt.layoverMinutes - max) / max));
    explanation = `Layover ${alt.layoverMinutes}min partially exceeds ${max}min tolerance`;
  }

  return { name: "layoverTolerance", score, weight, weighted: score * weight, explanation };
}

function scoreDepartureProximity(alt: RawAlternative, originalDeparture: ISODateTime): ScoreComponent {
  const origTime = new Date(originalDeparture).getTime();
  const altTime = new Date(alt.legs[0].scheduledDeparture).getTime();
  const hoursDiff = Math.abs(altTime - origTime) / (1000 * 60 * 60);

  const score = Math.max(0, Math.round(100 - 10 * hoursDiff));
  const weight = 0.2;
  return {
    name: "departureProximity",
    score,
    weight,
    weighted: score * weight,
    explanation: hoursDiff === 0
      ? "Same departure time"
      : `${hoursDiff.toFixed(1)}h from original departure`,
  };
}

export function scoreAlternative(
  alt: RawAlternative,
  preferences: TravelerPreferences,
  originalDeparture: ISODateTime,
): RebookScore {
  const components = [
    scoreAirlinePreference(alt, preferences),
    scoreAllianceMatch(alt, preferences),
    scoreCabinClass(alt, preferences),
    scoreLayover(alt, preferences),
    scoreDepartureProximity(alt, originalDeparture),
  ];

  const total = Math.round(components.reduce((sum, c) => sum + c.weighted, 0));
  return { total, components };
}

function scorePriceComponent(alts: { alt: RawAlternative; partialScore: RebookScore }[]): void {
  const prices = alts.map((a) => a.alt.price.value);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  for (const entry of alts) {
    let score: number;
    let explanation: string;

    if (range === 0) {
      score = 100;
      explanation = "Single price point";
    } else {
      score = Math.round(100 * (1 - (entry.alt.price.value - minPrice) / range));
      explanation = `€${entry.alt.price.value} (range €${minPrice}–€${maxPrice})`;
    }

    const weight = 0.1;
    const component: ScoreComponent = { name: "price", score, weight, weighted: score * weight, explanation };
    entry.partialScore.components.push(component);
    entry.partialScore.total = Math.round(
      entry.partialScore.components.reduce((sum, c) => sum + c.weighted, 0),
    );
  }
}

export function rankAlternatives(
  alternatives: RawAlternative[],
  preferences: TravelerPreferences,
  originalDeparture: ISODateTime,
): RebookOption[] {
  if (alternatives.length === 0) return [];

  const scored = alternatives.map((alt) => ({
    alt,
    partialScore: scoreAlternative(alt, preferences, originalDeparture),
  }));

  scorePriceComponent(scored);

  scored.sort((a, b) => {
    if (b.partialScore.total !== a.partialScore.total) return b.partialScore.total - a.partialScore.total;
    if (a.alt.price.value !== b.alt.price.value) return a.alt.price.value - b.alt.price.value;
    const aTime = new Date(a.alt.legs[0].scheduledDeparture).getTime();
    const bTime = new Date(b.alt.legs[0].scheduledDeparture).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return a.alt.id.localeCompare(b.alt.id);
  });

  return scored.map((entry, idx) => ({
    id: entry.alt.id,
    legs: entry.alt.legs,
    cabinClass: entry.alt.cabinClass,
    price: entry.alt.price,
    totalDurationMinutes: entry.alt.totalDurationMinutes,
    layoverMinutes: entry.alt.layoverMinutes,
    score: entry.partialScore,
    rank: idx + 1,
  }));
}
