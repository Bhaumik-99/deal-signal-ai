import React, { useState } from 'react';
import { LeadItem, Campaign } from '../../types';

interface CampaignsViewProps {
  leads: LeadItem[];
  campaigns?: Campaign[];
  onCampaignCreated?: (campaign: Campaign) => void;
  onToast: (message: string) => void;
  onNavigateToDiscover: (name: string) => void;
  onApproveLead?: (id: number) => void;
}

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
            Organize human-approved drafts into outbound workflows. Review verified messaging, copy
            drafts to your cadence tools, or export to CSV.
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

      {/* SECTION 2: CAMPAIGN WORKFLOWS */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <div className="panel-head">
          <div>
            <h3>Active Campaign Workflows</h3>
            <p>Structured outbound sequences grouped by ICP and buying triggers.</p>
          </div>
          <span className="pill pill-muted">Human Dispatch Only</span>
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
                <small>Prospects</small>
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
                onClick={() => setSelectedCampaign(camp)}
                style={{ cursor: 'pointer', fontWeight: 600 }}
              >
                View Campaign →
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
          <b style={{ fontSize: '11px', color: '#17221d' }}>Human approval is strictly enforced</b>
        </div>
        <p
          style={{
            fontSize: '10px',
            color: '#7c8980',
            lineHeight: 1.6,
            marginBottom: 0,
            marginTop: '4px'
          }}
        >
          DealSignal AI enforces human review before any outreach can leave the platform. You can copy approved drafts into Smartlead, Instantly, Gmail, or Apollo, but no autonomous outbound emails will ever be dispatched automatically.
        </p>
      </div>

      {/* MODAL 1: DRAFT INSPECTION MODAL */}
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

            {/* EVIDENCE CITATION */}
            <div
              style={{
                background: '#f8faf6',
                border: '1px solid #e3ebe1',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#2d6a4f',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}
              >
                Verified Supporting Evidence
              </div>
              <p style={{ fontSize: '11px', margin: 0, color: '#17221d', fontStyle: 'italic' }}>
                "{selectedLeadForDraft.detail || selectedLeadForDraft.signal}"
              </p>
              {selectedLeadForDraft.source && (
                <div style={{ marginTop: '6px' }}>
                  <a
                    href={selectedLeadForDraft.source}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '10px', color: '#2d6a4f', textDecoration: 'underline' }}
                  >
                    View Source URL ↗
                  </a>
                </div>
              )}
            </div>

            {/* SUBJECT */}
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
                Subject Line
              </label>
              <input
                type="text"
                readOnly
                value={selectedLeadForDraft.outreach_subject || 'Outbound subject'}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d0d7ce',
                  background: '#fafcfa'
                }}
              />
            </div>

            {/* BODY */}
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
                Personalized Email Draft
              </label>
              <textarea
                readOnly
                rows={9}
                value={selectedLeadForDraft.outreach_draft || 'No draft body.'}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  borderRadius: '6px',
                  border: '1px solid #d0d7ce',
                  background: '#fafcfa',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* MODAL ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  onNavigateToDiscover(selectedLeadForDraft.name);
                  setSelectedLeadForDraft(null);
                }}
              >
                Re-research in Discover →
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-dark"
                  onClick={() => setSelectedLeadForDraft(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-lime"
                  onClick={() => {
                    handleCopyDraft(selectedLeadForDraft);
                    setSelectedLeadForDraft(null);
                  }}
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CAMPAIGN DETAILS MODAL */}
      {selectedCampaign && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedCampaign(null)}
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
              maxWidth: '680px',
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
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedCampaign.name}</h3>
                  <span className="pill pill-high" style={{ fontSize: '9px' }}>
                    {selectedCampaign.status}
                  </span>
                </div>
                <small style={{ color: '#7c8980' }}>{selectedCampaign.tagline}</small>
              </div>
              <button
                className="btn btn-small"
                onClick={() => setSelectedCampaign(null)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#495057' }}>
                Ideal Customer Profile (ICP) Target:
              </div>
              <p style={{ fontSize: '11px', color: '#17221d', marginTop: '4px' }}>
                {selectedCampaign.icp}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#495057', marginBottom: '8px' }}>
                Prospect Accounts in this Campaign ({approvedLeads.length} Approved Active):
              </div>
              {approvedLeads.length > 0 ? (
                <div style={{ border: '1px solid #e1e7df', borderRadius: '8px', overflow: 'hidden' }}>
                  {approvedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f0f4ee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#ffffff'
                      }}
                    >
                      <div>
                        <b>{lead.name}</b> · <small style={{ color: '#7c8980' }}>{lead.domain}</small>
                        <div style={{ fontSize: '10px', color: '#556057', marginTop: '2px' }}>
                          Signal: {lead.signal}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-small"
                          onClick={() => {
                            setSelectedCampaign(null);
                            setSelectedLeadForDraft(lead);
                          }}
                        >
                          👁 Draft
                        </button>
                        <button
                          className="btn btn-small btn-lime"
                          onClick={() => handleCopyDraft(lead)}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    background: '#f8faf6',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#7c8980'
                  }}
                >
                  No approved leads assigned yet. Click "Mark approved" on any prospect to attach them here.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  const csv = `Company,Domain,Score,Signal,Subject\n${approvedLeads
                    .map(
                      (l) =>
                        `"${l.name}","${l.domain || ''}",${l.score},"${l.signal}","${l.outreach_subject || ''}"`
                    )
                    .join('\n')}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedCampaign.name.toLowerCase().replace(/\s+/g, '_')}_leads.csv`;
                  a.click();
                  onToast('Exported campaign leads to CSV.');
                }}
              >
                📥 Export Campaign CSV
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-dark" onClick={() => setSelectedCampaign(null)}>
                  Close
                </button>
                {approvedLeads.length > 0 && (
                  <button className="btn btn-lime" onClick={handleCopyAllApproved}>
                    📋 Copy All Drafts
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW CAMPAIGN MODAL */}
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
                marginBottom: '16px'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px' }}>Create New Outbound Campaign</h3>
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
                    border: '1px solid #d0d7ce',
                    fontFamily: 'inherit'
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
