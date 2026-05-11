import { useState } from "react";
import ConfigForm from "../components/ConfigForm";
import ResultsPanel from "../components/ResultsPanel";
import Section from "../components/Section";
import { runScan } from "../api";
import type { ScanConfig, ScanResponse } from "../types";

export default function Demo() {
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
      const message = err instanceof Error ? err.message : "Unable to complete scan. Please try again.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Section
        eyebrow="Intent Scan"
        title="Run behavior scans against your AI API"
        description="Use the production scan workflow to generate tests, execute probes, and review violation evidence."
      />

      <section className="section">
        <div className="workspace-grid" aria-label="Scan workspace">
          <ConfigForm onSubmit={handleRunScan} loading={loading} />
          <ResultsPanel result={result} loading={loading} error={error} />
        </div>
      </section>
    </>
  );
}
