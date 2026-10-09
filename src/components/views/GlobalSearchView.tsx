import React, { useState } from 'react';
import { GlobalSearchCriteria, DiscoveredCompany, GlobalSearchResponse, LeadItem } from '../../types';
import { searchGlobalProspects } from '../../api';

interface GlobalSearchViewProps {
  onNavigateToDiscover: (companyName: string) => void;
  onLeadSaved: (lead: LeadItem) => void;
  onToast: (msg: string) => void;
}

const SECTOR_OPTIONS = [
  { value: 'b2b_saas', label: 'B2B SaaS & Cloud Software' },
  { value: 'fintech', label: 'Fintech & Payment Infrastructure' },
  { value: 'healthcare', label: 'HealthTech & Digital Health' },
  { value: 'ai_ml', label: 'AI Infrastructure & Applied ML' },
  { value: 'ecommerce', label: 'E-Commerce Platforms & RetailTech' },
  { value: 'cybersecurity', label: 'Cybersecurity & Cloud Protection' },
  { value: 'supply_chain', label: 'Logistics & Supply Chain Tech' },
  { value: 'cleantech', label: 'CleanTech & Renewable Energy' },
  { value: 'all_sectors', label: 'All Sectors (Global Web Scout)' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-50', label: '1 – 50 employees (Early Startup)' },
  { value: '50-250', label: '50 – 250 employees (Growth / Series A-B)' },
  { value: '250-1000', label: '250 – 1,000 employees (Mid-Market)' },
  { value: '1000-5000', label: '1,000 – 5,000 employees (Scale-up Enterprise)' },
  { value: '5000+', label: '5,000+ employees (Global Enterprise)' },
];

const REVENUE_OPTIONS = [
  { value: '<$5M', label: '< $5M ARR (Seed to Early Stage)' },
  { value: '$5M-$20M', label: '$5M – $20M ARR (Scaling Growth)' },
  { value: '$20M-$100M', label: '$20M – $100M ARR (Mid-Market)' },
  { value: '$100M-$500M', label: '$100M – $500M ARR (Upper Commercial)' },
  { value: '$500M+', label: '$500M+ ARR (Enterprise Scale)' },
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
  { value: 'Cloud, CRM & AI Modernization', label: 'Cloud, CRM & AI Stack Modernization' },
  { value: 'Global Enterprise Product Expansion', label: 'Global Enterprise Expansion & Launches' },
  { value: 'Executive Leadership Hires (VP/CRO/CMO)', label: 'New Executive Leadership (VP Sales / CMO)' },
  { value: 'all_signals', label: 'Any Verified Growth & Intent Signal' },
];

const ROLE_OPTIONS = [
  { value: 'VP / Head of Sales & Revenue Operations', label: 'VP / Head of Sales & Revenue Operations' },
  { value: 'CTO / VP Engineering & Infrastructure', label: 'CTO / VP Engineering & Infrastructure' },
  { value: 'CMO / VP Growth & Demand Generation', label: 'CMO / VP Growth & Demand Gen' },
  { value: 'Chief Executive Officer / Founder', label: 'CEO / Co-Founder / Executive Suite' },
  { value: 'CFO / VP Finance & Procurement', label: 'CFO / VP Finance & Procurement' },
];

// Clean SVGs without emojis
const GlobeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SearchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SignalIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BuildingIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
    <line x1="9" y1="18" x2="9" y2="18.01" />
    <line x1="15" y1="18" x2="15" y2="18.01" />
  </svg>
);

const UsersIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const MapPinIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CompassIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const BookmarkIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ExternalLinkIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DocumentTextIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  onNavigateToDiscover,
  onLeadSaved,
  onToast,
}) => {
  // Mandatory questions state
  const [sector, setSector] = useState<string>('b2b_saas');
  const [companySize, setCompanySize] = useState<string>('50-250');
  const [approxRevenue, setApproxRevenue] = useState<string>('$10M-$50M');
  const [region, setRegion] = useState<string>('North America (US & Canada)');
  const [buyingSignal, setBuyingSignal] = useState<string>('Rapid Engineering & Product Hiring');
  const [targetRole, setTargetRole] = useState<string>('VP / Head of Sales & Revenue Operations');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    setTouched({
      sector: true,
      companySize: true,
      approxRevenue: true,
      region: true,
      buyingSignal: true,
      targetRole: true,
    });

    if (!isFormValid) {
      setError('All 6 questions are mandatory. Please select preset options for all fields.');
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
      'Issuing live web search queries across candidate domains...',
      'Discovering active companies matching sector and regional criteria...',
      'Bypassing bot friction and extracting live candidate websites...',
      'Live scraping homepages, product announcements, and career feeds...',
      'Evaluating headcount scale, revenue fit, and intent triggers...',
      'Synthesizing verified prospect dossier with live scraped citations...',
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
      onToast(`Discovered ${response.total_found} verified prospects in ${response.duration_ms}ms.`);
    } catch (err: any) {
      setError(err.message || 'Live web search failed. Please try again.');
      onToast(`Search error: ${err.message || 'Failed'}`);
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
      source: 'Live Web Search',
      is_approved: false,
    };

    onLeadSaved(newLead);
    setSavedLeadIds((prev) => new Set(prev).add(company.id));
    onToast(`Saved ${company.company_name} to Leads pipeline.`);
  };

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="section-head" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                background: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <GlobeIcon size={14} color="#34d399" />
              Live Internet Scout
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#819080',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid var(--border-color)',
                padding: '0.18rem 0.5rem',
                borderRadius: '6px',
                background: 'var(--surface-color)',
              }}
            >
              <SignalIcon size={12} color="#34d399" />
              <span>Real-Time Web Intelligence</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>• Zero Stale Data</span>
            </span>
          </div>
          <h1 className="view-title" style={{ fontSize: '1.6rem', margin: 0 }}>
            Global Internet Prospect Search
          </h1>
          <p className="view-desc" style={{ marginTop: '0.35rem', maxWidth: '780px' }}>
            Searches the entire internet in real time to locate matching prospective accounts. Every search crawls the live web on demand with zero pre-loaded records. All 6 questions are <strong>mandatory</strong>.
          </p>
        </div>
      </div>

      {/* Mandatory Criteria Form */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)',
          background: 'var(--surface-color)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CompassIcon size={18} color="#34d399" />
            Mandatory Prospecting Criteria
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 500 }}>
            * All 6 selections are required
          </span>
        </div>

        <form onSubmit={handleSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Q1: Sector */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>1. Target Sector / Industry <span style={{ color: '#f87171' }}>*</span></span>
                <span style={{ color: '#819080', fontSize: '0.75rem' }}>Pre-set</span>
              </label>
              <select
                className="input-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #141716)',
                  color: 'var(--text-color, #e5e7eb)',
                  border: touched.sector && !sector ? '1px solid #f87171' : '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                }}
              >
                {SECTOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Q2: Company Size */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>2. Company Headcount Size <span style={{ color: '#f87171' }}>*</span></span>
                <span style={{ color: '#819080', fontSize: '0.75rem' }}>Pre-set</span>
              </label>
              <select
                className="input-select"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #141716)',
                  color: 'var(--text-color, #e5e7eb)',
                  border: touched.companySize && !companySize ? '1px solid #f87171' : '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                }}
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Q3: Approx Revenue */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>3. Approx. Annual Revenue <span style={{ color: '#f87171' }}>*</span></span>
                <span style={{ color: '#819080', fontSize: '0.75rem' }}>Pre-set</span>
              </label>
              <select
                className="input-select"
                value={approxRevenue}
                onChange={(e) => setApproxRevenue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #141716)',
                  color: 'var(--text-color, #e5e7eb)',
                  border: touched.approxRevenue && !approxRevenue ? '1px solid #f87171' : '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                }}
              >
                {REVENUE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Q4: Region */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>4. Geographic Region <span style={{ color: '#f87171' }}>*</span></span>
                <span style={{ color: '#819080', fontSize: '0.75rem' }}>Pre-set</span>
              </label>
              <select
                className="input-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #141716)',
                  color: 'var(--text-color, #e5e7eb)',
                  border: touched.region && !region ? '1px solid #f87171' : '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                }}
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Q5: Buying Signal */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>5. Key Buying Signal / Trigger <span style={{ color: '#f87171' }}>*</span></span>
                <span style={{ color: '#819080', fontSize: '0.75rem' }}>Pre-set</span>
              </label>
              <select
                className="input-select"
                value={buyingSignal}
                onChange={(e) => setBuyingSignal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #141716)',
                  color: 'var(--text-color, #e5e7eb)',
                  border: touched.buyingSignal && !buyingSignal ? '1px solid #f87171' : '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                }}
              >
                {SIGNAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Q6: Target Role */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <span>6. Target Buyer Role / Persona <span style={{ color: '#f87171' }}>*</span></span>
                <span style={{ color: '#819080', fontSize: '0.75rem' }}>Pre-set</span>
              </label>
              <select
                className="input-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-card, #141716)',
                  color: 'var(--text-color, #e5e7eb)',
                  border: touched.targetRole && !targetRole ? '1px solid #f87171' : '1px solid var(--border-color)',
                  fontSize: '0.88rem',
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
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangleIcon size={16} color="#f87171" />
              <span>{error}</span>
            </div>
          )}

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#819080', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              Real-Time Search Active • Live Web Scraping with 0 Pre-Stored Records
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }} />
                  Searching Live Web ({elapsedSec}s)...
                </>
              ) : (
                <>
                  <SearchIcon size={16} color="#ffffff" />
                  Search Live Internet
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Scraping Telemetry Progress */}
      {loading && (
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 24, 20, 0.95), rgba(10, 15, 13, 0.95))',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.1)',
                border: '2px solid #34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                animation: 'pulse 1.8s infinite ease-in-out',
              }}
            >
              <GlobeIcon size={28} color="#34d399" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '0.4rem' }}>
            Real-Time Web Intelligence in Progress
          </h3>
          <p style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.75rem' }}>
            {searchStep}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#819080' }}>
            Elapsed: {elapsedSec}s • Live HTTP crawling of candidate company websites without pre-cached databases
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchResult && (
        <div style={{ marginBottom: '2rem' }}>
          {/* Results Summary Ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6' }}>
                {searchResult.total_found} Companies Discovered
              </span>
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#819080' }}>
                in {searchResult.duration_ms}ms • Engine: {searchResult.scraping_engine}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <CheckIcon size={12} color="#34d399" />
                Live Web Evidence
              </span>
              <span
                style={{
                  background: 'rgba(96, 165, 250, 0.15)',
                  color: '#60a5fa',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                }}
              >
                Zero Pre-Loaded Records
              </span>
            </div>
          </div>

          {/* Prospect Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {searchResult.results.map((company) => {
              const isSaved = savedLeadIds.has(company.id);
              const scoreColor =
                company.fit_score >= 85 ? '#34d399' : company.fit_score >= 70 ? '#fbbf24' : '#f87171';

              return (
                <div
                  key={company.id}
                  className="card"
                  style={{
                    padding: '1.35rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div>
                    {/* Top Row: Title, Domain & Score Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.2rem 0' }}>
                          {company.company_name}
                        </h3>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.78rem',
                            color: '#819080',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span>{company.domain}</span>
                          <ExternalLinkIcon size={12} color="#819080" />
                        </a>
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          background: `${scoreColor}15`,
                          border: `1px solid ${scoreColor}40`,
                        }}
                      >
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                          {company.fit_score}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: scoreColor, fontWeight: 600, textTransform: 'uppercase' }}>
                          Fit Score
                        </div>
                      </div>
                    </div>

                    {/* Metadata Chips */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        marginBottom: '0.9rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <BuildingIcon size={12} color="#9ca3af" />
                        {company.sector}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <UsersIcon size={12} color="#9ca3af" />
                        {company.company_size}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <DollarIcon size={12} color="#9ca3af" />
                        {company.approx_revenue}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <MapPinIcon size={12} color="#9ca3af" />
                        {company.region}
                      </span>
                    </div>

                    {/* Buying Signal Box */}
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#fbbf24',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          marginBottom: '0.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <SignalIcon size={12} color="#fbbf24" />
                        Detected Buying Intent
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#f3f4f6', fontWeight: 500 }}>
                        {company.buying_signal}
                      </div>
                    </div>

                    {/* Scraped Evidence Box */}
                    <div
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '1rem',
                        fontSize: '0.78rem',
                        color: '#9ca3af',
                        lineHeight: 1.45,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: '#34d399',
                          fontWeight: 600,
                          marginBottom: '0.3rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <DocumentTextIcon size={12} color="#34d399" />
                        <span>Live Scraped Evidence</span>
                      </div>
                      <div style={{ fontStyle: 'italic' }}>
                        "{company.evidence_excerpt}"
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                    }}
                  >
                    <button
                      onClick={() => onNavigateToDiscover(company.company_name)}
                      className="btn btn-primary"
                      style={{
                        flex: 1,
                        fontSize: '0.78rem',
                        padding: '0.5rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                      title="Run full bounded AI research agent on this company"
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
                        padding: '0.5rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        background: isSaved ? 'rgba(52, 211, 153, 0.2)' : undefined,
                        borderColor: isSaved ? '#34d399' : undefined,
                        color: isSaved ? '#34d399' : undefined,
                      }}
                      title="Save lead to CRM pipeline"
                    >
                      {isSaved ? (
                        <>
                          <CheckIcon size={13} color="#34d399" />
                          Saved
                        </>
                      ) : (
                        <>
                          <BookmarkIcon size={13} color="currentColor" />
                          Save
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
                        padding: '0.5rem 0.6rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Visit company website"
                    >
                      <ExternalLinkIcon size={13} color="currentColor" />
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
