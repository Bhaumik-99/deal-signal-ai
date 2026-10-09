export interface EvidenceItem {
  quote: string;
  source_url: string;
  timestamp: string;
  source_title?: string;
  confidence: number;
}

export interface BuyingSignal {
  signal_type: string;
  supporting_evidence: string;
  source_url: string;
  date?: string;
  confidence_level: 'high' | 'medium' | 'low' | string;
  why_intent: string;
}

export interface LeadScore {
  overall_score: number;
  icp_fit_score: number;
  size_industry_fit_score: number;
  signal_relevance_score: number;
  evidence_quality_score: number;
  uncertainty_deduction: number;
  rationale: string;
  missing_information: string[];
  recommended_action: string;
}

export interface OutreachDraft {
  subject: string;
  body: string;
  business_context: string;
  supporting_evidence_refs: string[];
  personalization_rationale: string;
}

export interface TraceStep {
  step_name: string;
  tool_used: string;
  decision_summary: string;
  status: 'completed' | 'warning' | 'error' | 'skipped' | string;
  duration_ms: number;
  details?: Record<string, any>;
  error?: string;
}

export interface AgentRunResponse {
  run_id: string;
  company_name: string;
  domain?: string;
  fit_score: number;
  lead_score_details: LeadScore;
  buying_signals: BuyingSignal[];
  evidence_items: EvidenceItem[];
  outreach_draft: OutreachDraft;
  execution_trace: TraceStep[];
  is_simulated: boolean;
  mode: string;
  created_at: string;
}

export interface LeadItem {
  id: number;
  run_id?: string;
  name: string;
  domain?: string;
  initial: string;
  signal: string;
  detail?: string;
  score: number;
  status: string;
  type?: string;
  source?: string;
  outreach_subject?: string;
  outreach_draft?: string;
  is_approved: boolean;
}

export interface CompanyInput {
  name: string;
  website?: string;
  icp: string;
  target_industry?: string;
  desired_company_size?: string;
  signals_to_investigate?: string;
  product_offer?: string;
}

export interface HealthResponse {
  status: string;
  environment: string;
  llm_configured: boolean;
  test_mode: boolean;
  database_ok: boolean;
  timestamp: string;
}

export interface EvalMetrics {
  fact_extraction_accuracy: number;
  evidence_support_rate: number;
  source_url_validity_rate: number;
  buying_signal_precision: number;
  precision_at_5: number;
  ndcg_at_5: number;
  prospect_agreement_rate: number;
  factual_claim_support_rate: number;
  unsupported_claim_rate: number;
  relevance_rubric_score: number;
  task_success_rate: number;
  tool_call_success_rate: number;
  average_retries: number;
  average_latency_ms: number;
  total_token_usage: number;
  total_cost_usd: number;
  total_cases_evaluated: number;
}

export interface EvalCase {
  id: string;
  company_name: string;
  website: string;
  target_icp: string;
  industry: string;
  company_size: string;
  expected_relevance_grade: number;
  expected_signals: string[];
  ground_truth_facts: string[];
  is_qualified: boolean;
  expected_score_min: number;
  expected_score_max: number;
  test_category: string;
  description: string;
}

export interface EvalComparisonData {
  run_id: string;
  timestamp: string;
  dataset_size: number;
  metrics_comparison: {
    baseline: EvalMetrics;
    improved_agent: EvalMetrics;
  };
  error_analysis: {
    categories: Record<string, { baseline: number; improved: number }>;
    remediation_summary: string[];
  };
  sample_cases: {
    baseline: any[];
    improved: any[];
  };
}

export interface EvalDatasetResponse {
  dataset_size: number;
  cases: EvalCase[];
}

export interface GlobalSearchCriteria {
  sector: string;
  company_size: string;
  approx_revenue: string;
  region: string;
  buying_signal: string;
  target_role: string;
  max_results?: number;
}

export interface DiscoveredCompany {
  id: string;
  company_name: string;
  domain: string;
  website: string;
  fit_score: number;
  sector: string;
  company_size: string;
  approx_revenue: string;
  region: string;
  target_role: string;
  buying_signal: string;
  evidence_excerpt: string;
  source_url: string;
  scraped_timestamp: string;
  scraping_engine: string;
  is_verified: boolean;
}

export interface GlobalSearchResponse {
  criteria: GlobalSearchCriteria;
  total_found: number;
  results: DiscoveredCompany[];
  duration_ms: number;
  scraping_engine: string;
  scraped_sources: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'prospect' | 'human';
  senderName: string;
  subject?: string;
  content: string;
  timestamp: string;
}

export interface CampaignCompanyChat {
  companyId: string;
  companyName: string;
  domain: string;
  website?: string;
  to_email?: string;
  targetRole: string;
  fitScore: number;
  status: 'waiting' | 'replied' | 'meeting_scheduled';
  agentActive: boolean;
  messages: ChatMessage[];
  waitingNote?: string;
}

export interface Campaign {
  id: string;
  name: string;
  tagline: string;
  icp: string;
  signal_filter: string;
  status: 'Active draft' | 'In review' | 'Paused';
  leads_count: number;
  companies?: CampaignCompanyChat[];
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password?: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
  use_ssl: boolean;
  is_configured: boolean;
}

export interface SendEmailPayload {
  to_email: string;
  recipient_name?: string;
  subject: string;
  body: string;
  company_name?: string;
  sender_name?: string;
  campaign_name?: string;
}

export interface BatchSendEmailPayload {
  emails: SendEmailPayload[];
  campaign_name?: string;
}

export interface TestConnectionPayload {
  test_recipient?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  from_email?: string;
  from_name?: string;
  use_tls?: boolean;
  use_ssl?: boolean;
}


