import {
  CompanyInput,
  AgentRunResponse,
  LeadItem,
  LeadScore,
  OutreachDraft,
  HealthResponse,
  GlobalSearchCriteria,
  GlobalSearchResponse
} from './types';

const API_BASE = '/api';

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function runAgentWorkflow(input: CompanyInput): Promise<AgentRunResponse> {
  const res = await fetch(`${API_BASE}/agent/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Agent execution failed (${res.status})`);
  }
  return res.json();
}

export async function fetchLeads(search?: string, filterScore?: string): Promise<LeadItem[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (filterScore && filterScore !== 'all') params.append('filter_score', filterScore);

  const res = await fetch(`${API_BASE}/leads?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch leads (${res.status})`);
  }
  return res.json();
}

export async function approveLead(leadId: number, approved: boolean = true): Promise<any> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  });
  if (!res.ok) {
    throw new Error(`Failed to approve lead draft (${res.status})`);
  }
  return res.json();
}

export async function updateLeadDraft(leadId: number, draftText: string): Promise<any> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/draft`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draft: draftText })
  });
  if (!res.ok) {
    throw new Error(`Failed to update lead draft (${res.status})`);
  }
  return res.json();
}

export async function getRunDetails(runId: string): Promise<AgentRunResponse> {
  const res = await fetch(`${API_BASE}/runs/${runId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch run details for ${runId}`);
  }
  return res.json();
}

export async function researchCompany(input: CompanyInput): Promise<any> {
  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Research failed (${res.status})`);
  }
  return res.json();
}

export async function scoreCompany(payload: { company_input: CompanyInput; evidence: any[]; signals: any[] }): Promise<LeadScore> {
  const res = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Scoring failed (${res.status})`);
  }
  return res.json();
}

export async function generateOutreach(payload: { company_input: CompanyInput; evidence: any[]; signals: any[]; lead_score: any }): Promise<OutreachDraft> {
  const res = await fetch(`${API_BASE}/outreach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Outreach generation failed (${res.status})`);
  }
  return res.json();
}

export async function fetchLatestEval(): Promise<any> {
  const res = await fetch(`${API_BASE}/eval/latest`);
  if (!res.ok) {
    throw new Error(`Failed to fetch evaluation metrics (${res.status})`);
  }
  return res.json();
}

export async function fetchEvalDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/eval/dataset`);
  if (!res.ok) {
    throw new Error(`Failed to fetch evaluation dataset (${res.status})`);
  }
  return res.json();
}

export async function runEvalBenchmark(): Promise<any> {
  const res = await fetch(`${API_BASE}/eval/run`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Evaluation benchmark failed (${res.status})`);
  }
  return res.json();
}

export async function searchGlobalProspects(criteria: GlobalSearchCriteria): Promise<GlobalSearchResponse> {
  const res = await fetch(`${API_BASE}/prospects/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Global prospect search failed (${res.status})`);
  }
  return res.json();
}



