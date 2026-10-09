import React, { useState } from 'react';
import { GlobalSearchCriteria, DiscoveredCompany, GlobalSearchResponse, LeadItem } from '../../types';
import { searchGlobalProspects } from '../../api';

interface GlobalSearchViewProps {
  onNavigateToDiscover: (companyName: string, companyWebsite?: string) => void;
  onLeadSaved: (lead: LeadItem) => void;
  onToast: (msg: string) => void;
}

const SECTOR_OPTIONS = [
  { value: 'b2b_saas', label: 'B2B SaaS & Enterprise Software' },
  { value: 'fintech', label: 'Fintech, Payments & Banking Tech' },
  { value: 'healthcare', label: 'HealthTech & Digital Clinical Systems' },
  { value: 'ai_ml', label: 'AI, Machine Learning & DevTools' },
  { value: 'ecommerce', label: 'E-Commerce Infrastructure & RetailTech' },
  { value: 'cybersecurity', label: 'Cybersecurity, Identity & Cloud Protection' },
  { value: 'supply_chain', label: 'Logistics, Freight & Supply Chain Tech' },
  { value: 'cleantech', label: 'CleanTech, Climate & Energy Software' },
  { value: 'all_sectors', label: 'All Sectors (Global Scout)' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-50', label: '1 – 50 employees (Early Stage)' },
  { value: '50-250', label: '50 – 250 employees (Growth Stage)' },
  { value: '250-1000', label: '250 – 1,000 employees (Mid-Market)' },
  { value: '1000-5000', label: '1,000 – 5,000 employees (Upper Mid-Market)' },
  { value: '5000+', label: '5,000+ employees (Enterprise)' },
];

const REVENUE_OPTIONS = [
  { value: '<$5M', label: '< $5M ARR (Seed to Series A)' },
  { value: '$5M-$20M', label: '$5M – $20M ARR (Scaling)' },
  { value: '$20M-$100M', label: '$20M – $100M ARR (Mid-Market)' },
  { value: '$100M-$500M', label: '$100M – $500M ARR (Commercial Growth)' },
  { value: '$500M+', label: '$500M+ ARR (Large Enterprise)' },
];

const REGION_OPTIONS = [
  { value: 'North America (US & Canada)', label: 'North America (US & Canada)' },
  { value: 'Europe & UK', label: 'Europe & United Kingdom' },
  { value: 'Asia-Pacific (APAC)', label: 'Asia-Pacific (APAC)' },
  { value: 'Latin America (LATAM)', label: 'Latin America (LATAM)' },
  { value: 'Global / Remote', label: 'Global / Multi-Region' },
];

const SIGNAL_OPTIONS = [
  { value: 'Rapid Engineering & Product Hiring', label: 'Rapid Engineering & Product Hiring' },
  { value: 'Recent Growth Capital / Series Funding', label: 'Recent Growth Capital / Series Funding' },
  { value: 'Cloud, CRM & AI Modernization', label: 'Cloud, CRM & AI Modernization' },
  { value: 'Global Enterprise Product Expansion', label: 'Global Enterprise Product Expansion' },
  { value: 'Executive Leadership Hires (VP/CRO/CMO)', label: 'Executive Leadership Hires (VP Sales / CMO / CRO)' },
  { value: 'all_signals', label: 'Any Verified Intent & Expansion Signal' },
];

const ROLE_OPTIONS = [
  { value: 'VP / Head of Sales & Revenue Operations', label: 'VP / Head of Sales & Revenue Operations' },
  { value: 'CTO / VP Engineering & Infrastructure', label: 'CTO / VP Engineering & Infrastructure' },
  { value: 'CMO / VP Growth & Demand Generation', label: 'CMO / VP Growth & Demand Generation' },
  { value: 'Chief Executive Officer / Founder', label: 'Chief Executive Officer / Co-Founder' },
  { value: 'CFO / VP Finance & Procurement', label: 'CFO / VP Finance & Procurement' },
];

// Clean, high-precision SVG icons
const SearchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ExternalLinkIcon: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DocumentTextIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BookmarkIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const LightningIcon: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TargetIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const DownloadIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  onNavigateToDiscover,
  onLeadSaved,
  onToast,
}) => {
  const [sector, setSector] = useState<string>('b2b_saas');
  const [companySize, setCompanySize] = useState<string>('50-250');
  const [approxRevenue, setApproxRevenue] = useState<string>('$10M-$50M');
  const [region, setRegion] = useState<string>('North America (US & Canada)');
  const [buyingSignal, setBuyingSignal] = useState<string>('Rapid Engineering & Product Hiring');
  const [targetRole, setTargetRole] = useState<string>('VP / Head of Sales & Revenue Operations');

  const [loading, setLoading] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<GlobalSearchResponse | null>(null);
  const [savedLeadIds, setSavedLeadIds] = useState<Set<string>>(new Set());

  const isFormValid =
    Boolean(sector) &&
    Boolean(companySize) &&
    Boolean(approxRevenue) &&
    Boolean(region) &&
    Boolean(buyingSignal) &&
    Boolean(targetRole);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please select valid options for all 6 prospecting parameters.');
      return;
    }

    setError(null);
    setLoading(true);
    setElapsedSec(0);
    setSearchResult(null);

    const timer = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);

    const stepMessages = [
      'Initiating live internet queries across market sources...',
      'Discovering qualified domains matching ICP criteria...',
      'Performing live HTTP extraction of company sites...',
      'Parsing career listings, leadership announcements & growth signals...',
      'Computing ICP fit scores and extracting evidence quotes...',
      'Finalizing account dossier and citation records...',
    ];

    let stepIdx = 0;
    setSearchStep(stepMessages[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % stepMessages.length;
      setSearchStep(stepMessages[stepIdx]);
    }, 1200);

    const criteria: GlobalSearchCriteria = {
      sector,
      company_size: companySize,
      approx_revenue: approxRevenue,
      region,
      buying_signal: buyingSignal,
      target_role: targetRole,
    };

    try {
      const response = await searchGlobalProspects(criteria);
      setSearchResult(response);
      onToast(`Discovered ${response.total_found} accounts in ${(response.duration_ms / 1000).toFixed(1)}s`);
    } catch (err: any) {
      setError(err.message || 'Live web search failed. Please try again.');
      onToast(`Search failed: ${err.message || 'Unknown error'}`);
    } finally {
      clearInterval(timer);
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleSaveToLeads = (company: DiscoveredCompany) => {
    const newLead: LeadItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: company.company_name,
      domain: company.domain,
      initial: company.company_name.charAt(0).toUpperCase(),
      signal: company.buying_signal,
      detail: `${company.company_size} • ${company.approx_revenue} • ${company.region}`,
      score: company.fit_score,
      status: 'Review needed',
      type: 'Company',
      source: 'Global Web Scout',
      is_approved: false,
    };

    onLeadSaved(newLead);
    setSavedLeadIds((prev) => new Set(prev).add(company.id));
    onToast(`Added ${company.company_name} to Leads queue`);
  };

  const handleDownloadCsv = () => {
    if (!searchResult || searchResult.results.length === 0) return;

    const headers = [
      'Company Name',
      'Website',
      'Domain',
      'Sector',
      'Company Size',
      'Approx Revenue',
      'Region',
      'Fit Score',
      'Target Role',
      'Buying Signal',
      'Evidence Excerpt',
      'Scraped Timestamp'
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = searchResult.results.map((c) => [
      escapeCsv(c.company_name),
      escapeCsv(c.website),
      escapeCsv(c.domain),
      escapeCsv(c.sector),
      escapeCsv(c.company_size),
      escapeCsv(c.approx_revenue),
      escapeCsv(c.region),
      escapeCsv(c.fit_score),
      escapeCsv(c.target_role),
      escapeCsv(c.buying_signal),
      escapeCsv(c.evidence_excerpt),
      escapeCsv(c.scraped_timestamp)
    ]);

    const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dealsignal_scouted_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast(`Downloaded ${searchResult.results.length} scouted accounts as CSV.`);
  };

  return (
    <div className="view-container" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header (Consistent with Overview/Leads in DealSignal) */}
      <div className="page-header" style={{ marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="pill pill-high" style={{ fontSize: '11px', fontWeight: 700 }}>
              Live Market Scout
            </span>
            <span style={{ fontSize: '12px', color: '#68776e', fontWeight: 500 }}>
              Real-Time Web Intelligence
            </span>
          </div>

          <h1 style={{ color: '#17221d', letterSpacing: '-1.2px' }}>
            Global Account Scout
          </h1>
          <p style={{ maxWidth: '640px', fontSize: '13px', color: '#64736a' }}>
            Search and scrape the live internet for accounts that strictly match your target profile.
            Every search performs live web extraction on demand with zero static databases.
          </p>
        </div>
      </div>

      {/* ICP Parameters Panel */}
      <div
        className="panel"
        style={{
          padding: '24px',
          borderRadius: '14px',
          background: '#ffffff',
          border: '1px solid #e1e7e2',
          boxShadow: '0 8px 24px rgba(23, 34, 29, 0.04)',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TargetIcon size={16} color="#243c22" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#17221d' }}>
              Target Qualification Criteria
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#7c8b81', fontWeight: 600 }}>
            All 6 Parameters Required
          </span>
        </div>

        <form onSubmit={handleSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '14px',
            }}
          >
            {/* 1. Sector */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Industry Sector <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fafcfa',
                  color: '#17221d',
                  border: '1px solid #d3ded6',
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                {SECTOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Company Size */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Headcount Scale <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fafcfa',
                  color: '#17221d',
                  border: '1px solid #d3ded6',
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Approx Revenue */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Annual Revenue Range <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={approxRevenue}
                onChange={(e) => setApproxRevenue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fafcfa',
                  color: '#17221d',
                  border: '1px solid #d3ded6',
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                {REVENUE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Region */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Geographic Market <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fafcfa',
                  color: '#17221d',
                  border: '1px solid #d3ded6',
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Buying Signal */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Buying Intent Trigger <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={buyingSignal}
                onChange={(e) => setBuyingSignal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fafcfa',
                  color: '#17221d',
                  border: '1px solid #d3ded6',
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                {SIGNAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Target Role */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Target Buyer Persona <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fafcfa',
                  color: '#17221d',
                  border: '1px solid #d3ded6',
                  fontSize: '13px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid #edf1ee',
            }}
          >
            <div style={{ fontSize: '12px', color: '#7c8a81' }}>
              Queries live web sources in real time • Direct homepage extraction
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="btn btn-dark"
              style={{
                padding: '11px 22px',
                fontSize: '13px',
                fontWeight: 700,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                  Crawling Live Web ({elapsedSec}s)...
                </>
              ) : (
                <>
                  <SearchIcon size={14} color="#ffffff" />
                  Discover Accounts
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Progress Telemetry */}
      {loading && (
        <div
          className="panel"
          style={{
            padding: '20px 24px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #dbe3dc',
            marginBottom: '26px',
            boxShadow: '0 4px 18px rgba(23, 34, 29, 0.04)',
          }}
        >
          <div className="scout-scan-bar" style={{ marginBottom: '14px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#243c22',
                  boxShadow: '0 0 8px rgba(36, 60, 34, 0.4)',
                  animation: 'subtleRadarPulse 1.4s infinite ease-in-out',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#17221d' }}>
                {searchStep}
              </span>
            </div>

            <span style={{ fontSize: '12px', color: '#68776e', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
              {elapsedSec}s elapsed
            </span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchResult && (
        <div>
          {/* HIGH-CONTRAST RESULTS RIBBON ("6 Accounts Identified") */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              padding: '14px 20px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #dbe3dc',
              boxShadow: '0 4px 14px rgba(23, 34, 29, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: '#243c22',
                  color: '#b9f36b',
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  lineHeight: 1.2,
                }}
              >
                {searchResult.total_found}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#17221d',
                  letterSpacing: '-0.02em',
                }}
              >
                Accounts Identified
              </span>
              <span style={{ fontSize: '12px', color: '#65746a', fontWeight: 500 }}>
                • Scraped in {(searchResult.duration_ms / 1000).toFixed(2)}s
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="btn"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f2f6f2',
                  color: '#17221d',
                  border: '1px solid #c8d6cb',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Download CSV export of all live scraped accounts"
              >
                <DownloadIcon size={13} color="#17221d" />
                <span>Download CSV</span>
              </button>

              <span
                className="pill pill-high"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                }}
              >
                Ranked by ICP Fit Score
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '18px',
            }}
          >
            {searchResult.results.map((company, idx) => {
              const isSaved = savedLeadIds.has(company.id);

              return (
                <div
                  key={company.id}
                  className="scout-card panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    animationDelay: `${idx * 60}ms`,
                    boxShadow: '0 6px 20px rgba(23, 34, 29, 0.05)',
                  }}
                >
                  <div>
                    {/* Top Row: Name, Link & Fit Score */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: '17px',
                            fontWeight: 800,
                            color: '#17221d',
                            margin: '0 0 3px 0',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {company.company_name}
                        </h3>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#215c32',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                          }}
                        >
                          <span>{company.domain}</span>
                          <ExternalLinkIcon size={12} color="#215c32" />
                        </a>
                      </div>

                      <div
                        style={{
                          textAlign: 'center',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: company.fit_score >= 80 ? '#edf7e6' : '#fff8ea',
                          border: company.fit_score >= 80 ? '1px solid #c8e4ba' : '1px solid #fae1ad',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '17px',
                            fontWeight: 800,
                            color: company.fit_score >= 80 ? '#23521e' : '#8a5300',
                            lineHeight: 1,
                          }}
                        >
                          {company.fit_score}
                        </div>
                        <div
                          style={{
                            fontSize: '9px',
                            color: company.fit_score >= 80 ? '#23521e' : '#8a5300',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            marginTop: '2px',
                          }}
                        >
                          Fit Score
                        </div>
                      </div>
                    </div>

                    {/* Metadata Parameter Chips */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginBottom: '14px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          background: '#f2f6f2',
                          color: '#26372c',
                          border: '1px solid #dbe5dc',
                          fontWeight: 600,
                        }}
                      >
                        {company.sector}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          background: '#f2f6f2',
                          color: '#26372c',
                          border: '1px solid #dbe5dc',
                          fontWeight: 600,
                        }}
                      >
                        {company.company_size}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          background: '#f2f6f2',
                          color: '#26372c',
                          border: '1px solid #dbe5dc',
                          fontWeight: 600,
                        }}
                      >
                        {company.approx_revenue}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          background: '#f2f6f2',
                          color: '#26372c',
                          border: '1px solid #dbe5dc',
                          fontWeight: 600,
                        }}
                      >
                        {company.region}
                      </span>
                    </div>

                    {/* Detected Intent Signal Box */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#fef9ee',
                        border: '1px solid #f6dfad',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#92400e',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <LightningIcon size={12} color="#92400e" />
                        Detected Intent Trigger
                      </div>
                      <div style={{ fontSize: '13px', color: '#78350f', fontWeight: 600 }}>
                        {company.buying_signal}
                      </div>
                    </div>

                    {/* LIVE SCRAPED EVIDENCE BOX (HIGH CONTRAST & READABLE TEXT) */}
                    <div className="scout-evidence-box" style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#1b5e20',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <DocumentTextIcon size={12} color="#1b5e20" />
                        <span>Live Scraped Evidence</span>
                      </div>
                      <div className="scout-evidence-text">
                        "{company.evidence_excerpt}"
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      paddingTop: '14px',
                      borderTop: '1px solid #edf1ee',
                    }}
                  >
                    {/* 1. Deep Research */}
                    <button
                      onClick={() => onNavigateToDiscover(company.company_name, company.website)}
                      className="btn btn-dark"
                      style={{
                        flex: 1,
                        fontSize: '12px',
                        padding: '8px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontWeight: 700,
                      }}
                      title="Run full bounded AI research agent on this account"
                    >
                      <SearchIcon size={13} color="#ffffff" />
                      Deep Research
                    </button>

                    {/* 2. SAVE LEAD BUTTON (HIGH CONTRAST & CLEAR STATE) */}
                    <button
                      onClick={() => handleSaveToLeads(company)}
                      disabled={isSaved}
                      className="btn"
                      style={{
                        fontSize: '12px',
                        padding: '8px 14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: isSaved ? '#b9f36b' : '#ffffff',
                        color: '#17221d',
                        border: isSaved ? '1.5px solid #9cd950' : '1.5px solid #243c22',
                        fontWeight: 700,
                        cursor: isSaved ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      title="Save lead to CRM pipeline"
                    >
                      {isSaved ? (
                        <>
                          <CheckIcon size={13} color="#17221d" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <BookmarkIcon size={13} color="#243c22" />
                          <span>Save Lead</span>
                        </>
                      )}
                    </button>

                    {/* 3. Visit Website */}
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        fontSize: '12px',
                        padding: '8px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#17221d',
                        border: '1px solid #d3ded6',
                      }}
                      title="Visit company website"
                    >
                      <ExternalLinkIcon size={13} color="#17221d" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
