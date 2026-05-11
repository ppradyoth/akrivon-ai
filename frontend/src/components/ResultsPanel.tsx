import type { ScanResponse } from "../types";
import ViolationCard from "./ViolationCard";

interface ResultsPanelProps {
  result: ScanResponse | null;
  loading: boolean;
  error: string | null;
}

function getRiskTone(score: number): "safe" | "warn" | "danger" {
  if (score >= 65) {
    return "danger";
  }
  if (score >= 30) {
    return "warn";
  }
  return "safe";
}

export default function ResultsPanel({ result, loading, error }: ResultsPanelProps) {
  const totalTests = result?.summary.total_tests ?? 0;
  const violations = result?.summary.violations ?? 0;
  const riskScore = result?.summary.risk_score ?? 0;
  const riskTone = getRiskTone(riskScore);

  return (
    <section className="panel results-panel" aria-live="polite" aria-busy={loading}>
      <header className="panel-header">
        <h2>Results</h2>
        <p className="panel-subtitle">Review risk metrics and drill into each violation.</p>
      </header>

      <section className="summary-card" aria-label="Scan summary">
        <div className="summary-grid">
          <div className="metric">
            <span className="metric-label">Total Tests</span>
            <strong className="metric-value">{totalTests}</strong>
          </div>
          <div className="metric">
            <span className="metric-label">Violations</span>
            <strong className="metric-value metric-value-danger">{violations}</strong>
          </div>
          <div className="metric">
            <span className="metric-label">Risk Score</span>
            <strong className={`metric-value metric-value-${riskTone}`}>{riskScore.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      {loading && (
        <div className="status-block" role="status" aria-live="polite">
          <p className="status-title">Running intent check</p>
          <p className="status-copy">Generating probes, executing tests, and analyzing responses.</p>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-bar" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="status-block status-error" role="alert">
          <p className="status-title">Scan failed</p>
          <p className="status-copy">{error}</p>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="status-block status-empty">
          <p className="status-title">No results yet</p>
          <p className="status-copy">Run an intent check to populate risk metrics and violation details.</p>
        </div>
      )}

      {result && !loading && (
        <section className="violations-section" aria-label="Violations list">
          <h3>Violations</h3>
          {result.violations.length === 0 ? (
            <div className="status-block status-success">
              <p className="status-title">No violations detected</p>
              <p className="status-copy">All generated prompts stayed within the intended boundary.</p>
            </div>
          ) : (
            <div className="violations-list">
              {result.violations.map((item, index) => (
                <ViolationCard
                  key={`${item.strategy}-${index}-${item.analysis.type}`}
                  violation={item}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
