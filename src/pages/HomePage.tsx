import { Link } from "react-router";
import "./HomePage.css";

type Pillar = {
  title: string;
  detail: string;
};

const pillars: Pillar[] = [
  {
    title: "Real-Time Disruption Monitoring",
    detail:
      "Track trips continuously and detect cancellations, major delays, and missed-connection risk the moment they surface.",
  },
  {
    title: "Rebooking Decision Support",
    detail:
      "Rank alternatives using traveler preferences like loyalty program, seat type, connection risk, and arrival urgency.",
  },
  {
    title: "Compensation Recovery Workflow",
    detail:
      "Assess eligibility, prefill claim drafts, and keep a transparent status timeline from filing to payout.",
  },
];

const phases = [
  "Foundation + route skeleton",
  "Disruption ingestion + EU261 eligibility",
  "Rebooking ranking engine",
  "Claim drafting + timeline",
  "Polish + deployment",
];

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="hero">
        <p className="kicker">Travel Disruption Rebook Bot</p>
        <h1>Recover Time and Compensation Before the Queue Starts</h1>
        <p className="lede">
          A frequent-flyer workflow for disruption alerts, fast rebooking choices, and
          compensation claim readiness.
        </p>
        <Link to="/dashboard" className="cta-link">
          Go to Dashboard &rarr;
        </Link>
      </header>

      <section className="grid" aria-label="Core product pillars">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="card">
            <h2>{pillar.title}</h2>
            <p>{pillar.detail}</p>
          </article>
        ))}
      </section>

      <section className="plan" aria-label="Delivery phases">
        <h2>Implementation Track</h2>
        <ol>
          {phases.map((phase) => (
            <li key={phase}>{phase}</li>
          ))}
        </ol>
        <p className="note">
          Full plan and execution details are in <code>IMPLEMENTATION_PLAN.md</code>.
        </p>
      </section>
    </div>
  );
}
