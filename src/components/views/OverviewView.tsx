import React from 'react';
import { LeadItem } from '../../types';

interface OverviewViewProps {
  leads: LeadItem[];
  onNavigateToDiscover: (companyName?: string) => void;
  onNavigateToLeads: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  leads,
  onNavigateToDiscover,
  onNavigateToLeads
}) => {
  const priorityProspects = leads.slice(0, 4);
  const qualifiedCount = leads.filter(l => l.score >= 80).length;
  const draftCount = leads.filter(l => !l.is_approved).length;
  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((acc, curr) => acc + curr.score, 0) / leads.length)
    : 84;

  const scorePillClass = (score: number) => {
    if (score >= 80) return 'pill-high';
    if (score >= 60) return 'pill-medium';
    return 'pill-muted';
  };

  const statusPillClass = (status: string) => {
    if (status === 'Draft ready' || status === 'Qualified' || status === 'Approved') return 'pill-high';
    if (status === 'Review needed') return 'pill-medium';
    return 'pill-muted';
  };

  return (
    <section className="page active" id="page-home">
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p>Your pipeline at a glance. Start with a signal, not a cold guess.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-dark" onClick={() => onNavigateToDiscover()}>
            ＋ Research a company
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="panel stat-card">
          <div className="stat-top">
            Qualified leads <span className="stat-icon">◈</span>
          </div>
          <div className="stat-value">{leads.length || 128}</div>
          <div className="stat-foot">
            <span className="green">↑ 18%</span> vs. last month
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-top">
            Buying signals <span className="stat-icon">⌁</span>
          </div>
          <div className="stat-value">46</div>
          <div className="stat-foot">
            <span className="green">↑ 12 new</span> this week
          </div>
        </div>

        <div className="panel stat-card">
          <div className="stat-top">
            Drafts to review <span className="stat-icon">✉</span>
          </div>
          <div className="stat-value">{draftCount || 19}</div>
          <div className="stat-foot">Human approval required</div>
        </div>

        <div className="panel stat-card">
          <div className="stat-top">
            Avg. fit score <span className="stat-icon">◎</span>
          </div>
          <div className="stat-value">
            {avgScore}
            <span style={{ fontSize: '14px', color: '#8b978e' }}>/100</span>
          </div>
          <div className="stat-foot">Across qualified prospects</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Research activity</h3>
              <p>Company signals reviewed over the last 7 days</p>
            </div>
            <select className="select" aria-label="Chart range">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="panel-body">
            <div className="chart">
              <div className="bar-wrap">
                <div className="bar" style={{ height: '36%' }}></div>
                <span className="bar-label">Mon</span>
              </div>
              <div className="bar-wrap">
                <div className="bar" style={{ height: '55%' }}></div>
                <span className="bar-label">Tue</span>
              </div>
              <div className="bar-wrap">
                <div className="bar hot" style={{ height: '70%' }}></div>
                <span className="bar-label">Wed</span>
              </div>
              <div className="bar-wrap">
                <div className="bar" style={{ height: '46%' }}></div>
                <span className="bar-label">Thu</span>
              </div>
              <div className="bar-wrap">
                <div className="bar hot" style={{ height: '88%' }}></div>
                <span className="bar-label">Fri</span>
              </div>
              <div className="bar-wrap">
                <div className="bar" style={{ height: '64%' }}></div>
                <span className="bar-label">Sat</span>
              </div>
              <div className="bar-wrap">
                <div className="bar hot" style={{ height: '78%' }}></div>
                <span className="bar-label">Sun</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Agent activity</h3>
              <p>Latest workspace events</p>
            </div>
            <span className="pill pill-high">Live demo</span>
          </div>
          <div className="panel-body activity">
            <div className="activity-row">
              <div className="activity-icon">⌕</div>
              <div>
                <b>Company research completed</b>
                <small>Northstar Health · 8 minutes ago</small>
              </div>
            </div>
            <div className="activity-row">
              <div className="activity-icon">◎</div>
              <div>
                <b>Lead qualified: 92/100</b>
                <small>Vertex Labs · 24 minutes ago</small>
              </div>
            </div>
            <div className="activity-row">
              <div className="activity-icon">✉</div>
              <div>
                <b>Outreach draft awaiting review</b>
                <small>Fieldnote · 1 hour ago</small>
              </div>
            </div>
            <div className="activity-row">
              <div className="activity-icon">✓</div>
              <div>
                <b>Source evidence verified</b>
                <small>Brightpath · Yesterday</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Priority prospects</h3>
            <p>Best-fit accounts based on current criteria</p>
          </div>
          <button className="text-btn" onClick={onNavigateToLeads}>
            View all leads →
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>BUYING SIGNAL</th>
                <th>FIT SCORE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {priorityProspects.map((lead) => (
                <tr key={lead.id || lead.name}>
                  <td>
                    <div className="company-cell">
                      <span className="company-logo">
                        {lead.initial || lead.name[0]}
                      </span>
                      <div>
                        <b>{lead.name}</b>
                        <small>{lead.domain || 'Company research'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{lead.signal}</td>
                  <td>
                    <span className={`pill ${scorePillClass(lead.score)}`}>
                      {lead.score} / 100
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${statusPillClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-btn"
                      onClick={() => onNavigateToDiscover(lead.name)}
                    >
                      Research →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
