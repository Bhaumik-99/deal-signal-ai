import React, { useState } from 'react';
import { GlobalSearchCriteria, DiscoveredCompany, GlobalSearchResponse, LeadItem } from '../../types';
import { searchGlobalProspects } from '../../api';

interface GlobalSearchViewProps {
  onNavigateToDiscover: (companyName: string) => void;
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

// Refined, high-precision SVG icons
const SearchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ExternalLinkIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
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

const LightningIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TargetIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
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

  return (
    <div className="view-container" style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Sleek Minimalist Header (No AI Slop) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#34d399',
              background: 'rgba(52, 211, 153, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            Market Discovery
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>• Real-Time Web Crawler</span>
        </div>

        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
          Global Account Scout
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
          Search and scrape the live internet for accounts that strictly match your target profile.
          Every run queries active web sources in real time.
        </p>
      </div>

      {/* ICP Parameter Selector Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          borderRadius: '12px',
          background: '#0f1512',
          border: '1px solid #1e2c24',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <TargetIcon size={14} color="#34d399" />
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9' }}>
              Target Qualification Criteria
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            6 Mandatory Parameters
          </span>
        </div>

        <form onSubmit={handleSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* 1. Sector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Industry Sector <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '7px',
                  background: '#16201b',
                  color: '#f8fafc',
                  border: '1px solid #28392e',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Headcount Scale <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-select"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '7px',
                  background: '#16201b',
                  color: '#f8fafc',
                  border: '1px solid #28392e',
                  fontSize: '0.85rem',
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Annual Revenue Range <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-select"
                value={approxRevenue}
                onChange={(e) => setApproxRevenue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '7px',
                  background: '#16201b',
                  color: '#f8fafc',
                  border: '1px solid #28392e',
                  fontSize: '0.85rem',
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Geographic Market <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '7px',
                  background: '#16201b',
                  color: '#f8fafc',
                  border: '1px solid #28392e',
                  fontSize: '0.85rem',
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Buying Intent Trigger <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-select"
                value={buyingSignal}
                onChange={(e) => setBuyingSignal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '7px',
                  background: '#16201b',
                  color: '#f8fafc',
                  border: '1px solid #28392e',
                  fontSize: '0.85rem',
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
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                Target Buyer Persona <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '7px',
                  background: '#16201b',
                  color: '#f8fafc',
                  border: '1px solid #28392e',
                  fontSize: '0.85rem',
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
                marginTop: '1rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.82rem',
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid #1a271f',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Queries live web sources on demand • Direct homepage scraping
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.4rem',
                fontWeight: 600,
                fontSize: '0.85rem',
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

      {/* Subtle Premium Progress Animation */}
      {loading && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            borderRadius: '10px',
            background: '#0d1310',
            border: '1px solid #1e3126',
            marginBottom: '2rem',
          }}
        >
          <div className="scout-scan-bar" style={{ marginBottom: '1rem' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#34d399',
                  boxShadow: '0 0 8px #34d399',
                  animation: 'subtleRadarPulse 1.4s infinite ease-in-out',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f1f5f9' }}>
                {searchStep}
              </span>
            </div>

            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
              {elapsedSec}s elapsed
            </span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchResult && (
        <div>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.6rem',
              borderBottom: '1px solid #1f2e25',
            }}
          >
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                {searchResult.total_found} Accounts Identified
              </span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                • Scraped in {(searchResult.duration_ms / 1000).toFixed(2)}s
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Ranked by ICP Fit Score
            </span>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {searchResult.results.map((company, idx) => {
              const isSaved = savedLeadIds.has(company.id);
              const scoreColor =
                company.fit_score >= 85 ? '#34d399' : company.fit_score >= 70 ? '#fbbf24' : '#f87171';

              return (
                <div
                  key={company.id}
                  className="scout-card"
                  style={{
                    padding: '1.35rem',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    animationDelay: `${idx * 60}ms`,
                  }}
                >
                  <div>
                    {/* Top Row: Name, Link & Fit Score */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: '0 0 0.2rem 0',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {company.company_name}
                        </h3>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.78rem',
                            color: '#34d399',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 500,
                          }}
                        >
                          <span>{company.domain}</span>
                          <ExternalLinkIcon size={11} color="#34d399" />
                        </a>
                      </div>

                      <div
                        style={{
                          textAlign: 'center',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          background: `${scoreColor}14`,
                          border: `1px solid ${scoreColor}35`,
                        }}
                      >
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                          {company.fit_score}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: scoreColor, fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                          Match
                        </div>
                      </div>
                    </div>

                    {/* Metadata Parameter Chips (High Contrast) */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        marginBottom: '0.9rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.73rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: '#16221c',
                          color: '#e2e8f0',
                          border: '1px solid #24392d',
                          fontWeight: 500,
                        }}
                      >
                        {company.sector}
                      </span>
                      <span
                        style={{
                          fontSize: '0.73rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: '#16221c',
                          color: '#e2e8f0',
                          border: '1px solid #24392d',
                          fontWeight: 500,
                        }}
                      >
                        {company.company_size}
                      </span>
                      <span
                        style={{
                          fontSize: '0.73rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: '#16221c',
                          color: '#e2e8f0',
                          border: '1px solid #24392d',
                          fontWeight: 500,
                        }}
                      >
                        {company.approx_revenue}
                      </span>
                      <span
                        style={{
                          fontSize: '0.73rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: '#16221c',
                          color: '#e2e8f0',
                          border: '1px solid #24392d',
                          fontWeight: 500,
                        }}
                      >
                        {company.region}
                      </span>
                    </div>

                    {/* Detected Intent Signal */}
                    <div
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        background: '#1c150b',
                        border: '1px solid #4a3416',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#f59e0b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '0.15rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <LightningIcon size={11} color="#f59e0b" />
                        Detected Intent Trigger
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#fef3c7', fontWeight: 600 }}>
                        {company.buying_signal}
                      </div>
                    </div>

                    {/* LIVE SCRAPED EVIDENCE BOX (HIGH CONTRAST & READABILITY) */}
                    <div className="scout-evidence-box" style={{ marginBottom: '1.1rem' }}>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: '#34d399',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginBottom: '0.35rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <DocumentTextIcon size={12} color="#34d399" />
                        <span>Live Scraped Evidence</span>
                      </div>
                      <div className="scout-evidence-text">
                        "{company.evidence_excerpt}"
                      </div>
                    </div>
                  </div>

                  {/* Clean Bottom Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #1a2920',
                    }}
                  >
                    <button
                      onClick={() => onNavigateToDiscover(company.company_name)}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        fontSize: '0.78rem',
                        padding: '0.45rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        fontWeight: 600,
                      }}
                      title="Run full bounded AI research agent on this account"
                    >
                      <SearchIcon size={13} color="#ffffff" />
                      Deep Research
                    </button>

                    <button
                      onClick={() => handleSaveToLeads(company)}
                      disabled={isSaved}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.45rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        background: isSaved ? 'rgba(52, 211, 153, 0.15)' : undefined,
                        borderColor: isSaved ? '#34d399' : undefined,
                        color: isSaved ? '#34d399' : '#e2e8f0',
                        fontWeight: 500,
                      }}
                      title="Save lead to CRM pipeline"
                    >
                      {isSaved ? (
                        <>
                          <CheckIcon size={12} color="#34d399" />
                          Saved
                        </>
                      ) : (
                        <>
                          <BookmarkIcon size={12} color="currentColor" />
                          Save Lead
                        </>
                      )}
                    </button>

                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.45rem 0.6rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                      }}
                      title="Visit company website"
                    >
                      <ExternalLinkIcon size={12} color="currentColor" />
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
