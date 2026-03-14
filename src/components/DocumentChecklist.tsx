import type { DocumentRequirement, DocumentItem } from "../types/claim.ts";
import "./DocumentChecklist.css";

export default function DocumentChecklist({
  requirements,
  documents,
}: {
  requirements: DocumentRequirement[];
  documents: DocumentItem[];
}) {
  const providedNames = new Set(documents.map((d) => d.name));

  return (
    <ul className="doc-checklist" aria-label="Document checklist">
      {requirements.map((req) => {
        const isProvided = req.provided || providedNames.has(req.name);
        return (
          <li key={req.id} className={`doc-checklist__item ${isProvided ? "doc-checklist__item--provided" : ""}`}>
            <span className="doc-checklist__icon">{isProvided ? "✓" : "○"}</span>
            <span className={`doc-checklist__name ${isProvided ? "doc-checklist__name--done" : ""}`}>{req.name}</span>
            {!isProvided && req.required && <span className="doc-checklist__badge">Required</span>}
          </li>
        );
      })}
    </ul>
  );
}
