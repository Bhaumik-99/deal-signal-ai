import React, { useState } from 'react';
import { LeadItem } from '../../types';

interface LeadsViewProps {
  leads: LeadItem[];
  onNavigateToDiscover: (companyName?: string) => void;
  onApproveLead?: (id: number) => void;
  onToast?: (message: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onNavigateToDiscover,
  onApproveLead,
  onToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedLeadForDraft, setSelectedLeadForDraft] = useState<LeadItem | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.name + ' ' + (lead.signal || '') + ' ' + (lead.domain || ''))
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && lead.score >= 80) ||
      (scoreFilter === 'medium' && lead.score >= 60 && lead.score < 80);

    return matchesSearch && matchesScore;
  });

  const scorePillClass = (score: number) => {
    if (score >= 80) return 'pill-high';
    if (score >= 60) return 'pill-medium';
    return 'pill-muted';
  };

  const statusPillClass = (status: string) => {
    if (status === 'Approved draft' || status === 'Approved') return 'pill-high';
    if (status === 'Draft ready' || status === 'Qualified') return 'pill-high';
    if (status === 'Review needed') return 'pill-medium';
    return 'pill-muted';
  };

  const handleCopyDraft = async (lead: LeadItem) => {
    const textToCopy = `Subject: ${lead.outreach_subject || 'Outbound connection'}\n\n${lead.outreach_draft || 'No draft body available.'}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
      if (onToast) onToast(`Copied draft for "${lead.name}" to clipboard.`);
    } catch {
      if (onToast) onToast('Failed to copy to clipboard.');
    }
  };

  return (
    <section className="page active" id="page-leads">
      <div className="page-header">
        <div>
          <h1>Leads Workspace</h1>
          <p>
            Prospect accounts scored against your ideal customer profile with grounded evidence.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-dark" onClick={() => onNavigateToDiscover()}>
            ＋ Research new prospect
          </button>
        </div>
      </div>

      <div className="panel table-panel" style={{ marginTop: 0 }}>
        <div className="panel-head">
          <div>
            <h3>All prospects ({filteredLeads.length})</h3>
            <p id="leadCount">Filter and manage verified prospect drafts</p>
          </div>
          <div className="table-controls">
            <div className="search-wrap">
              <svg className="icon-svg" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="leadSearchInput"
                placeholder="Search by company, signal or domain..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              id="leadFilterScore"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="all">All scores</option>
              <option value="high">High fit (80+)</option>
              <option value="medium">Medium fit (60–79)</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Signal & Evidence</th>
                <th>Fit score</th>
                <th>Approval Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="leadTableBody">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="company-cell">
                        <span className="avatar-chip">
                          {lead.initial || lead.name[0]?.toUpperCase()}
                        </span>
                        <div>
                          <b>{lead.name}</b>
                          <small>{lead.domain || 'Target account'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '280px' }}>
                        <b style={{ fontSize: '11px', display: 'block', color: '#17221d' }}>
                          {lead.signal}
                        </b>
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
                      <span className={`pill ${scorePillClass(lead.score)}`}>
                        {lead.score} / 100
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${statusPillClass(lead.status)}`}>
                        {lead.is_approved ? '✓ Approved' : lead.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          gap: '6px',
                          alignItems: 'center'
                        }}
                      >
                        {lead.outreach_draft && (
                          <button
                            className="btn btn-small btn-dark"
                            onClick={() => setSelectedLeadForDraft(lead)}
                            style={{ padding: '4px 8px', fontSize: '10px' }}
                          >
                            👁 Draft
                          </button>
                        )}

                        {!lead.is_approved && onApproveLead && (
                          <button
                            className="btn btn-small btn-lime"
                            onClick={() => onApproveLead(lead.id)}
                            style={{ padding: '4px 8px', fontSize: '10px' }}
                          >
                            ✓ Approve
                          </button>
                        )}

                        <button
                          className="text-btn"
                          onClick={() => onNavigateToDiscover(lead.name)}
                          style={{ fontSize: '11px' }}
                        >
                          Research →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '30px',
                      textAlign: 'center',
                      color: '#8b958e'
                    }}
                  >
                    No matching prospects. Try a different search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAFT INSPECTION MODAL */}
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
              maxWidth: '600px',
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
                  <span
                    className={`pill ${selectedLeadForDraft.is_approved ? 'pill-high' : 'pill-medium'}`}
                    style={{ fontSize: '9px' }}
                  >
                    {selectedLeadForDraft.is_approved ? '✓ Approved' : 'Draft Ready'}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                {!selectedLeadForDraft.is_approved && onApproveLead && (
                  <button
                    className="btn btn-lime"
                    onClick={() => {
                      onApproveLead(selectedLeadForDraft.id);
                      setSelectedLeadForDraft(null);
                    }}
                  >
                    ✓ Approve and Move to Campaigns
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-dark"
                  onClick={() => setSelectedLeadForDraft(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleCopyDraft(selectedLeadForDraft)}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
