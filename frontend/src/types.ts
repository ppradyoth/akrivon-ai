export interface ScanConfig {
  api_url: string;
  use_case: string;
  allowed_capabilities: string[];
  disallowed_capabilities: string[];
  languages: string[];
  num_tests: number;
}

export interface Analysis {
  violation: boolean;
  type: "capability_drift" | "role_drift" | "domain_violation" | "none";
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  confidence: number;
}

export interface ViolationRecord {
  strategy: "RoleTransformation" | "GradualDrift" | "LanguageVariation";
  prompt: string;
  response: string;
  analysis: Analysis;
}

export interface ScanResponse {
  summary: {
    total_tests: number;
    violations: number;
    risk_score: number;
  };
  violations: ViolationRecord[];
}

export interface EnforceConfig {
  allowed: string[];
  blocked: string[];
}

export interface EnforceRequest {
  prompt: string;
  target_api: string;
  config: EnforceConfig;
}

export interface EnforceResponse {
  intent: {
    label: string;
    confidence: number;
  };
  decision: "allow" | "block" | "clarify";
  response: string;
  validation: {
    safe: boolean;
  };
}
