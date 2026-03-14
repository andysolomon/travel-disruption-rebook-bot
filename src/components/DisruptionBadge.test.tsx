import { render, screen } from "@testing-library/react";
import DisruptionBadge from "./DisruptionBadge.tsx";

describe("DisruptionBadge", () => {
  it("renders the type label", () => {
    render(<DisruptionBadge type="cancellation" severity="critical" />);
    expect(screen.getByText(/Cancelled/)).toBeInTheDocument();
  });

  it("renders the severity text", () => {
    render(<DisruptionBadge type="delay" severity="high" />);
    expect(screen.getByText(/high/)).toBeInTheDocument();
  });

  it("renders Delayed label for delay type", () => {
    render(<DisruptionBadge type="delay" severity="medium" />);
    expect(screen.getByText(/Delayed/)).toBeInTheDocument();
  });

  it("renders Missed Connection label", () => {
    render(<DisruptionBadge type="missed-connection" severity="high" />);
    expect(screen.getByText(/Missed Connection/)).toBeInTheDocument();
  });

  it("applies correct CSS class for severity", () => {
    const { container } = render(<DisruptionBadge type="cancellation" severity="critical" />);
    expect(container.querySelector(".badge--critical")).toBeInTheDocument();
  });

  it("applies badge--low class for low severity", () => {
    const { container } = render(<DisruptionBadge type="delay" severity="low" />);
    expect(container.querySelector(".badge--low")).toBeInTheDocument();
  });
});
