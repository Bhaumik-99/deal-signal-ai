import React from 'react';

interface HeroProps {
  onOpenApp: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenApp }) => {
  return (
    <section className="wrap hero" id="top">
      <div className="hero-text reveal is-visible" data-reveal="left">
        <div className="eyebrow">AI sales intelligence, with a reason to reach out</div>
        <h1>
          Find the signal.
          <br />
          <span>Start the right</span>
          <br />
          conversation.
        </h1>
        <p className="hero-copy">
          Turn company activity into your next best customer. DealSignal researches
          prospects, spots meaningful buying signals, and drafts relevant
          outreach—with evidence behind every recommendation.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-dark" onClick={() => onOpenApp('discover')}>
            Launch your agent <span>↗</span>
          </button>
          <a className="btn" href="#platform">
            Explore the platform <span>↓</span>
          </a>
        </div>
        <div className="trust">
          <div className="avatar-stack">
            <span className="avatar">AI</span>
            <span className="avatar" style={{ background: '#d9e7f2' }}>
              BD
            </span>
            <span className="avatar" style={{ background: '#f3ddc8' }}>
              ✓
            </span>
          </div>
          <span>Built for thoughtful, evidence-led outbound</span>
        </div>
        <div className="hero-note" style={{ marginTop: '10px' }}>
          No mass-blasting. Research first. Human approval always.
        </div>
      </div>

      <div className="preview-shell reveal is-visible" data-reveal="right">
        <div className="preview-top">
          <div className="mini-brand">
            <span className="mini-dot"></span> DealSignal workspace
          </div>
          <span className="live-pill">
            <i></i> Agent ready
          </span>
        </div>
        <div className="dashboard">
          <aside className="dash-side">
            <div className="dash-logo">WORKSPACE</div>
            <div className="dash-item active">
              <span className="ico">
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m3 10 9-7 9 7" />
                  <path d="M5 9v12h14V9M9 21v-7h6v7" />
                </svg>
              </span>{' '}
              Overview
            </div>
            <div className="dash-item" onClick={() => onOpenApp('discover')}>
              <span className="ico">
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 5 5" />
                </svg>
              </span>{' '}
              Discover
            </div>
            <div className="dash-item" onClick={() => onOpenApp('leads')}>
              <span className="ico">
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m12 3 8 9-8 9-8-9 8-9Z" />
                  <path d="m12 8 4 4-4 4-4-4 4-4Z" />
                </svg>
              </span>{' '}
              Leads
            </div>
            <div className="dash-item" onClick={() => onOpenApp('campaigns')}>
              <span className="ico">
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>{' '}
              Campaigns
            </div>
            <div className="dash-item" onClick={() => onOpenApp('inbox')}>
              <span className="ico">
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </span>{' '}
              Inbox
            </div>
            <div className="dash-item" onClick={() => onOpenApp('analytics')}>
              <span className="ico">
                <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>{' '}
              Analytics
            </div>
          </aside>
          <div className="dash-main">
            <div className="dash-greeting">
              <div>
                <h3>Good morning, Alex</h3>
                <p>Here's what's happening with your pipeline.</p>
              </div>
              <button className="dash-action" onClick={() => onOpenApp('discover')}>
                + New research
              </button>
            </div>
            <div className="metrics">
              <div className="metric">
                <div className="metric-label">Qualified leads</div>
                <div className="metric-num">128</div>
                <div className="metric-change">↗ 18% this month</div>
              </div>
              <div className="metric">
                <div className="metric-label">Signals found</div>
                <div className="metric-num">46</div>
                <div className="metric-change">↗ 12 new today</div>
              </div>
              <div className="metric">
                <div className="metric-label">Drafts ready</div>
                <div className="metric-num">19</div>
                <div className="metric-change">Needs review</div>
              </div>
            </div>
            <div className="panel-title">
              Fresh buying signals{' '}
              <span onClick={() => onOpenApp('leads')}>View all →</span>
            </div>
            <div className="signal-row" onClick={() => onOpenApp('discover')}>
              <div className="company-icon">N</div>
              <div>
                <div className="signal-name">Northstar Health</div>
                <div className="signal-desc">Hiring 12 engineers · 2 days ago</div>
              </div>
              <span className="score">92 fit</span>
            </div>
            <div className="signal-row" onClick={() => onOpenApp('discover')}>
              <div className="company-icon" style={{ background: '#eaf1fa' }}>
                V
              </div>
              <div>
                <div className="signal-name">Vertex Labs</div>
                <div className="signal-desc">New market expansion · 4 days ago</div>
              </div>
              <span className="score">87 fit</span>
            </div>
            <div className="signal-row" onClick={() => onOpenApp('discover')}>
              <div className="company-icon" style={{ background: '#fff0e3' }}>
                F
              </div>
              <div>
                <div className="signal-name">Fieldnote</div>
                <div className="signal-desc">Series A announcement · 1 week ago</div>
              </div>
              <span className="score">81 fit</span>
            </div>
            <div className="proof">
              <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
              </svg>{' '}
              <span>
                <b>Evidence-led AI</b> · every signal includes a source
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
