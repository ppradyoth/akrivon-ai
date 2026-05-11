import { useId } from "react";
import type { ViolationRecord } from "../types";

interface ViolationCardProps {
  violation: ViolationRecord;
}

export default function ViolationCard({ violation }: ViolationCardProps) {
  const headingId = useId();
  const contentId = useId();

  return (
    <details className="violation-card">
      <summary aria-labelledby={headingId} aria-controls={contentId}>
        <div className="violation-summary">
          <div className="violation-meta">
            <p className="violation-label">{violation.strategy}</p>
            <p id={headingId} className="violation-reason-preview">
              {violation.analysis.reason}
            </p>
          </div>
          <span className={`severity-badge severity-${violation.analysis.severity}`}>
            {violation.analysis.severity}
          </span>
        </div>
      </summary>

      <div id={contentId} className="violation-content-wrap">
        <div className="violation-content">
          <div className="detail-grid">
            <p>
              <span>Type</span>
              <strong>{violation.analysis.type}</strong>
            </p>
            <p>
              <span>Confidence</span>
              <strong>{violation.analysis.confidence.toFixed(2)}</strong>
            </p>
          </div>

          <div className="text-block">
            <h4>Prompt</h4>
            <pre>{violation.prompt}</pre>
          </div>

          <div className="text-block">
            <h4>Response</h4>
            <pre>{violation.response}</pre>
          </div>
        </div>
      </div>
    </details>
  );
}
