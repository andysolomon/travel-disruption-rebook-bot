import { render, screen } from "@testing-library/react";
import EligibilityCard from "./EligibilityCard.tsx";
import type { EligibilityResult } from "../types/disruption.ts";

describe("EligibilityCard", () => {
  it("renders status pill", () => {
    const eligibility: EligibilityResult = {
      regulation: "EU261",
      status: "eligible",
      reason: "Compensation is due.",
    };
    render(<EligibilityCard eligibility={eligibility} />);
    expect(screen.getByText("eligible")).toBeInTheDocument();
  });

  it("renders regulation", () => {
    const eligibility: EligibilityResult = {
      regulation: "EU261",
      status: "eligible",
      reason: "Test",
    };
    render(<EligibilityCard eligibility={eligibility} />);
    expect(screen.getByText("EU261")).toBeInTheDocument();
  });

  it("renders payout when present", () => {
    const eligibility: EligibilityResult = {
      regulation: "EU261",
      status: "eligible",
      estimatedPayout: { value: 400, currency: "EUR" },
      reason: "Test",
    };
    render(<EligibilityCard eligibility={eligibility} />);
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
    expect(screen.getByText(/400/)).toBeInTheDocument();
  });

  it("does not render payout when absent", () => {
    const eligibility: EligibilityResult = {
      regulation: "EU261",
      status: "ineligible",
      reason: "Under threshold",
    };
    render(<EligibilityCard eligibility={eligibility} />);
    expect(screen.queryByText(/EUR/)).not.toBeInTheDocument();
  });

  it("renders reason when present", () => {
    const eligibility: EligibilityResult = {
      regulation: "EU261",
      status: "eligible",
      reason: "Flight was cancelled with no advance notice recorded.",
    };
    render(<EligibilityCard eligibility={eligibility} />);
    expect(screen.getByText(/no advance notice/)).toBeInTheDocument();
  });
});
