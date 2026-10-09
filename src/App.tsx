import React, { useState, useEffect } from 'react';
import { ScrollProgress } from './components/ScrollProgress';
import { ScrollTopButton } from './components/ScrollTopButton';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PlatformSection } from './components/PlatformSection';
import { WorkflowSection } from './components/WorkflowSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { Appbar } from './components/Appbar';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { DiscoverView } from './components/views/DiscoverView';
import { GlobalSearchView } from './components/views/GlobalSearchView';
import { LeadsView } from './components/views/LeadsView';
import { EvaluationLabView } from './components/views/EvaluationLabView';
import { CampaignsView } from './components/views/CampaignsView';
import { InboxView } from './components/views/InboxView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { Toast } from './components/Toast';
import { LeadItem, HealthResponse, Campaign } from './types';
import { checkHealth, fetchLeads, approveLead } from './api';

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q4 RevOps Leaders',
    tagline: 'Mid-market SaaS · Evidence-led outbound',
    icp: 'B2B Software & SaaS scaling sales and engineering teams.',
    signal_filter: 'Hiring / team growth',
    status: 'Active draft',
    leads_count: 24
  },
  {
    id: 'camp-2',
    name: 'Healthcare Growth Signals',
    tagline: 'Healthcare technology · Hiring signals',
    icp: 'Healthcare and life sciences tech providers with new facility or staff expansion.',
    signal_filter: 'Hiring / team growth',
    status: 'In review',
    leads_count: 12
  },
  {
    id: 'camp-3',
    name: 'Enterprise E-Commerce & Retail Tech',
    tagline: 'Global merchant platforms · Capital & Funding events',
    icp: 'Fast-scaling e-commerce infrastructure, payment systems, and merchants.',
    signal_filter: 'Funding event',
    status: 'Active draft',
    leads_count: 8
  }
];

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 1,
    name: 'Northstar Health',
    domain: 'northstarhealth.example',
    initial: 'N',
    signal: 'Hiring 12 engineers',
    detail: 'Verified engineering hiring signal in healthcare operations.',
    score: 92,
    status: 'Draft ready',
    type: 'Hiring / team growth',
    source: 'https://example.com/company-news',
    is_approved: false
  },
  {
    id: 2,
    name: 'Vertex Labs',
    domain: 'vertexlabs.example',
    initial: 'V',
    signal: 'New market expansion',
    detail: 'Expansion into European enterprise market with new regional hub.',
    score: 87,
    status: 'Qualified',
    type: 'New market expansion',
    source: 'https://example.com/expansion',
    is_approved: false
  },
  {
    id: 3,
    name: 'Fieldnote',
    domain: 'fieldnote.example',
    initial: 'F',
    signal: 'Series A announcement',
    detail: 'Raised $14M Series A led by Tier 1 venture firm.',
    score: 81,
    status: 'Review needed',
    type: 'Funding announcement',
    source: 'https://example.com/funding',
    is_approved: false
  },
  {
    id: 4,
    name: 'Brightpath',
    domain: 'brightpath.example',
    initial: 'B',
    signal: 'Sales team growth',
    detail: 'Hiring 5 Account Executives and RevOps Lead.',
    score: 78,
    status: 'Qualified',
    type: 'Hiring / team growth',
    source: 'https://example.com/jobs',
    is_approved: false
  },
  {
    id: 5,
    name: 'Juniper Works',
    domain: 'juniperworks.example',
    initial: 'J',
    signal: 'New product launch',
    detail: 'Launched enterprise security module for workflow automation.',
    score: 72,
    status: 'Researching',
    type: 'Product launch',
    source: 'https://example.com/launch',
    is_approved: false
  }
];

