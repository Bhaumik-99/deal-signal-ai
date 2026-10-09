import React, { useState } from 'react';
import { LeadItem, Campaign, CampaignCompanyChat, ChatMessage } from '../../types';

interface CampaignsViewProps {
  leads: LeadItem[];
  campaigns?: Campaign[];
  onCampaignCreated?: (campaign: Campaign) => void;
  onToast: (message: string) => void;
  onNavigateToDiscover: (name: string) => void;
  onApproveLead?: (id: number) => void;
}

const getDefaultCompaniesForCampaign = (camp: Campaign): CampaignCompanyChat[] => {
  if (camp.companies && camp.companies.length > 0) {
    return camp.companies;
  }

  // Pre-seed realistic companies based on campaign id/name
  if (camp.id === 'camp-1' || camp.name.toLowerCase().includes('revops') || camp.name.toLowerCase().includes('saas')) {
    return [
      {
        companyId: `${camp.id}-c1`,
        companyName: 'Northstar Health',
        domain: 'northstarhealth.example',
        targetRole: 'VP of Revenue Operations',
        fitScore: 92,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m1`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Thought on Northstar Health scaling RevOps',
            content: 'Hi Northstar Health team,\n\nI noticed your recent expansion in RevOps and engineering. As you scale commercial systems, keeping prospect intelligence accurate without manual friction is essential.\n\nDealSignal AI helps growth teams research target accounts with verified proof before outreach. Would a short conversation next week be helpful?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Yesterday at 10:15 AM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      },
      {
        companyId: `${camp.id}-c2`,
        companyName: 'Vertex Labs',
        domain: 'vertexlabs.example',
        targetRole: 'Head of Sales & GTM Systems',
        fitScore: 87,
        status: 'replied',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m2`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'European enterprise rollout & account research',
            content: 'Hi Vertex Labs team,\n\nCongratulations on launching your European sovereign tier. Expanding into new territories usually demands fresh account discovery and verification.\n\nWorth a brief chat to see how evidence-led prospecting can support this rollout?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Yesterday at 11:30 AM'
          },
          {
            id: `${camp.id}-m3`,
            sender: 'prospect',
            senderName: 'Vertex Labs (Prospect)',
            content: 'Hi Alex, thanks for reaching out. We are actually evaluating outbound automation tools this month for our EMEA expansion. Do you have 15 minutes next Tuesday at 2 PM EST?',
            timestamp: 'Today at 9:42 AM'
          }
        ]
      },
      {
        companyId: `${camp.id}-c3`,
        companyName: 'Linear',
        domain: 'linear.app',
        targetRole: 'Head of Customer Operations',
        fitScore: 94,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m4`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Outbound pipeline efficiency for Linear',
            content: 'Hi Linear team,\n\nI was reviewing your commercial focus and developer tooling momentum. When scaling enterprise accounts, surfacing verified intent signals without manual research friction makes a significant difference.\n\nWould 15 minutes next week be helpful to discuss how DealSignal AI can support your pipeline priorities?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Today at 8:10 AM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      },
      {
        companyId: `${camp.id}-c4`,
        companyName: 'Retool',
        domain: 'retool.com',
        targetRole: 'VP of Commercial Sales',
        fitScore: 89,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m5`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Scaling enterprise outbound at Retool',
            content: 'Hi Retool team,\n\nCongratulations on your continued expansion into enterprise developer platforms. Scaling outbound pipeline with verified company evidence ensures every interaction is timely and relevant.\n\nWould next Wednesday work for a quick introductory conversation?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Today at 10:05 AM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      }
    ];
  } else if (camp.id === 'camp-2' || camp.name.toLowerCase().includes('health')) {
    return [
      {
        companyId: `${camp.id}-c1`,
        companyName: 'Abridge',
        domain: 'abridge.com',
        targetRole: 'VP of Enterprise Partnerships',
        fitScore: 95,
        status: 'replied',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m1`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Clinical AI growth & account intelligence for Abridge',
            content: 'Hi Abridge team,\n\nCongratulations on your recent health system expansions. Scaling provider accounts with verified clinical operations signals ensures high-relevance outreach.\n\nWould 15 minutes next week be helpful to discuss how DealSignal AI supports your team?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: '2 days ago at 2:15 PM'
          },
          {
            id: `${camp.id}-m2`,
            sender: 'prospect',
            senderName: 'Abridge (Prospect)',
            content: 'Thanks for reaching out Alex. We are scaling our enterprise hospital partnerships team this quarter. Could you send over a deck and your calendar link?',
            timestamp: 'Yesterday at 4:30 PM'
          }
        ]
      },
      {
        companyId: `${camp.id}-c2`,
        companyName: 'Komodo Health',
        domain: 'komodohealth.com',
        targetRole: 'Head of Commercial Sales',
        fitScore: 88,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m3`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Life sciences commercial intelligence for Komodo',
            content: 'Hi Komodo Health team,\n\nI was looking into your recent healthcare data platform momentum. As you expand commercial teams, verified buying signals ensure precision without outbound friction.\n\nWould 15 minutes next week work to explore this?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Today at 9:00 AM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      },
      {
        companyId: `${camp.id}-c3`,
        companyName: 'Definitive Healthcare',
        domain: 'definitivehc.com',
        targetRole: 'VP of Sales Operations',
        fitScore: 84,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m4`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Healthcare enterprise outreach efficiency',
            content: 'Hi Definitive Healthcare team,\n\nKeeping target account research accurate before sales outreach is essential as teams scale. DealSignal provides verified context for each prospective conversation.\n\nWould next Thursday be convenient for a brief chat?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Today at 11:20 AM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      }
    ];
  } else {
    // Default fallback companies for E-Commerce or any custom campaign
    return [
      {
        companyId: `${camp.id}-c1`,
        companyName: 'Shopify',
        domain: 'shopify.com',
        targetRole: 'VP of Merchant Solutions',
        fitScore: 96,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m1`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Enterprise commerce pipeline acceleration',
            content: 'Hi Shopify team,\n\nI was reviewing your enterprise merchant platform initiatives. Scaling high-value accounts with verified commercial signals provides a distinct advantage.\n\nWould 15 minutes next week be helpful to discuss?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Yesterday at 3:00 PM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      },
      {
        companyId: `${camp.id}-c2`,
        companyName: 'commercetools',
        domain: 'commercetools.com',
        targetRole: 'Head of Enterprise Sales',
        fitScore: 90,
        status: 'replied',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m2`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Composable commerce outbound strategy',
            content: 'Hi commercetools team,\n\nComposable enterprise architectures are moving fast. When reaching prospective retail leaders, verified signals and proof ensure timely conversations.\n\nWould you have 15 minutes next week for a brief exploration?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Yesterday at 1:45 PM'
          },
          {
            id: `${camp.id}-m3`,
            sender: 'prospect',
            senderName: 'commercetools (Prospect)',
            content: 'Hi Alex, good timing. We are expanding our US enterprise team. What does integration look like with our CRM?',
            timestamp: 'Today at 10:15 AM'
          }
        ]
      },
      {
        companyId: `${camp.id}-c3`,
        companyName: 'Klaviyo',
        domain: 'klaviyo.com',
        targetRole: 'Director of RevOps & Demand Gen',
        fitScore: 91,
        status: 'waiting',
        agentActive: true,
        messages: [
          {
            id: `${camp.id}-m4`,
            sender: 'agent',
            senderName: 'DealSignal AI Agent (Alex)',
            subject: 'Outbound revenue intelligence for Klaviyo',
            content: 'Hi Klaviyo team,\n\nI noticed your recent enterprise B2B momentum. As you expand commercial teams, keeping target account research grounded in verified evidence eliminates prospecting waste.\n\nWould a 15-minute sync next week be of interest?\n\nBest,\nAlex Smith\nDealSignal AI',
            timestamp: 'Today at 8:30 AM'
          }
        ],
        waitingNote: 'Awaiting prospect reply • Follow-up #1 scheduled in 3 days'
      }
    ];
  }
};

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  leads,
  campaigns: externalCampaigns,
  onCampaignCreated,
  onToast,
  onNavigateToDiscover,
  onApproveLead
}) => {
  const [selectedLeadForDraft, setSelectedLeadForDraft] = useState<LeadItem | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignIcp, setNewCampaignIcp] = useState('');

  // Per-campaign company chat store
  const [campaignChatsStore, setCampaignChatsStore] = useState<Record<string, CampaignCompanyChat[]>>({});
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companySearchFilter, setCompanySearchFilter] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState<'all' | 'waiting' | 'replied' | 'human'>('all');
  const [humanMessageText, setHumanMessageText] = useState('');

  const [internalCampaigns, setInternalCampaigns] = useState<Campaign[]>([
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
  ]);

  const campaigns = externalCampaigns ?? internalCampaigns;
  const approvedLeads = leads.filter((l) => l.is_approved);
  const pendingLeads = leads.filter((l) => !l.is_approved);

  const getCompaniesForSelectedCampaign = (camp: Campaign): CampaignCompanyChat[] => {
    if (campaignChatsStore[camp.id]) {
      return campaignChatsStore[camp.id];
    }
    const initialList = getDefaultCompaniesForCampaign(camp);
    return initialList;
  };

  const handleSelectCampaign = (camp: Campaign) => {
    setSelectedCampaign(camp);
    const comps = getCompaniesForSelectedCampaign(camp);
    if (!campaignChatsStore[camp.id]) {
      setCampaignChatsStore((prev) => ({
        ...prev,
        [camp.id]: comps,
      }));
    }
    setSelectedCompanyId(comps[0]?.companyId || null);
    setHumanMessageText('');
    setCompanySearchFilter('');
    setCompanyStatusFilter('all');
  };

  const handleToggleAgentStatus = (companyId: string) => {
    if (!selectedCampaign) return;
    const currentList = getCompaniesForSelectedCampaign(selectedCampaign);
    const updated = currentList.map((c) => {
      if (c.companyId === companyId) {
        const nextActive = !c.agentActive;
        onToast(
          nextActive
            ? `AI Agent resumed auto-pilot for ${c.companyName}.`
            : `AI Agent stopped for ${c.companyName}. Human text box activated!`
        );
        return {
          ...c,
          agentActive: nextActive,
        };
      }
      return c;
    });

    setCampaignChatsStore((prev) => ({
      ...prev,
      [selectedCampaign.id]: updated,
    }));
  };

  const handleSendHumanMessage = (companyId: string) => {
    if (!selectedCampaign || !humanMessageText.trim()) return;
    const currentList = getCompaniesForSelectedCampaign(selectedCampaign);
    const textToSend = humanMessageText.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = currentList.map((c) => {
      if (c.companyId === companyId) {
        const newMsg: ChatMessage = {
          id: `msg-human-${Date.now()}`,
          sender: 'human',
          senderName: 'You (Human Representative)',
          content: textToSend,
          timestamp: `Today at ${nowTime}`,
        };
        return {
          ...c,
          messages: [...c.messages, newMsg],
          waitingNote: 'Human message dispatched. Awaiting reply.',
        };
      }
      return c;
    });

    setCampaignChatsStore((prev) => ({
      ...prev,
      [selectedCampaign.id]: updated,
    }));
    setHumanMessageText('');
    onToast('Message sent as Human Representative!');
  };

  const handleSimulateReplyInChat = (companyId: string) => {
    if (!selectedCampaign) return;
    const currentList = getCompaniesForSelectedCampaign(selectedCampaign);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = currentList.map((c) => {
      if (c.companyId === companyId) {
        const newMsg: ChatMessage = {
          id: `msg-prospect-${Date.now()}`,
          sender: 'prospect',
          senderName: `${c.companyName} (Prospect Buyer)`,
          content: `Hi Alex,\n\nThanks for reaching out! We are currently re-evaluating our outbound tools for next quarter. Could you send over a deck and your calendar link for next Tuesday at 2 PM EST?\n\nBest,\n${c.companyName} Team`,
          timestamp: `Today at ${nowTime}`,
        };
        return {
          ...c,
          status: 'replied' as const,
          messages: [...c.messages, newMsg],
          waitingNote: undefined,
        };
      }
      return c;
    });

    setCampaignChatsStore((prev) => ({
      ...prev,
      [selectedCampaign.id]: updated,
    }));
    onToast(`Simulated incoming reply received from prospect!`);
  };

  const handleCopyDraft = async (lead: LeadItem) => {
    const textToCopy = `Subject: ${lead.outreach_subject || 'Outbound connection'}\n\n${lead.outreach_draft || 'No draft body available.'}`;
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
      onToast(`Copied draft for "${lead.name}" to clipboard.`);
    } catch {
      onToast('Failed to copy to clipboard.');
    }
  };

  const handleCopyAllApproved = async () => {
    if (approvedLeads.length === 0) {
      onToast('No approved leads to copy.');
      return;
    }
    const combined = approvedLeads
      .map(
        (l, i) =>
          `=== LEAD ${i + 1}: ${l.name} (${l.domain || ''}) ===\nSubject: ${
            l.outreach_subject || ''
          }\n\n${l.outreach_draft || ''}\n`
      )
      .join('\n\n----------------------------------------\n\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(combined);
      }
      onToast(`Copied all ${approvedLeads.length} approved drafts to clipboard.`);
    } catch {
      onToast('Failed to copy drafts.');
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampaignName.trim(),
      tagline: `${newCampaignIcp || 'Custom ICP'} · Verified Outbound`,
      icp: newCampaignIcp || 'Custom prospect profile',
      signal_filter: 'All signals',
      status: 'Active draft',
      leads_count: approvedLeads.length
    };

    if (onCampaignCreated) {
      onCampaignCreated(newCamp);
    } else {
      setInternalCampaigns([newCamp, ...internalCampaigns]);
    }
    setShowNewCampaignModal(false);
    setNewCampaignName('');
    setNewCampaignIcp('');
    onToast(`Campaign "${newCamp.name}" created with ${approvedLeads.length} leads assigned.`);
  };

  // ================= VIEW A: CAMPAIGN CHAT & COMMUNICATION VIEW =================
  if (selectedCampaign) {
    const currentCompanies = getCompaniesForSelectedCampaign(selectedCampaign);
    const filteredCompanies = currentCompanies.filter((c) => {
      const matchesSearch = companySearchFilter
        ? c.companyName.toLowerCase().includes(companySearchFilter.toLowerCase()) ||
          c.domain.toLowerCase().includes(companySearchFilter.toLowerCase())
        : true;
      if (!matchesSearch) return false;

      if (companyStatusFilter === 'waiting') return c.status === 'waiting';
      if (companyStatusFilter === 'replied') return c.status === 'replied';
      if (companyStatusFilter === 'human') return !c.agentActive;
      return true;
    });

    const activeCompany =
      currentCompanies.find((c) => c.companyId === selectedCompanyId) || currentCompanies[0];

    const waitingCount = currentCompanies.filter((c) => c.status === 'waiting').length;
    const repliedCount = currentCompanies.filter((c) => c.status === 'replied').length;
    const humanCount = currentCompanies.filter((c) => !c.agentActive).length;

    return (
      <section className="page active" id="page-campaign-detail">
        {/* Top Breadcrumb & Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            paddingBottom: '14px',
            borderBottom: '1px solid #dbe3dc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="btn btn-outline"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: '#ffffff',
                }}
              >
                ← Back to All Campaigns
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#17221d', letterSpacing: '-0.02em' }}>
                {selectedCampaign.name}
              </h1>
              <span className="pill pill-high" style={{ fontSize: '10px' }}>
                {selectedCampaign.status}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#68776e', margin: 0 }}>
              {selectedCampaign.tagline} • <strong>{currentCompanies.length} Target Companies</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                const csv = `Company,Domain,Target Role,Fit Score,Status,Agent Mode\n${currentCompanies
                  .map(
                    (c) =>
                      `"${c.companyName}","${c.domain}","${c.targetRole}",${c.fitScore},"${c.status}","${
                        c.agentActive ? 'AI Agent' : 'Human Control'
                      }"`
                  )
                  .join('\n')}`;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedCampaign.name.toLowerCase().replace(/\s+/g, '_')}_chats.csv`;
                a.click();
                onToast('Exported campaign communications to CSV.');
              }}
              style={{ fontSize: '12px', padding: '7px 12px' }}
            >
              📥 Export CSV
            </button>
            <button
              className="btn btn-dark"
              onClick={() => setSelectedCampaign(null)}
              style={{ fontSize: '12px', padding: '7px 14px' }}
            >
              Done / Close
            </button>
          </div>
        </div>

        {/* WORKSTATION: Two-Column Chat Center */}
        <div
          className="panel"
          style={{
            padding: 0,
            overflow: 'hidden',
            borderRadius: '14px',
            border: '1px solid #dbe3dc',
            background: '#ffffff',
            boxShadow: '0 8px 25px rgba(23, 34, 29, 0.05)',
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            height: 'calc(88vh - 120px)',
            minHeight: '620px',
          }}
        >
          {/* LEFT COLUMN: Companies List */}
          <div
            style={{
              borderRight: '1px solid #edf1ee',
              background: '#fafcfa',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Search Box */}
            <div style={{ padding: '14px', borderBottom: '1px solid #edf1ee' }}>
              <input
                type="text"
                placeholder="Search companies in campaign..."
                value={companySearchFilter}
                onChange={(e) => setCompanySearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '7px',
                  border: '1px solid #d3ded6',
                  fontSize: '12px',
                  background: '#ffffff',
                  outline: 'none',
                }}
              />

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCompanyStatusFilter('all')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    background: companyStatusFilter === 'all' ? '#243c22' : '#eef2ee',
                    color: companyStatusFilter === 'all' ? '#ffffff' : '#56665c',
                  }}
                >
                  All ({currentCompanies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyStatusFilter('waiting')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    background: companyStatusFilter === 'waiting' ? '#243c22' : '#eef2ee',
                    color: companyStatusFilter === 'waiting' ? '#ffffff' : '#56665c',
                  }}
                >
                  Waiting ({waitingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyStatusFilter('replied')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    background: companyStatusFilter === 'replied' ? '#243c22' : '#eef2ee',
                    color: companyStatusFilter === 'replied' ? '#ffffff' : '#56665c',
                  }}
                >
                  Replied ({repliedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCompanyStatusFilter('human')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    background: companyStatusFilter === 'human' ? '#243c22' : '#eef2ee',
                    color: companyStatusFilter === 'human' ? '#ffffff' : '#56665c',
                  }}
                >
                  Human ({humanCount})
                </button>
              </div>
            </div>

            {/* Scrollable Company Directory */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {filteredCompanies.map((c) => {
                const isSelected = activeCompany?.companyId === c.companyId;

                return (
                  <div
                    key={c.companyId}
                    onClick={() => {
                      setSelectedCompanyId(c.companyId);
                      setHumanMessageText('');
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? '#e4efe6' : '#ffffff',
                      border: isSelected ? '1.5px solid #243c22' : '1px solid #edf1ee',
                      marginBottom: '8px',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(23, 34, 29, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: c.agentActive ? '#243c22' : '#d97706',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {c.companyName[0]?.toUpperCase() || 'C'}
                        </span>
                        <div>
                          <b style={{ fontSize: '13px', color: '#17221d', display: 'block' }}>
                            {c.companyName}
                          </b>
                          <small style={{ color: '#7c8980', fontSize: '11px' }}>{c.domain}</small>
                        </div>
                      </div>

                      <span className="pill pill-high" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        Fit {c.fitScore}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      {c.status === 'replied' ? (
                        <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 700 }}>
                          💬 Replied • Interested
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#b45309', fontWeight: 600 }}>
                          ⏳ Waiting for reply
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: c.agentActive ? '#e2e8f0' : '#fef3c7',
                          color: c.agentActive ? '#475569' : '#b45309',
                        }}
                      >
                        {c.agentActive ? '🤖 Agent Auto' : '👤 Human Takeover'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Specific Company Chat Box */}
          {activeCompany ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: '#ffffff',
              }}
            >
              {/* Chat Box Header with Agent Auto-Reply Toggle */}
              <div
                style={{
                  padding: '16px 22px',
                  borderBottom: '1px solid #edf1ee',
                  background: '#f9fbf9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#17221d' }}>
                      {activeCompany.companyName}
                    </h3>
                    <a
                      href={`https://${activeCompany.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#215c32', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {activeCompany.domain} ↗
                    </a>
                    <span className="pill pill-high" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      Fit {activeCompany.fitScore} / 100
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#68776e', marginTop: '2px' }}>
                    Target Buyer Persona: <strong>{activeCompany.targetRole}</strong>
                  </div>
                </div>

                {/* Agent Control & Demo Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {activeCompany.status === 'waiting' && (
                    <button
                      type="button"
                      onClick={() => handleSimulateReplyInChat(activeCompany.companyId)}
                      className="btn"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        color: '#166534',
                        cursor: 'pointer',
                      }}
                      title="Simulate receiving a response from this company in demo mode"
                    >
                      ⚡ Simulate Prospect Reply
                    </button>
                  )}

                  {/* MANDATORY: Button to Stop Agent from replying / Activate human text box */}
                  <button
                    type="button"
                    onClick={() => handleToggleAgentStatus(activeCompany.companyId)}
                    className="btn"
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '7px 14px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: activeCompany.agentActive ? '#fff1f2' : '#f0fdf4',
                      border: activeCompany.agentActive ? '1.5px solid #f43f5e' : '1.5px solid #16a34a',
                      color: activeCompany.agentActive ? '#be123c' : '#15803d',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    title={
                      activeCompany.agentActive
                        ? 'Stop AI agent auto-replies and activate human message text box'
                        : 'Resume AI agent auto-reply'
                    }
                  >
                    {activeCompany.agentActive ? (
                      <>
                        <span>🛑</span>
                        <span>Stop Agent Auto-Reply</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>Resume AI Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '8px 22px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: activeCompany.agentActive ? '#f0f9ff' : '#fefce8',
                  borderBottom: '1px solid #edf1ee',
                  color: activeCompany.agentActive ? '#0369a1' : '#a16207',
                }}
              >
                <span>
                  {activeCompany.agentActive
                    ? '🤖 AI Agent is actively managing replies for this account.'
                    : '👤 Human Representative takeover active — AI Agent is stopped. Write your message below.'}
                </span>

                <span style={{ fontSize: '10px', color: '#68776e' }}>
                  {activeCompany.status === 'replied'
                    ? '✓ Prospect responded'
                    : '⏳ Waiting for prospect reply'}
                </span>
              </div>

              {/* Chat Message Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: '#fbfcfb',
                }}
              >
                {activeCompany.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  const isHuman = msg.sender === 'human';
                  const isProspect = msg.sender === 'prospect';

                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isProspect ? 'flex-start' : 'flex-end',
                        maxWidth: '82%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isProspect ? 'flex-start' : 'flex-end',
                      }}
                    >
                      {/* Message Metadata Header */}
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#68776e',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <strong style={{ color: isProspect ? '#15803d' : isHuman ? '#92400e' : '#1e3a8a' }}>
                          {msg.senderName}
                        </strong>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        style={{
                          padding: '14px 18px',
                          borderRadius: isProspect
                            ? '14px 14px 14px 3px'
                            : '14px 14px 3px 14px',
                          background: isProspect
                            ? '#ffffff'
                            : isHuman
                            ? '#fef3c7'
                            : '#243c22',
                          color: isProspect ? '#17221d' : isHuman ? '#17221d' : '#ffffff',
                          border: isProspect
                            ? '1px solid #dbe3dc'
                            : isHuman
                            ? '1px solid #fde68a'
                            : 'none',
                          boxShadow: '0 2px 8px rgba(23, 34, 29, 0.04)',
                          fontSize: '13px',
                          lineHeight: 1.6,
                        }}
                      >
                        {msg.subject && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 800,
                              marginBottom: '8px',
                              paddingBottom: '6px',
                              borderBottom: isAgent
                                ? '1px solid rgba(255,255,255,0.2)'
                                : '1px solid rgba(0,0,0,0.08)',
                            }}
                          >
                            {msg.subject}
                          </div>
                        )}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      </div>
                    </div>
                  );
                })}

                {/* In-stream Waiting Card */}
                {activeCompany.status === 'waiting' && (
                  <div
                    style={{
                      alignSelf: 'center',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px dashed #c9d6cc',
                      fontSize: '11px',
                      color: '#68776e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '10px 0',
                    }}
                  >
                    <span>⏳</span>
                    <span>
                      {activeCompany.waitingNote ||
                        'Awaiting prospect response • Next follow-up email scheduled in 3 days'}
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar (Activated when Agent is Stopped) */}
              <div
                style={{
                  padding: '16px 22px',
                  borderTop: '1px solid #edf1ee',
                  background: '#ffffff',
                }}
              >
                {activeCompany.agentActive ? (
                  /* Locked state when agent is active */
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: '#f4f7f4',
                      border: '1px dashed #c9d6cc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#56665c' }}>
                      🤖 <strong>AI Agent is handling auto-replies.</strong> To write and send messages as a human, stop the agent.
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleAgentStatus(activeCompany.companyId)}
                      className="btn btn-outline"
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      Take Over as Human →
                    </button>
                  </div>
                ) : (
                  /* Unlocked state: Human representative can type & send */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#92400e' }}>
                        👤 Human Representative Message Box (Active)
                      </label>
                      <span style={{ fontSize: '10px', color: '#68776e' }}>
                        Press Send to deliver custom outreach directly
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <textarea
                        rows={2}
                        value={humanMessageText}
                        onChange={(e) => setHumanMessageText(e.target.value)}
                        placeholder={`Write custom message to ${activeCompany.companyName} as human representative...`}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid #d97706',
                          fontSize: '13px',
                          outline: 'none',
                          fontFamily: 'inherit',
                          resize: 'none',
                          background: '#fffdfa',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleSendHumanMessage(activeCompany.companyId)}
                        disabled={!humanMessageText.trim()}
                        className="btn btn-dark"
                        style={{
                          padding: '0 20px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: !humanMessageText.trim() ? 'not-allowed' : 'pointer',
                          opacity: !humanMessageText.trim() ? 0.5 : 1,
                          background: '#243c22',
                          color: '#b9f36b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>Send</span>
                        <span>📤</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#68776e' }}>
              Select a company from the left to view its communication thread.
            </div>
          )}
        </div>
      </section>
    );
  }

  // ================= VIEW B: CAMPAIGNS MAIN LIST VIEW =================
  return (
    <section className="page active" id="page-campaigns">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <h1>Campaigns & Outreach Queue</h1>
            <span className="pill pill-high" style={{ fontSize: '10px' }}>
              {approvedLeads.length} Approved Ready
            </span>
          </div>
          <p>
            Organize human-approved drafts into outbound workflows. Review verified messaging, chat
            with prospect accounts, stop AI agent replies for human takeover, or export to CSV.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          {approvedLeads.length > 0 && (
            <button className="btn btn-outline" onClick={handleCopyAllApproved}>
              📋 Copy All Approved ({approvedLeads.length})
            </button>
          )}
          <button className="btn btn-dark" onClick={() => setShowNewCampaignModal(true)}>
            ＋ New campaign
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="stat-card">
          <small>Approved Ready For Dispatch</small>
          <div className="stat-val" style={{ color: '#b9f36b' }}>
            {approvedLeads.length}
          </div>
          <p style={{ fontSize: '10px', color: '#7c8980', marginTop: '4px' }}>
            {approvedLeads.length > 0
              ? 'Human verified & ready to copy/send'
              : 'Approve drafts in Discover to queue them here'}
          </p>
        </div>
        <div className="stat-card">
          <small>Pending Human Review</small>
          <div className="stat-val">{pendingLeads.length}</div>
          <p style={{ fontSize: '10px', color: '#7c8980', marginTop: '4px' }}>
            Drafts awaiting human review
          </p>
        </div>
        <div className="stat-card">
          <small>Active Campaign Sequences</small>
          <div className="stat-val">{campaigns.length}</div>
          <p style={{ fontSize: '10px', color: '#7c8980', marginTop: '4px' }}>
            Targeted segment workflows
          </p>
        </div>
      </div>

      {/* SECTION 1: APPROVED OUTREACH QUEUE */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <div className="panel-head">
          <div>
            <h3>✓ Ready for Dispatch (Approved Leads)</h3>
            <p>Prospects where evidence has been inspected and drafts approved by human review.</p>
          </div>
          <span className="pill pill-high">{approvedLeads.length} Approved</span>
        </div>

        {approvedLeads.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Fit Score</th>
                  <th>Verified Evidence Signal</th>
                  <th>Outreach Subject</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="company-cell">
                        <span className="avatar-chip">{lead.name[0]?.toUpperCase()}</span>
                        <div>
                          <b>{lead.name}</b>
                          <small>{lead.domain || 'Verified domain'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pill pill-high">{lead.score} / 100</span>
                    </td>
                    <td>
                      <div style={{ maxWidth: '260px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'block',
                            color: '#17221d'
                          }}
                        >
                          {lead.signal}
                        </span>
                        {lead.detail && (
                          <small
                            style={{
                              color: '#7c8980',
                              fontSize: '10px',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            "{lead.detail}"
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: '220px',
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {lead.outreach_subject || 'Outbound subject'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          gap: '6px',
                          alignItems: 'center'
                        }}
                      >
                        <button
                          className="btn btn-small btn-dark"
                          onClick={() => setSelectedLeadForDraft(lead)}
                        >
                          👁 View Draft
                        </button>
                        <button
                          className="btn btn-small btn-lime"
                          onClick={() => handleCopyDraft(lead)}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              color: '#7c8980',
              background: '#fafcfa',
              borderRadius: '8px'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📬</div>
            <b>No approved drafts in queue yet</b>
            <p style={{ fontSize: '11px', marginTop: '4px', maxWidth: '420px', margin: '4px auto 14px' }}>
              When you research companies in <b>Discover</b> or view <b>Leads</b>, clicking <b>"✓ Mark approved"</b> places their verified outreach drafts here for 1-click dispatch.
            </p>
            {pendingLeads.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '11px', color: '#17221d', marginRight: '8px' }}>
                  Quickly approve a pending draft:
                </span>
                {pendingLeads.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    className="btn btn-small btn-outline"
                    style={{ marginRight: '6px' }}
                    onClick={() => {
                      if (onApproveLead) onApproveLead(l.id);
                    }}
                  >
                    Approve {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: CAMPAIGN WORKFLOWS (WITH CHAT VIEW ENTRY) */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <div className="panel-head">
          <div>
            <h3>Active Campaign Workflows</h3>
            <p>Click "View Campaign →" on any workflow to view all company chats, stop agent replies, and take over as human.</p>
          </div>
          <span className="pill pill-high">{campaigns.length} Active Sequences</span>
        </div>
        <div className="campaign-list">
          {campaigns.map((camp) => (
            <div key={camp.id} className="campaign-row">
              <div>
                <b>{camp.name}</b>
                <small>{camp.tagline}</small>
              </div>
              <div>
                <b>{camp.leads_count}</b>
                <small>Prospect Accounts</small>
              </div>
              <div>
                <span
                  className={`pill ${
                    camp.status === 'Active draft'
                      ? 'pill-high'
                      : camp.status === 'In review'
                      ? 'pill-medium'
                      : 'pill-muted'
                  }`}
                >
                  {camp.status}
                </span>
              </div>
              <button
                className="text-btn"
                onClick={() => handleSelectCampaign(camp)}
                style={{ cursor: 'pointer', fontWeight: 800, color: '#243c22' }}
              >
                View Campaign & Chats →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* HUMAN IN THE LOOP NOTICE */}
      <div
        className="panel"
        style={{
          marginTop: '16px',
          padding: '16px 20px',
          background: '#f8faf6',
          border: '1px solid #e1e7df'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#2d6a4f', fontSize: '14px' }}>🛡️</span>
          <b style={{ fontSize: '11px', color: '#17221d' }}>Human takeover control is supported on all campaigns</b>
        </div>
        <p
          style={{
            fontSize: '11px',
            color: '#7c8980',
            lineHeight: 1.6,
            marginBottom: 0,
            marginTop: '4px'
          }}
        >
          Each company in every campaign sequence has an independent conversation thread. You can pause the AI agent at any moment to take over the text box as a human representative and send personalized messages directly.
        </p>
      </div>

      {/* MODAL: DRAFT INSPECTION */}
      {selectedLeadForDraft && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedLeadForDraft(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 19, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '620px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #eef2ec',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedLeadForDraft.name}</h3>
                  <span className="pill pill-high" style={{ fontSize: '9px' }}>
                    ✓ Approved Draft
                  </span>
                </div>
                <small style={{ color: '#7c8980' }}>
                  {selectedLeadForDraft.domain} · Score: {selectedLeadForDraft.score}/100
                </small>
              </div>
              <button
                className="btn btn-small"
                onClick={() => setSelectedLeadForDraft(null)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#495057' }}>
                Subject:
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  marginTop: '4px',
                  color: '#17221d',
                  background: '#f8faf6',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e1e7df'
                }}
              >
                {selectedLeadForDraft.outreach_subject || 'Outbound subject'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#495057' }}>
                Email Draft Body:
              </div>
              <div
                style={{
                  fontSize: '11px',
                  lineHeight: 1.6,
                  marginTop: '4px',
                  color: '#17221d',
                  background: '#f8faf6',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e1e7df',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}
              >
                {selectedLeadForDraft.outreach_draft || 'No draft body content available.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedLeadForDraft(null)}>
                Close
              </button>
              <button
                className="btn btn-lime"
                onClick={() => {
                  handleCopyDraft(selectedLeadForDraft);
                  setSelectedLeadForDraft(null);
                }}
              >
                📋 Copy Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW CAMPAIGN */}
      {showNewCampaignModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowNewCampaignModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 19, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #eef2ec',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px' }}>Create New Campaign</h3>
              <button
                className="btn btn-small"
                onClick={() => setShowNewCampaignModal(false)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#495057'
                  }}
                >
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 High-Growth FinTech"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #d0d7ce'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px',
                    color: '#495057'
                  }}
                >
                  Target ICP & Criteria
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Series A/B tech startups with recent funding or engineering headcount growth"
                  value={newCampaignIcp}
                  onChange={(e) => setNewCampaignIcp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    border: '1px solid #d0d7ce'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowNewCampaignModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-dark">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
