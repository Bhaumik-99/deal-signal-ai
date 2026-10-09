import {
  CompanyInput,
  AgentRunResponse,
  LeadItem,
  LeadScore,
  OutreachDraft,
  HealthResponse,
  GlobalSearchCriteria,
  GlobalSearchResponse,
  EmailSettings,
  SendEmailPayload,
  BatchSendEmailPayload,
  TestConnectionPayload
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

export async function getEmailSettings(): Promise<EmailSettings> {
  const res = await fetch(`${API_BASE}/email/settings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch email settings (${res.status})`);
  }
  return res.json();
}

export async function updateEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
  const res = await fetch(`${API_BASE}/email/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update email settings (${res.status})`);
  }
  return res.json();
}

export async function testEmailConnection(payload?: TestConnectionPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/email/test-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `SMTP connection test failed (${res.status})`);
  }
  return res.json();
}

export async function sendRealEmail(payload: SendEmailPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.detail || `Email dispatch failed (${res.status})`);
    err.status = res.status;
    err.requiresConfig = res.status === 428;
    throw err;
  }
  return res.json();
}

export async function batchSendRealEmails(payload: BatchSendEmailPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/email/batch-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.detail || `Batch dispatch failed (${res.status})`);
    err.status = res.status;
    err.requiresConfig = res.status === 428;
    throw err;
  }
  return res.json();
}

export async function getEmailLogs(limit?: number): Promise<any[]> {
  const res = await fetch(`${API_BASE}/email/logs?limit=${limit || 50}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch email logs (${res.status})`);
  }
  return res.json();
}
