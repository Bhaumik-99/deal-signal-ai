import React, { useState, useEffect } from 'react';
import {
  CompanyInput,
  AgentRunResponse,
  LeadItem
} from '../../types';
import { runAgentWorkflow } from '../../api';

interface DiscoverViewProps {
  initialCompanyName?: string;
  initialWebsite?: string;
  onLeadSaved: (lead: LeadItem) => void;
  onToast: (message: string) => void;
}

const EVALUATION_COMPANIES = [
  { name: 'Northstar Health', url: 'https://northstarhealth.example' },
  { name: 'Vertex Labs', url: 'https://vertexlabs.example' },
  { name: 'Fieldnote', url: 'https://fieldnote.example' },
  { name: 'Brightpath', url: 'https://brightpath.example' },
  { name: 'Juniper Works', url: 'https://juniperworks.example' }
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  initialCompanyName,
  initialWebsite,
  onLeadSaved,
  onToast
}) => {
  const [name, setName] = useState(initialCompanyName || '');
  const [url, setUrl] = useState(initialWebsite || '');
  const [icp, setIcp] = useState(
    'Mid-market B2B company growing its sales team and investing in revenue operations.'
  );
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('50-500 employees');
  const [signalType, setSignalType] = useState('Hiring / team growth');
  const [productOffer, setProductOffer] = useState(
    'AI sales intelligence and outbound automation'
  );

  const [loading, setLoading] = useState(false);
  const [activePhase, setActivePhase] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentRunResponse | null>(null);
  const [draftText, setDraftText] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (initialCompanyName) {
      setName(initialCompanyName);
      const matched = EVALUATION_COMPANIES.find(
        (c) => c.name.toLowerCase() === initialCompanyName.toLowerCase()
      );
      if (matched && !initialWebsite) {
        setUrl(matched.url);
      }
    }
    if (initialWebsite) {
      setUrl(initialWebsite);
    }
  }, [initialCompanyName, initialWebsite]);

  const handleSelectEvalCompany = (compName: string, compUrl: string) => {
    setName(compName);
    setUrl(compUrl);
    setError(null);
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a company name.');
      return;
    }
    if (!url.trim()) {
      setError('Company website URL is compulsory. Please enter the target website URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsApproved(false);
    setResult(null);
    setElapsedSeconds(0);

    const startTs = Date.now();
    const targetName = name.trim();
    const targetUrl = url.trim();

    const phases = [
      'Pre-resolving domain security & SSL validation...',
      'Safely retrieving company website & live pages...',
      'Extracting verified fact claims & intent signals...',
      'Evaluating deterministic qualification fit score...',
      'Synthesizing personalized B2B outreach draft...'
    ];

    let phaseIdx = 0;
    setActivePhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setActivePhase(phases[phaseIdx]);
    }, 600);

    const timerInterval = setInterval(() => {
      setElapsedSeconds(Number(((Date.now() - startTs) / 1000).toFixed(1)));
    }, 100);

    try {
      const input: CompanyInput = {
        name: targetName,
        website: targetUrl,
        icp: icp.trim(),
        target_industry: industry.trim() || undefined,
        desired_company_size: companySize.trim() || undefined,
        signals_to_investigate: signalType,
        product_offer: productOffer.trim() || undefined
      };

      const response = await runAgentWorkflow(input);
      clearInterval(phaseInterval);
      clearInterval(timerInterval);

      const totalTime = ((Date.now() - startTs) / 1000).toFixed(2);
      setElapsedSeconds(Number(totalTime));
      setResult(response);
      setDraftText(response.outreach_draft?.body || '');

      const autoSavedLead: LeadItem = {
        id: Date.now(),
        run_id: response.run_id,
        name: response.company_name,
        domain: response.domain || 'Verified account',
        initial: response.company_name[0]?.toUpperCase() || 'P',
        signal: response.buying_signals[0]?.signal_type || 'Activity verified',
        detail:
          response.buying_signals[0]?.supporting_evidence || 'Evidence verified by DealSignal Agent.',
        score: response.fit_score,
        status: 'Draft ready',
        type: signalType,
        source: response.buying_signals[0]?.source_url || response.evidence_items[0]?.source_url,
        outreach_subject: response.outreach_draft?.subject,
        outreach_draft: response.outreach_draft?.body || '',
        is_approved: false
      };
      onLeadSaved(autoSavedLead);
      onToast(`Research complete for ${response.company_name}! Score: ${response.fit_score}/100`);
    } catch (err: any) {
      clearInterval(phaseInterval);
      clearInterval(timerInterval);
      setError(err.message || 'An error occurred during agent research.');
      onToast(`Agent error: ${err.message || 'Failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDraft = async () => {
    const textToCopy = `Subject: ${result?.outreach_draft?.subject}\n\n${draftText}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      onToast('Email draft copied to clipboard.');
    } catch {
      onToast('Failed to copy to clipboard.');
    }
  };

  const handleApproveDraft = async () => {
    if (!result) return;
    setIsApproved(true);
    const approvedLead: LeadItem = {
      id: Date.now(),
      run_id: result.run_id,
      name: result.company_name,
      domain: result.domain || 'Verified account',
      initial: result.company_name[0]?.toUpperCase() || 'P',
      signal: result.buying_signals[0]?.signal_type || 'Activity verified',
      detail: result.buying_signals[0]?.supporting_evidence || 'Evidence verified by DealSignal Agent.',
      score: result.fit_score,
      status: 'Approved draft',
      type: signalType,
      source: result.buying_signals[0]?.source_url || result.evidence_items[0]?.source_url,
      outreach_subject: result.outreach_draft?.subject,
      outreach_draft: draftText,
      is_approved: true
    };
    onLeadSaved(approvedLead);
    onToast(`Draft approved for ${result.company_name}! Added to Campaigns dispatch queue.`);
  };

  const handleSaveProspect = () => {
    if (!result) return;
    const newLead: LeadItem = {
      id: Date.now(),
      run_id: result.run_id,
      name: result.company_name,
      domain: result.domain || 'Verified account',
      initial: result.company_name[0]?.toUpperCase() || 'P',
      signal: result.buying_signals[0]?.signal_type || 'Activity verified',
      detail: result.buying_signals[0]?.supporting_evidence || 'Evidence verified by DealSignal Agent.',
      score: result.fit_score,
      status: isApproved ? 'Approved draft' : 'Review needed',
      type: signalType,
      source: result.buying_signals[0]?.source_url || result.evidence_items[0]?.source_url,
      outreach_subject: result.outreach_draft?.subject,
      outreach_draft: draftText,
      is_approved: isApproved
    };
    onLeadSaved(newLead);
    onToast(`Prospect "${result.company_name}" saved to your workspace.`);
  };

  return (
    <section className="page active" id="page-discover">
      <div className="page-header" style={{ marginBottom: '22px' }}>
        <div>
          <h1 style={{ color: '#17221d', letterSpacing: '-1.2px' }}>Discover a Signal</h1>
          <p style={{ color: '#56665b' }}>
            Autonomous bounded research agent: discovers company facts, verifies evidence,
            scores fit (0–100), and prepares an editable personalized draft.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="pill pill-high">Agent Workflow</span>
          {result?.is_simulated && (
            <span className="pill pill-medium" title="Deterministic test benchmark data used">
              Test Benchmark Mode
            </span>
          )}
        </div>
      </div>

      <div className="research-layout">
        {/* Left Form Panel */}
        <div className="panel form-panel">
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#17221d', marginBottom: '6px' }}>
            Research Brief
          </h3>
          <p style={{ fontSize: '12px', color: '#58665b', marginBottom: '14px', lineHeight: 1.5 }}>
            Provide the target company identity and your ideal customer profile. Live
            domains are safely fetched with SSRF and anti-bot protection.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#58665b',
                display: 'block',
                marginBottom: '6px'
              }}
            >
              Quick Test Benchmarks:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EVALUATION_COMPANIES.map((comp) => (
                <button
                  key={comp.name}
                  type="button"
                  className={`btn btn-small ${
                    name.toLowerCase() === comp.name.toLowerCase() ? 'btn-lime' : ''
                  }`}
                  style={{ fontSize: '10px', padding: '4px 8px' }}
                  onClick={() => handleSelectEvalCompany(comp.name, comp.url)}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRunAgent}>
            <div className="field">
              <label htmlFor="companyName">Target company name *</label>
              <input
                id="companyName"
                placeholder="e.g. Stripe, Linear, Shopify"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="companyUrl">Company website *</label>
              <input
                id="companyUrl"
                placeholder="https://company.com"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <span className="field-hint">
                Validated against loopback and private IP blocks to prevent SSRF.
              </span>
            </div>

            <div className="field">
              <label htmlFor="icp">Ideal customer profile *</label>
              <textarea
                id="icp"
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}
            >
              <div className="field">
                <label htmlFor="industry">Target industry</label>
                <input
                  id="industry"
                  placeholder="e.g. HealthTech, SaaS"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="companySize">Company size</label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                >
                  <option value="1-50 employees">1–50 employees</option>
                  <option value="50-500 employees">50–500 employees</option>
                  <option value="500-2000 employees">500–2,000 employees</option>
                  <option value="2000+ employees">2,000+ enterprise</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="signalType">Buying signal to look for</label>
              <select
                id="signalType"
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
              >
                <option value="Hiring / team growth">Hiring / team growth</option>
                <option value="Funding announcement">Funding announcement</option>
                <option value="New market expansion">New market expansion</option>
                <option value="Product launch">Product launch</option>
                <option value="New partnerships">New partnerships</option>
                <option value="Any relevant signal">Any relevant signal</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="productOffer">What are you selling?</label>
              <input
                id="productOffer"
                value={productOffer}
                onChange={(e) => setProductOffer(e.target.value)}
              />
            </div>

            <button
              className="btn btn-dark full"
              type="submit"
              disabled={loading}
              id="researchButton"
              style={{ marginTop: '6px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                  Researching ({elapsedSeconds}s)...
                </>
              ) : (
                <>✦ Run Research Agent</>
              )}
            </button>

            {error && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#fee2e2',
                  border: '1px solid #f87171',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#991b1b'
                }}
              >
                <b>Error:</b> {error}
              </div>
            )}
          </form>
        </div>

        {/* Right Results Panel */}
        <div className="panel research-results" id="researchResults">
          {loading ? (
            /* SLEEK REAL-TIME PROGRESS CARD (ZERO AI SLOP) */
            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #dce5dd',
                boxShadow: '0 4px 18px rgba(23, 34, 29, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#243c22',
                      boxShadow: '0 0 10px rgba(36, 60, 34, 0.4)',
                      animation: 'subtleRadarPulse 1.4s infinite ease-in-out',
                    }}
                  />
                  <div>
                    <b style={{ color: '#17221d', fontSize: '14px' }}>
                      Researching {name}
                    </b>
                    <small style={{ color: '#68776e', display: 'block', fontSize: '11px' }}>
                      Target: {url || `${name.toLowerCase().replace(/\s+/g, '')}.com`} • Live Verification
                    </small>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#255e2e',
                    fontVariantNumeric: 'tabular-nums',
                    background: '#edf7e6',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {elapsedSeconds}s elapsed
                </span>
              </div>

              {/* Animated Scan Bar */}
              <div className="scout-scan-bar" style={{ marginBottom: '14px' }} />

              <div style={{ fontSize: '12px', color: '#4a5d51', fontWeight: 500 }}>
                {activePhase || 'Analyzing company website & extracting verified signals...'}
              </div>
            </div>
          ) : !result ? (
            /* EMPTY INITIAL STATE */
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>Ready to find your next signal?</h3>
              <p>
                Enter a target company and website URL. The agent will retrieve live evidence,
                detect verified intent triggers, compute an ICP fit score, and prepare an editable outreach draft.
              </p>
            </div>
          ) : (
            /* CLEAN, EXECUTIVE B2B DOSSIER (ZERO AI SLOP) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* RESULT HEAD CARD */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dce5dd',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(23, 34, 29, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    className="company-logo"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#243c22',
                      color: '#b9f36b',
                      fontSize: '18px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {result.company_name[0]?.toUpperCase() || 'C'}
                  </span>
                  <div>
                    <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#17221d', margin: '0 0 3px 0', letterSpacing: '-0.02em' }}>
                      {result.company_name}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {result.domain && (
                        <a
                          href={result.domain.startsWith('http') ? result.domain : `https://${result.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#215c32',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>{result.domain}</span>
                          <span style={{ fontSize: '10px' }}>↗</span>
                        </a>
                      )}
                      {result.is_simulated ? (
                        <span className="pill pill-medium" style={{ fontSize: '9px', padding: '2px 7px' }}>
                          Benchmark Evaluation Data
                        </span>
                      ) : (
                        <span className="pill pill-high" style={{ fontSize: '9px', padding: '2px 7px' }}>
                          Verified Live Domain
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BIG SCORE */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: result.fit_score >= 80 ? '#edf7e6' : '#fff8ea',
                    border: result.fit_score >= 80 ? '1px solid #c8e4ba' : '1px solid #fae1ad',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: result.fit_score >= 80 ? '#1b5e20' : '#8a5300',
                      lineHeight: 1,
                    }}
                  >
                    {result.fit_score}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: result.fit_score >= 80 ? '#1b5e20' : '#8a5300',
                      textTransform: 'uppercase',
                      marginTop: '3px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    FIT SCORE / 100
                  </div>
                </div>
              </div>

              {/* RUBRIC SCORE BREAKDOWN */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                }}
              >
                <div style={{ background: '#ffffff', border: '1px solid #dce5dd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>ICP Fit</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#17221d', marginTop: '4px' }}>
                    {result.lead_score_details.icp_fit_score} <span style={{ fontSize: '11px', color: '#88988e' }}>/ 40</span>
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #dce5dd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Size & Industry</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#17221d', marginTop: '4px' }}>
                    {result.lead_score_details.size_industry_fit_score} <span style={{ fontSize: '11px', color: '#88988e' }}>/ 20</span>
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #dce5dd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Signal Relevance</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#17221d', marginTop: '4px' }}>
                    {result.lead_score_details.signal_relevance_score} <span style={{ fontSize: '11px', color: '#88988e' }}>/ 25</span>
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #dce5dd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Evidence Rigor</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#17221d', marginTop: '4px' }}>
                    {result.lead_score_details.evidence_quality_score} <span style={{ fontSize: '11px', color: '#88988e' }}>/ 15</span>
                  </div>
                </div>
              </div>

              {/* RECOMMENDED NEXT ACTION */}
              {result.lead_score_details.recommended_action && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f4f8f4',
                    border: '1px solid #cce0cc',
                    fontSize: '12px',
                    color: '#1e3825',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: '#255e2e' }}>✦</span>
                  <span>{result.lead_score_details.recommended_action}</span>
                </div>
              )}

              {/* VERIFIED BUYING SIGNALS */}
              {result.buying_signals && result.buying_signals.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #dce5dd', borderRadius: '12px', padding: '18px 20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#17221d', margin: '0 0 12px 0' }}>
                    Verified Buying Signals ({result.buying_signals.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {result.buying_signals.map((sig, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: '#fafcfa',
                          border: '1px solid #e1ebe2',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#17221d' }}>
                            {sig.signal_type}
                          </span>
                          <span className="pill pill-high" style={{ fontSize: '9px', padding: '2px 7px' }}>
                            {sig.confidence_level} confidence
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#4a5d51', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                          "{sig.supporting_evidence}"
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#68776e' }}>
                          <span>Intent context: {sig.why_intent}</span>
                          {sig.source_url && (
                            <a
                              href={sig.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#255e2e', fontWeight: 600, textDecoration: 'none' }}
                            >
                              Source Proof ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUNDED OUTREACH DRAFT (CORE WORKFLOW) */}
              <div style={{ background: '#ffffff', border: '1px solid #dce5dd', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#17221d', margin: 0 }}>
                    Personalized Outreach Email
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isApproved ? (
                      <span className="pill pill-high" style={{ fontSize: '10px' }}>
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="pill pill-medium" style={{ fontSize: '10px' }}>
                        Human Review Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Email container */}
                <div
                  style={{
                    background: '#fbfcfa',
                    border: '1px solid #dbe5dc',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#17221d',
                      paddingBottom: '10px',
                      marginBottom: '12px',
                      borderBottom: '1px solid #e5ede6',
                    }}
                  >
                    Subject: {result.outreach_draft?.subject || `Thought on ${result.company_name}`}
                  </div>

                  <textarea
                    id="draftText"
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      border: 'none',
                      background: 'transparent',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                      lineHeight: '1.7',
                      color: '#27382d',
                      resize: 'vertical',
                      outline: 'none',
                      padding: 0,
                    }}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSaveProspect}
                    className="btn btn-dark"
                    style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 700 }}
                  >
                    ＋ Save Prospect
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', fontWeight: 600 }}
                  >
                    Copy Email
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveDraft}
                    className={`btn ${isApproved ? 'btn-lime' : ''}`}
                    style={{ fontSize: '12px', padding: '8px 14px', fontWeight: 700 }}
                  >
                    {isApproved ? '✓ Approved' : 'Mark Approved'}
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE AUDIT TRACE (CLEAN ACCORDION, ZERO AI SLOP) */}
              {result.execution_trace && result.execution_trace.length > 0 && (
                <details
                  style={{
                    background: '#ffffff',
                    border: '1px solid #dce5dd',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#68776e',
                    cursor: 'pointer',
                  }}
                >
                  <summary style={{ fontWeight: 700, color: '#27382d', outline: 'none' }}>
                    Audit & Verification Trace ({result.execution_trace.length} steps completed in {elapsedSeconds}s)
                  </summary>
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.execution_trace.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#f8faf7',
                          borderRadius: '6px',
                          border: '1px solid #e5ede6',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: step.status === 'completed' ? '#255e2e' : '#b45309', fontWeight: 800 }}>
                            {step.status === 'completed' ? '✓' : '•'}
                          </span>
                          <span style={{ fontWeight: 600, color: '#17221d' }}>{step.step_name}:</span>
                          <span style={{ color: '#4a5d51' }}>{step.decision_summary}</span>
                        </div>
                        {step.duration_ms !== undefined && (
                          <span style={{ color: '#88988e', fontSize: '10px', fontVariantNumeric: 'tabular-nums' }}>
                            {step.duration_ms}ms
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
