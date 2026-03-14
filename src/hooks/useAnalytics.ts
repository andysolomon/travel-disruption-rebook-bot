import { useCallback } from "react";

type AnalyticsEvent =
  | { type: "claim_generated"; claimId: string }
  | { type: "scenario_changed"; scenarioId: string }
  | { type: "rebook_option_viewed"; optionId: string }
  | { type: "claim_detail_viewed"; claimId: string };

export default function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent) => {
    if (import.meta.env.DEV) {
      console.info("[analytics]", event.type, event);
    }
  }, []);

  return { track };
}
