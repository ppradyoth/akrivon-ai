import { useState } from "react";
import { runScan } from "../api";
import ConfigForm from "../components/ConfigForm";
import ResultsPanel from "../components/ResultsPanel";
import type { ScanConfig, ScanResponse } from "../types";

export default function IntentCheckPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunScan = async (config: ScanConfig) => {
    setLoading(true);
    setError(null);

    try {
      const scanResult = await runScan(config);
      setResult(scanResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error while running scan";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel soft-panel">
        <p className="eyebrow">Intent Check Your API</p>
        <h1>Validate AI behavior against your intended scope.</h1>
        <p className="hero-copy">
          Configure your target API, define allowed and disallowed capabilities, and launch a boundary scan.
        </p>
      </section>

      <section className="layout-grid intent-desktop-grid">
        <div className="intent-config">
          <ConfigForm onSubmit={handleRunScan} loading={loading} />
        </div>
        <div className="intent-results">
          <ResultsPanel result={result} loading={loading} error={error} />
        </div>
      </section>
    </div>
  );
}