export const App: React.FC = () => {
  const [inApp, setInApp] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<any>(null);
  const [discoverInitialCompany, setDiscoverInitialCompany] = useState<string>('');
  const [discoverInitialWebsite, setDiscoverInitialWebsite] = useState<string>('');
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const showToast = (message: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    setToastTimer(timer);
  };

  useEffect(() => {
    // Initial health check
    checkHealth()
      .then((data) => setHealth(data))
      .catch(() => {
        // Backend not yet reachable or in dev startup
      });

    // Try fetching existing leads from SQLite database
    fetchLeads()
      .then((dbLeads) => {
        if (dbLeads && dbLeads.length > 0) {
          setLeads(dbLeads);
        }
      })
      .catch(() => {
        // Fall back to initial leads
      });
  }, []);

  const handleOpenApp = (page: string = 'home') => {
    setInApp(true);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackLanding = () => {
    setInApp(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDiscover = (companyName?: string, companyWebsite?: string) => {
    if (companyName) {
      setDiscoverInitialCompany(companyName);
    }
    if (companyWebsite) {
      setDiscoverInitialWebsite(companyWebsite);
    }
    setCurrentPage('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCampaigns = () => {
    setCurrentPage('campaigns');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  const handleLeadSaved = (newLead: LeadItem) => {
    setLeads((prev) => {
      const existingIdx = prev.findIndex(
        (l) => l.name.toLowerCase() === newLead.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...newLead };
        return updated;
      }
      return [newLead, ...prev];
    });
  };

  const handleApproveLead = async (id: number) => {
    try {
      await approveLead(id, true);
    } catch {
      // API call attempted
    }
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, is_approved: true, status: 'Approved draft' } : l
      )
    );
    showToast('Draft approved! Lead added to active Campaigns queue.');
  };

  return (
    <>
      <ScrollProgress />

      {!inApp ? (
        <div className="landing" id="landing">
          <Navbar onOpenApp={handleOpenApp} />
          <main>
            <Hero onOpenApp={handleOpenApp} />
            <PlatformSection />
            <WorkflowSection onOpenApp={handleOpenApp} />
            <CtaSection onOpenApp={handleOpenApp} />
          </main>
          <Footer />
        </div>
      ) : (
        <div className="app-view visible" id="appView">
          <Appbar
            currentPage={currentPage}
            onBackLanding={handleBackLanding}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            health={health}
          />
          <div className="app-layout">
            <Sidebar
              currentPage={currentPage}
              onSelectPage={(page) => {
                setCurrentPage(page);
                setSidebarOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isOpen={sidebarOpen}
            />
            <main className="main-content">
              {currentPage === 'home' && (
                <OverviewView
                  leads={leads}
                  onNavigateToDiscover={handleNavigateToDiscover}
                  onNavigateToLeads={() => setCurrentPage('leads')}
                />
              )}
              {currentPage === 'discover' && (
                <DiscoverView
                  initialCompanyName={discoverInitialCompany}
                  initialWebsite={discoverInitialWebsite}
                  onLeadSaved={handleLeadSaved}
                  onToast={showToast}
                />
              )}
              {currentPage === 'global_search' && (
                <GlobalSearchView
                  onNavigateToDiscover={handleNavigateToDiscover}
                  onNavigateToCampaigns={handleNavigateToCampaigns}
                  onLeadSaved={handleLeadSaved}
                  onCampaignCreated={handleCampaignCreated}
                  onToast={showToast}
                />
              )}
              {currentPage === 'leads' && (
                <LeadsView
                  leads={leads}
                  onNavigateToDiscover={handleNavigateToDiscover}
                  onApproveLead={handleApproveLead}
                  onToast={showToast}
                />
              )}
              {currentPage === 'evaluation' && (
                <EvaluationLabView
                  onToast={showToast}
                  onNavigateToDiscover={handleNavigateToDiscover}
                />
              )}
              {currentPage === 'campaigns' && (
                <CampaignsView
                  leads={leads}
                  campaigns={campaigns}
                  onCampaignCreated={handleCampaignCreated}
                  onToast={showToast}
                  onNavigateToDiscover={handleNavigateToDiscover}
                  onApproveLead={handleApproveLead}
                />
              )}
              {currentPage === 'inbox' && <InboxView />}
              {currentPage === 'analytics' && <AnalyticsView />}
              {currentPage === 'settings' && <SettingsView onToast={showToast} />}
            </main>
          </div>
        </div>
      )}

      <Toast message={toastMessage} />
      <ScrollTopButton />
    </>
  );
};
