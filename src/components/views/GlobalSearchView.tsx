import React, { useState } from 'react';
import { GlobalSearchCriteria, DiscoveredCompany, GlobalSearchResponse, LeadItem, Campaign, CampaignCompanyChat } from '../../types';
import { searchGlobalProspects } from '../../api';

interface GlobalSearchViewProps {
  onNavigateToDiscover: (companyName: string, companyWebsite?: string) => void;
  onNavigateToCampaigns?: () => void;
  onLeadSaved: (lead: LeadItem) => void;
  onCampaignCreated?: (campaign: Campaign) => void;
  onToast: (msg: string) => void;
}

interface CampaignEmailDraft {
  companyId: string;
  companyName: string;
  domain: string;
  website: string;
  targetRole: string;
  subject: string;
  body: string;
  fitScore: number;
  status: 'sent' | 'replied';
  replyMessage?: string;
  sentAt?: string;
  followUpSent?: boolean;
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

const MAX_OUTPUT_OPTIONS = [
  { value: 10, label: '10 Accounts (Fast Scout)' },
  { value: 25, label: '25 Accounts (Recommended)' },
  { value: 50, label: '50 Accounts (Deep Pipeline)' },
  { value: 100, label: '100 Accounts (Maximum Capacity)' },
];

// SVG icons
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

const DownloadIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SendIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MessageSquareIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const FolderIcon: React.FC<{ size?: number; color?: string }> = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  onNavigateToDiscover,
  onNavigateToCampaigns,
  onLeadSaved,
  onCampaignCreated,
  onToast,
}) => {
  // Search criteria form states
  const [sector, setSector] = useState<string>('b2b_saas');
  const [companySize, setCompanySize] = useState<string>('50-250');
  const [approxRevenue, setApproxRevenue] = useState<string>('$10M-$50M');
  const [region, setRegion] = useState<string>('North America (US & Canada)');
  const [buyingSignal, setBuyingSignal] = useState<string>('Rapid Engineering & Product Hiring');
  const [targetRole, setTargetRole] = useState<string>('VP / Head of Sales & Revenue Operations');
  const [maxResults, setMaxResults] = useState<number>(25);

  const [loading, setLoading] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<string>('');
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<GlobalSearchResponse | null>(null);
  const [savedLeadIds, setSavedLeadIds] = useState<Set<string>>(new Set());

  // Campaign State
  const [campaignName, setCampaignName] = useState<string>('');
  const [campaignNameError, setCampaignNameError] = useState<string | null>(null);
  const [campaignDrafts, setCampaignDrafts] = useState<Record<string, CampaignEmailDraft>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<'split' | 'feed'>('split');
  const [selectedReviewCompId, setSelectedReviewCompId] = useState<string | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [campaignPhase, setCampaignPhase] = useState<'idle' | 'sending' | 'active'>('idle');
  const [dispatchProgress, setDispatchProgress] = useState<number>(0);
  const [dispatchCompany, setDispatchCompany] = useState<string>('');
  const [viewDetailDraft, setViewDetailDraft] = useState<CampaignEmailDraft | null>(null);

  const isFormValid =
    Boolean(sector) &&
    Boolean(companySize) &&
    Boolean(approxRevenue) &&
    Boolean(region) &&
    Boolean(buyingSignal) &&
    Boolean(targetRole) &&
    Boolean(maxResults);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Please select valid options for all prospecting parameters.');
      return;
    }

    setError(null);
    setLoading(true);
    setElapsedSec(0);
    setSearchResult(null);
    setCampaignPhase('idle');

    const timer = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);

    const stepMessages = [
      'Initiating live internet queries across market sources...',
      'Discovering qualified domains matching ICP criteria...',
      'Performing live HTTP extraction of company sites...',
      'Parsing career listings, leadership announcements & growth signals...',
      'Computing ICP fit scores and extracting evidence quotes...',
      'Finalizing account dossiers and citation records...',
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
      max_results: maxResults,
    };

    try {
      const response = await searchGlobalProspects(criteria);
      setSearchResult(response);

      // Pre-generate consultative personalized email drafts for all discovered companies
      const draftsMap: Record<string, CampaignEmailDraft> = {};
      response.results.forEach((c) => {
        draftsMap[c.id] = {
          companyId: c.id,
          companyName: c.company_name,
          domain: c.domain,
          website: c.website,
          targetRole: c.target_role,
          fitScore: c.fit_score,
          subject: `Thought on ${c.company_name}'s commercial expansion`,
          body: `Hi ${c.company_name} team,\n\nI was reviewing ${c.company_name}'s recent commercial momentum and customer solutions in ${c.sector}.\n\nWhen scaling go-to-market systems across ${c.region}, identifying verified prospect accounts with real intent triggers—without manual research overhead—becomes a major competitive advantage.\n\nDealSignal AI equips revenue teams with verified buying signals and customer context before outbound contact. Would a 15-minute conversation next week be helpful to discuss whether this aligns with ${c.company_name}'s outbound priorities?\n\nBest regards,\nOutbound Growth Team\nDealSignal AI`,
          status: 'sent',
          sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });

      setCampaignDrafts(draftsMap);
      setSelectedReviewCompId(response.results[0]?.id || null);
      // Pre-fill a smart default campaign name
      const defaultCampaignTitle = `${criteria.sector.replace('_', ' ').toUpperCase()} Outbound (${criteria.region.split(' ')[0]})`;
      setCampaignName(defaultCampaignTitle);
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
      'Scraped Timestamp',
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
      escapeCsv(c.scraped_timestamp),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `discovered_prospects_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast('Exported prospect list as CSV');
  };

  // Launch Campaign Flow
  const handleOpenReviewModal = () => {
    if (!searchResult || searchResult.results.length === 0) return;
    setCampaignNameError(null);
    setIsReviewModalOpen(true);
  };

  const handleUpdateDraft = (companyId: string, field: 'subject' | 'body', value: string) => {
    setCampaignDrafts((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [field]: value,
      },
    }));
  };

  const handleConfirmAndLaunchCampaign = async () => {
    if (!campaignName.trim()) {
      setCampaignNameError('Campaign name is required to start and track the campaign.');
      return;
    }

    setCampaignNameError(null);
    setIsReviewModalOpen(false);
    setCampaignPhase('sending');
    setDispatchProgress(0);

    const companies = searchResult?.results || [];
    const total = companies.length;

    for (let i = 0; i < total; i++) {
      const c = companies[i];
      setDispatchCompany(c.company_name);
      setDispatchProgress(Math.round(((i + 1) / total) * 100));
      await new Promise((r) => setTimeout(r, Math.max(25, Math.min(100, 1400 / total))));
    }

    // Add campaign to global campaigns list in Campaigns tab with complete prospect chats
    const finalCampaignName = campaignName.trim();
    if (onCampaignCreated && searchResult) {
      const chatCompanies: CampaignCompanyChat[] = searchResult.results.map((c) => {
        const d = campaignDrafts[c.id];
        return {
          companyId: c.id,
          companyName: c.company_name,
          domain: c.domain,
          website: c.website,
          targetRole: c.target_role,
          fitScore: c.fit_score,
          status: 'waiting',
          agentActive: true,
          messages: [
            {
              id: `msg-${c.id}-1`,
              sender: 'agent',
              senderName: 'DealSignal AI Agent (Alex)',
              subject: d?.subject || `Thought on ${c.company_name}'s commercial expansion`,
              content: d?.body || `Hi ${c.company_name} team,\n\nI was reviewing your commercial focus and expansion initiatives. When scaling operations across ${c.region}, identifying high-fit accounts with verified buying triggers without manual research overhead becomes a major competitive advantage.\n\nDealSignal AI equips revenue teams with verified buying signals and customer context before outbound contact. Would 15 minutes next week be helpful to discuss whether this aligns with ${c.company_name}'s outbound priorities?\n\nBest regards,\nOutbound Growth Team\nDealSignal AI`,
              timestamp: 'Today, ' + (d?.sentAt || 'just now')
            }
          ],
          waitingNote: 'Awaiting prospect response • Follow-up #1 scheduled in 3 days'
        };
      });

      const newCamp: Campaign = {
        id: `camp-${Date.now()}`,
        name: finalCampaignName,
        tagline: `${sector.replace('_', ' ').toUpperCase()} · ${region} · Discovered via Global Search`,
        icp: `Targeting ${targetRole} in ${companySize} employee companies (${approxRevenue} ARR).`,
        signal_filter: buyingSignal,
        status: 'Active draft',
        leads_count: searchResult.total_found,
        companies: chatCompanies,
      };
      onCampaignCreated(newCamp);
    }

    setCampaignPhase('active');
    onToast(`Campaign "${finalCampaignName}" launched! Sent ${total} emails and added to Campaigns tab.`);
  };

  const handleSimulateReply = (companyId: string) => {
    const draft = campaignDrafts[companyId];
    if (!draft) return;

    setCampaignDrafts((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        status: 'replied',
        replyMessage: `Hi Alex,\n\nThanks for reaching out! We are currently scaling our commercial stack this quarter. Would love to review a deck or schedule a quick 15-minute call next Tuesday at 2 PM EST.\n\nBest,\n${draft.companyName} Team`,
      },
    }));

    onToast(`New prospect reply logged from ${draft.companyName}!`);
  };

  const handleSendFollowUp = (companyId: string) => {
    const draft = campaignDrafts[companyId];
    if (!draft) return;

    setCampaignDrafts((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        followUpSent: true,
      },
    }));

    onToast(`Follow-up #1 dispatched to ${draft.companyName} (Demo)`);
  };

  const allDraftsList = searchResult ? searchResult.results.map((c) => campaignDrafts[c.id]).filter(Boolean) : [];
  const filteredReviewList = allDraftsList.filter((d) =>
    reviewSearchQuery ? d.companyName.toLowerCase().includes(reviewSearchQuery.toLowerCase()) : true
  );
  const activeSelectedDraft = selectedReviewCompId ? campaignDrafts[selectedReviewCompId] : allDraftsList[0];

  const totalSent = allDraftsList.length;
  const totalReplies = allDraftsList.filter((d) => d.status === 'replied').length;
  const totalWaiting = totalSent - totalReplies;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '70px' }}>
      {/* View Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#243c22',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#243c22',
            }}
          >
            Live Web Prospector & Multi-Account Cadence
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#17221d', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
          Global Real-Time Account Discovery
        </h1>
        <p style={{ fontSize: '13px', color: '#56665c', margin: 0, maxWidth: '820px', lineHeight: 1.5 }}>
          Search the live internet for verified enterprise accounts matching your precise ICP parameters.
          Select output options up to 100 accounts, name your campaign, review emails, and launch automated cadences.
        </p>
      </div>

      {/* SEARCH FORM PANEL */}
      <div
        className="panel"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #dbe3dc',
          boxShadow: '0 4px 18px rgba(23, 34, 29, 0.04)',
          marginBottom: '24px',
        }}
      >
        <form onSubmit={handleSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                Intent & Buying Trigger <span style={{ color: '#dc2626' }}>*</span>
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

            {/* 7. Search Output Limit (Up to 100) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                Search Output Options (Max 100) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                className="input-select"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#f2f8f3',
                  color: '#17221d',
                  border: '1.5px solid #243c22',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                {MAX_OUTPUT_OPTIONS.map((opt) => (
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
              Queries live web sources in real time • Output up to 100 verified company websites
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
                  Discover Accounts (Max {maxResults})
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

      {/* SENDING SIMULATION OVERLAY */}
      {campaignPhase === 'sending' && (
        <div
          className="panel"
          style={{
            padding: '28px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '2px solid #243c22',
            marginBottom: '26px',
            boxShadow: '0 8px 30px rgba(36, 60, 34, 0.12)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#243c22', color: '#b9f36b', marginBottom: '14px' }}>
            <SendIcon size={22} color="#b9f36b" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#17221d', margin: '0 0 6px 0' }}>
            Dispatching Campaign "{campaignName}"...
          </h3>
          <p style={{ fontSize: '13px', color: '#56665c', margin: '0 0 18px 0' }}>
            Delivering personalized message to <strong>{dispatchCompany}</strong> ({dispatchProgress}%)
          </p>

          <div style={{ width: '100%', maxWidth: '480px', height: '8px', background: '#e5ece6', borderRadius: '999px', margin: '0 auto', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${dispatchProgress}%`,
                background: '#243c22',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* ACTIVE CAMPAIGN DASHBOARD */}
      {campaignPhase === 'active' && searchResult && (
        <div style={{ marginBottom: '32px' }}>
          {/* Header Banner */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: '12px',
              background: '#243c22',
              color: '#ffffff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 6px 24px rgba(36, 60, 34, 0.15)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: '#b9f36b',
                    color: '#17221d',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    letterSpacing: '0.04em',
                  }}
                >
                  🟢 Campaign Active • Emails Dispatched
                </span>
                <span style={{ fontSize: '12px', color: '#d2e3d5' }}>
                  Added to Campaigns Tab
                </span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Campaign "{campaignName}" Active ({totalSent} Accounts)
              </h2>
              <div style={{ fontSize: '12px', color: '#b9cfbe' }}>
                Initial outreach emails sent. Waiting for prospect replies and scheduled follow-ups.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {onNavigateToCampaigns && (
                <button
                  type="button"
                  onClick={onNavigateToCampaigns}
                  className="btn"
                  style={{
                    background: '#b9f36b',
                    color: '#17221d',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FolderIcon size={13} color="#17221d" />
                  View in Campaigns Tab →
                </button>
              )}

              <button
                type="button"
                onClick={() => setCampaignPhase('idle')}
                className="btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                ← Return to Search Results
              </button>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div className="panel" style={{ padding: '16px 20px', borderRadius: '10px', background: '#ffffff', border: '1px solid #dbe3dc' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Emails Dispatched</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#17221d', marginTop: '4px' }}>{totalSent}</div>
              <div style={{ fontSize: '11px', color: '#243c22', fontWeight: 600, marginTop: '2px' }}>100% Delivered (Demo)</div>
            </div>

            <div className="panel" style={{ padding: '16px 20px', borderRadius: '10px', background: '#ffffff', border: '1px solid #dbe3dc' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Waiting for Follow-up</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>{totalWaiting}</div>
              <div style={{ fontSize: '11px', color: '#78716c', fontWeight: 600, marginTop: '2px' }}>In follow-up cadence</div>
            </div>

            <div className="panel" style={{ padding: '16px 20px', borderRadius: '10px', background: '#ffffff', border: '1px solid #dbe3dc' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Responses Received</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>{totalReplies}</div>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>Interested prospects</div>
            </div>

            <div className="panel" style={{ padding: '16px 20px', borderRadius: '10px', background: '#ffffff', border: '1px solid #dbe3dc' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#68776e', textTransform: 'uppercase' }}>Next Cadence Touchpoint</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#17221d', marginTop: '10px' }}>In 3 business days</div>
              <div style={{ fontSize: '11px', color: '#68776e', fontWeight: 600, marginTop: '2px' }}>Follow-up #1 scheduled</div>
            </div>
          </div>

          {/* Account Cadence List */}
          <div className="panel" style={{ padding: '20px', borderRadius: '12px', background: '#ffffff', border: '1px solid #dbe3dc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#17221d', margin: 0 }}>
                Active Prospect Cadence Queue ({allDraftsList.length} Accounts)
              </h3>
              <div style={{ fontSize: '12px', color: '#68776e' }}>
                Click "Simulate Reply" to demo incoming prospect interaction
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allDraftsList.map((draft) => {
                const hasReplied = draft.status === 'replied';

                return (
                  <div
                    key={draft.companyId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '9px',
                      border: '1px solid #edf1ee',
                      background: hasReplied ? '#f3faf4' : '#fafcfa',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: hasReplied ? '#243c22' : '#e5ece6',
                          color: hasReplied ? '#b9f36b' : '#27382d',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {draft.companyName[0]?.toUpperCase() || 'C'}
                      </span>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#17221d' }}>
                            {draft.companyName}
                          </span>
                          <span style={{ fontSize: '12px', color: '#68776e' }}>({draft.domain})</span>
                          <span className="pill pill-high" style={{ fontSize: '9px', padding: '1px 6px' }}>
                            Fit: {draft.fitScore}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#56665c', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Target: <strong>{draft.targetRole}</strong> • Subject: <em>{draft.subject}</em>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {hasReplied ? (
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 9px',
                            borderRadius: '6px',
                          }}
                        >
                          ✓ Replied • Interested
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 9px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#b45309',
                              display: 'inline-block',
                            }}
                          />
                          Sent • Waiting for follow-up
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setViewDetailDraft(draft)}
                        className="btn"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '5px 10px',
                          background: '#ffffff',
                          border: '1px solid #d3ded6',
                          color: '#17221d',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        View Email
                      </button>

                      {!hasReplied && (
                        <button
                          type="button"
                          onClick={() => handleSimulateReply(draft.companyId)}
                          className="btn"
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 10px',
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            color: '#166534',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                          title="Simulate receiving an enthusiastic prospect reply in demo mode"
                        >
                          <MessageSquareIcon size={11} color="#166534" />
                          Simulate Reply
                        </button>
                      )}

                      {!draft.followUpSent && !hasReplied && (
                        <button
                          type="button"
                          onClick={() => handleSendFollowUp(draft.companyId)}
                          className="btn"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '5px 10px',
                            background: '#ffffff',
                            border: '1px solid #d3ded6',
                            color: '#56665c',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                          title="Trigger Follow-up #1 now (Demo)"
                        >
                          Send Follow-up (Demo)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RESULTS LIST (When not in active campaign dashboard) */}
      {searchResult && campaignPhase === 'idle' && (
        <div>
          {/* HIGH-CONTRAST RESULTS RIBBON WITH PRIMARY CTA BUTTON TO START CAMPAIGN FOR ALL */}
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
              {/* PRIMARY CTA: START CAMPAIGN FOR ALL */}
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="btn btn-dark"
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '8px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: '#243c22',
                  color: '#b9f36b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(36, 60, 34, 0.25)',
                }}
                title="Start outbound campaign for all discovered accounts"
              >
                <SendIcon size={14} color="#b9f36b" />
                <span>Start Campaign for All ({searchResult.total_found} Accounts)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="btn"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '7px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f2f6f2',
                  color: '#17221d',
                  border: '1px solid #c8d6cb',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Download CSV export of all live scraped accounts"
              >
                <DownloadIcon size={13} color="#17221d" />
                <span>Download CSV</span>
              </button>
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
                    animationDelay: `${idx * 40}ms`,
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
                        marginBottom: '10px',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              background: '#243c22',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {company.company_name[0]?.toUpperCase() || 'C'}
                          </span>
                          <h3
                            style={{
                              fontSize: '16px',
                              fontWeight: 800,
                              color: '#17221d',
                              margin: 0,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {company.company_name}
                          </h3>
                        </div>

                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px',
                            color: '#215c32',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px',
                          }}
                        >
                          <span>{company.domain}</span>
                          <ExternalLinkIcon size={11} color="#215c32" />
                        </a>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span
                          className="pill pill-high"
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '3px 8px',
                          }}
                        >
                          ICP {company.fit_score}
                        </span>
                        <span className="pill pill-medium" style={{ fontSize: '9px', padding: '1px 6px' }}>
                          Live Crawled
                        </span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '5px',
                        marginBottom: '12px',
                      }}
                    >
                      <span className="scout-tag">{company.sector}</span>
                      <span className="scout-tag">{company.company_size}</span>
                      <span className="scout-tag">{company.approx_revenue}</span>
                      <span className="scout-tag">{company.region}</span>
                    </div>

                    {/* Target Persona */}
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#495950',
                        marginBottom: '10px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#f2f6f3',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#17221d' }}>Target Role:</span>
                      <span>{company.target_role}</span>
                    </div>

                    {/* Live Scraped Evidence Snippet */}
                    <div
                      style={{
                        marginBottom: '16px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8faf8',
                        border: '1px solid #e1ebe2',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#243c22',
                          letterSpacing: '0.04em',
                          marginBottom: '4px',
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

                    {/* 2. SAVE LEAD BUTTON */}
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

      {/* CONFIRMATION & EMAIL EDIT REVIEW MODAL (WITH DEDICATED SCROLLING & COMPULSORY CAMPAIGN NAME) */}
      {isReviewModalOpen && searchResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(23, 34, 29, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '1100px',
              height: '90vh',
              maxHeight: '840px',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(23, 34, 29, 0.3)',
              overflow: 'hidden',
              border: '1px solid #c9d6cc',
            }}
          >
            {/* Modal Top Header with Compulsory Campaign Name Input */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #dbe3dc',
                background: '#f9fbf9',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#17221d', margin: 0, letterSpacing: '-0.02em' }}>
                    Confirm & Review Campaign Emails
                  </h2>
                  <span className="pill pill-high" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {searchResult.total_found} Accounts Targeted
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* View Mode Toggle: Split vs Continuous Feed */}
                  <div
                    style={{
                      display: 'inline-flex',
                      background: '#e8efe9',
                      borderRadius: '7px',
                      padding: '2px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setReviewMode('split')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        background: reviewMode === 'split' ? '#ffffff' : 'transparent',
                        color: reviewMode === 'split' ? '#17221d' : '#68776e',
                        boxShadow: reviewMode === 'split' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      Split Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewMode('feed')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        background: reviewMode === 'feed' ? '#ffffff' : 'transparent',
                        color: reviewMode === 'feed' ? '#17221d' : '#68776e',
                        boxShadow: reviewMode === 'feed' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      Scroll All Emails ({allDraftsList.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    style={{
                      fontSize: '18px',
                      background: 'transparent',
                      border: 'none',
                      color: '#68776e',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Compulsory Campaign Name Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: campaignNameError ? '1.5px solid #dc2626' : '1px solid #cfe0d2',
                  boxShadow: '0 2px 6px rgba(23, 34, 29, 0.03)',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <label
                    htmlFor="campaign-name-input"
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#17221d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Campaign Name <span style={{ color: '#dc2626' }}>*</span>
                    <span style={{ fontSize: '10px', color: '#68776e', fontWeight: 500 }}>(Compulsory to start)</span>
                  </label>
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    id="campaign-name-input"
                    type="text"
                    required
                    value={campaignName}
                    onChange={(e) => {
                      setCampaignName(e.target.value);
                      if (campaignNameError) setCampaignNameError(null);
                    }}
                    placeholder="Enter campaign name (e.g. Q4 FinTech Expansion Cadence)..."
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d3ded6',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#17221d',
                      outline: 'none',
                      background: '#fafcfa',
                    }}
                  />
                </div>
              </div>

              {campaignNameError && (
                <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700, margin: '-4px 0 0 4px' }}>
                  ⚠️ {campaignNameError}
                </div>
              )}
            </div>

            {/* Modal Body: Scrollable Content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative' }}>
              {reviewMode === 'split' ? (
                /* SPLIT VIEW: Left list + Right editor */
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '320px 1fr',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {/* Left Pane: Scrollable Accounts List */}
                  <div
                    style={{
                      borderRight: '1px solid #dbe3dc',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#fafcfa',
                      height: '100%',
                    }}
                  >
                    <div style={{ padding: '12px', borderBottom: '1px solid #edf1ee' }}>
                      <input
                        type="text"
                        placeholder="Search accounts in queue..."
                        value={reviewSearchQuery}
                        onChange={(e) => setReviewSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #d3ded6',
                          fontSize: '12px',
                          background: '#ffffff',
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                      {filteredReviewList.map((draft) => {
                        const isSelected = activeSelectedDraft?.companyId === draft.companyId;

                        return (
                          <div
                            key={draft.companyId}
                            onClick={() => setSelectedReviewCompId(draft.companyId)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isSelected ? '#e2eee4' : '#ffffff',
                              border: isSelected ? '1.5px solid #243c22' : '1px solid #edf1ee',
                              marginBottom: '6px',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#17221d' }}>
                                {draft.companyName}
                              </span>
                              <span className="pill pill-high" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                Fit {draft.fitScore}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#68776e', marginTop: '2px' }}>
                              {draft.domain} • {draft.targetRole.split('/')[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Pane: Scrollable Email Editor */}
                  {activeSelectedDraft && (
                    <div
                      style={{
                        padding: '24px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        height: '100%',
                        background: '#ffffff',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '12px',
                          borderBottom: '1px solid #edf1ee',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: '#17221d' }}>
                            Outreach Email Draft for {activeSelectedDraft.companyName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#68776e' }}>
                            Target Buyer Persona: <strong>{activeSelectedDraft.targetRole}</strong>
                          </div>
                        </div>

                        <a
                          href={activeSelectedDraft.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: '#215c32', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span>{activeSelectedDraft.domain}</span>
                          <ExternalLinkIcon size={11} color="#215c32" />
                        </a>
                      </div>

                      {/* Subject Line Input */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                          Email Subject Line
                        </label>
                        <input
                          type="text"
                          value={activeSelectedDraft.subject}
                          onChange={(e) => handleUpdateDraft(activeSelectedDraft.companyId, 'subject', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #d3ded6',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#17221d',
                            background: '#fafcfa',
                          }}
                        />
                      </div>

                      {/* Body Textarea */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#27382d', marginBottom: '6px' }}>
                          Personalized Outreach Body (Editable)
                        </label>
                        <textarea
                          rows={12}
                          value={activeSelectedDraft.body}
                          onChange={(e) => handleUpdateDraft(activeSelectedDraft.companyId, 'body', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px solid #d3ded6',
                            fontSize: '13px',
                            lineHeight: 1.6,
                            color: '#17221d',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            background: '#fafcfa',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* FEED VIEW: Full scroll through ALL emails consecutively */
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    background: '#f8faf8',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#56665c', marginBottom: '-8px' }}>
                    Showing all {allDraftsList.length} generated outreach emails. You can scroll through and edit any email in place:
                  </div>

                  {allDraftsList.map((draft, idx) => (
                    <div
                      key={draft.companyId}
                      className="panel"
                      style={{
                        padding: '20px',
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #dbe3dc',
                        boxShadow: '0 2px 10px rgba(23, 34, 29, 0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #edf1ee', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#243c22', color: '#b9f36b', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {idx + 1}
                          </span>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#17221d' }}>{draft.companyName}</span>
                            <span style={{ fontSize: '12px', color: '#68776e', marginLeft: '6px' }}>({draft.domain})</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="pill pill-high" style={{ fontSize: '10px', padding: '2px 8px' }}>
                            ICP Fit {draft.fitScore}
                          </span>
                          <span style={{ fontSize: '11px', color: '#495950' }}>
                            Target: <strong>{draft.targetRole}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '4px' }}>
                          Subject
                        </label>
                        <input
                          type="text"
                          value={draft.subject}
                          onChange={(e) => handleUpdateDraft(draft.companyId, 'subject', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #d3ded6',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#17221d',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#27382d', marginBottom: '4px' }}>
                          Message Body
                        </label>
                        <textarea
                          rows={6}
                          value={draft.body}
                          onChange={(e) => handleUpdateDraft(draft.companyId, 'body', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #d3ded6',
                            fontSize: '12px',
                            lineHeight: 1.5,
                            color: '#17221d',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Compulsory Launch Button */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #dbe3dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9fbf9',
              }}
            >
              <div style={{ fontSize: '12px', color: '#68776e' }}>
                {campaignName.trim() ? (
                  <span>Ready to dispatch to {searchResult.total_found} accounts as <strong>"{campaignName.trim()}"</strong></span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>Please specify a Campaign Name above to enable launch</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="btn"
                  style={{
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid #d3ded6',
                    background: '#ffffff',
                    color: '#17221d',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                {/* COMPULSORY LAUNCH BUTTON */}
                <button
                  type="button"
                  onClick={handleConfirmAndLaunchCampaign}
                  disabled={!campaignName.trim()}
                  className="btn btn-dark"
                  style={{
                    padding: '10px 22px',
                    fontSize: '13px',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: !campaignName.trim() ? '#94a398' : '#243c22',
                    color: '#b9f36b',
                    cursor: !campaignName.trim() ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: !campaignName.trim() ? 'none' : '0 2px 10px rgba(36, 60, 34, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  title={!campaignName.trim() ? 'Enter a campaign name to enable launch' : 'Launch campaign and queue emails'}
                >
                  <SendIcon size={14} color="#b9f36b" />
                  <span>Launch Campaign ({searchResult.total_found} Emails)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SENT EMAIL MODAL */}
      {viewDetailDraft && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(23, 34, 29, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '640px',
              background: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 20px 45px rgba(23, 34, 29, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #edf1ee', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#17221d' }}>
                  Sent Outreach to {viewDetailDraft.companyName}
                </h3>
                <span style={{ fontSize: '11px', color: '#68776e' }}>
                  Delivered at {viewDetailDraft.sentAt} • Target: {viewDetailDraft.targetRole}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailDraft(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#68776e' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#68776e' }}>SUBJECT</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#17221d', marginTop: '2px' }}>
                {viewDetailDraft.subject}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#68776e', marginBottom: '4px' }}>MESSAGE</div>
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: '#f8faf8',
                  border: '1px solid #e2ebe4',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#17221d',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {viewDetailDraft.body}
              </div>
            </div>

            {viewDetailDraft.replyMessage && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>
                  INCOMING PROSPECT REPLY (DEMO)
                </div>
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#14532d',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {viewDetailDraft.replyMessage}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewDetailDraft(null)}
                className="btn btn-dark"
                style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 700, borderRadius: '7px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
