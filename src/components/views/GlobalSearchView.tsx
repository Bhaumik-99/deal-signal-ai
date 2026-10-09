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
  { value: 'all_sectors', label: 'All Sectors (Global Scout)' },
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
  { value: 'Rapid Engineering & Product Hiring', label: '⚡ Rapid Engineering & Product Hiring' },
  { value: 'Recent Growth Capital / Series Funding', label: '💰 Recent Growth Capital / Series Funding' },
  { value: 'Cloud, CRM & AI Modernization', label: '☁️ Cloud, CRM & AI Stack Modernization' },
  { value: 'Global Enterprise Product Expansion', label: '🌍 Global Enterprise Expansion & Launches' },
  { value: 'Executive Leadership Hires (VP/CRO/CMO)', label: '👔 New Executive Leadership (VP Sales / CMO)' },
  { value: 'all_signals', label: '🎯 Any Verified Growth & Intent Signal' },
];

const ROLE_OPTIONS = [
  { value: 'VP / Head of Sales & Revenue Operations', label: 'VP / Head of Sales & Revenue Operations' },
  { value: 'CTO / VP Engineering & Infrastructure', label: 'CTO / VP Engineering & Infrastructure' },
  { value: 'CMO / VP Growth & Demand Generation', label: 'CMO / VP Growth & Demand Gen' },
  { value: 'Chief Executive Officer / Founder', label: 'CEO / Co-Founder / Executive Suite' },
  { value: 'CFO / VP Finance & Procurement', label: 'CFO / VP Finance & Procurement' },
];

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
      'Initializing Scrapling stealth HTTP fetcher (d4vinci/Scrapling)...',
      'Querying public web databases & company index registries...',
      'Bypassing anti-bot friction with TLS fingerprint spoofing...',
      'Scraping live candidate homepages, newsrooms & careers text...',
      'Grading ICP fit, revenue scale & executive intent signals...',
      'Synthesizing verified prospect dossier and citations...',
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
      onToast(`Scrapling found ${response.total_found} verified prospects in ${response.duration_ms}ms!`);
    } catch (err: any) {
      setError(err.message || 'Global search failed. Please try again.');
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
      source: 'Scrapling Global Web Search',
      is_approved: false,
    };

    onLeadSaved(newLead);
    setSavedLeadIds((prev) => new Set(prev).add(company.id));
    onToast(`Saved ${company.company_name} to Leads queue!`);
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
                gap: '0.3rem',
              }}
            >
              <span>🌐</span> Global Internet Scout
            </span>
            <a
              href="https://github.com/d4vinci/Scrapling"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#819080',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: '1px solid var(--border-color)',
                padding: '0.18rem 0.5rem',
                borderRadius: '6px',
                background: 'var(--surface-color)',
              }}
            >
              <span>⚡ Powered by d4vinci/Scrapling</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>• 100% Free</span>
            </a>
          </div>
          <h1 className="view-title" style={{ fontSize: '1.6rem', margin: 0 }}>
            Global Internet Prospect Search
          </h1>
          <p className="view-desc" style={{ marginTop: '0.35rem', maxWidth: '780px' }}>
            Scrapes the live web across global companies using the high-performance stealth scraper <strong>Scrapling</strong>.
            All 6 criteria questions are <strong>mandatory</strong> with pre-set selectors to ensure rigorous target qualification with zero paid API costs.
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
            <span>🧭</span> Mandatory Prospecting Criteria
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
              <span>⚠️</span>
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
              Scrapling Free Stealth Engine Active • No Rate Limits or Paid Search Keys
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
                  Searching Internet ({elapsedSec}s)...
                </>
              ) : (
                <>
                  <span>🔍</span> Search Entire Internet via Scrapling
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
                fontSize: '1.75rem',
                margin: '0 auto',
                animation: 'pulse 1.8s infinite ease-in-out',
              }}
            >
              🌐
            </div>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '0.4rem' }}>
            Scrapling Stealth Prospecting in Progress
          </h3>
          <p style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.75rem' }}>
            {searchStep}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#819080' }}>
            Elapsed: {elapsedSec}s • Scraping live websites via Scrapling Fetcher without paid tokens
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
                }}
              >
                100% Verified Evidence
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
                Zero Paid API Cost
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
                            gap: '0.25rem',
                          }}
                        >
                          <span>{company.domain}</span>
                          <span>↗</span>
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
                        }}
                      >
                        🏢 {company.sector}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        👥 {company.company_size}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        💵 {company.approx_revenue}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#d1d5db',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        📍 {company.region}
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
                        }}
                      >
                        ⚡ Detected Buying Intent
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
                          gap: '0.25rem',
                        }}
                      >
                        <span>🕷️ Scrapling Evidence Excerpt</span>
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
                        gap: '0.35rem',
                      }}
                      title="Run full bounded AI research agent on this company"
                    >
                      <span>🔬</span> Deep Research
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
                      <span>{isSaved ? '✓' : '💾'}</span> {isSaved ? 'Saved' : 'Save'}
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
                      ↗
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
