import React from 'react';

export const AnalyticsView: React.FC = () => {
  return (
    <section className="page active" id="page-analytics">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Track the quality of research and qualification—not just activity volume.</p>
        </div>
        <span className="pill pill-muted">Illustrative evaluation metrics</span>
      </div>

      <div className="stat-grid">
        <div className="panel stat-card">
          <div className="stat-top">Evidence coverage</div>
          <div className="stat-value">
            91<span style={{ fontSize: '14px', color: '#8b978e' }}>%</span>
          </div>
          <div className="stat-foot">Prospects with source-backed signals</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-top">Avg. fit score</div>
          <div className="stat-value">
            84<span style={{ fontSize: '14px', color: '#8b978e' }}>/100</span>
          </div>
          <div className="stat-foot">Against current ICP</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-top">Draft approval</div>
          <div className="stat-value">
            76<span style={{ fontSize: '14px', color: '#8b978e' }}>%</span>
          </div>
          <div className="stat-foot">Human review rate</div>
        </div>
        <div className="panel stat-card">
          <div className="stat-top">Unsupported claims</div>
          <div className="stat-value">0</div>
          <div className="stat-foot">Target for every draft</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Lead fit distribution</h3>
              <p>Current workspace cohort</p>
            </div>
          </div>
          <div className="panel-body">
            <div className="chart">
              <div className="bar-wrap">
                <div className="bar hot" style={{ height: '86%' }}></div>
                <span className="bar-label">High (80+)</span>
              </div>
              <div className="bar-wrap">
                <div className="bar" style={{ height: '56%' }}></div>
                <span className="bar-label">Medium (60–79)</span>
              </div>
              <div className="bar-wrap">
                <div className="bar" style={{ height: '22%' }}></div>
                <span className="bar-label">Low (&lt;60)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>What to measure next</h3>
              <p>Recommended evaluation criteria</p>
            </div>
          </div>
          <div className="panel-body activity">
            <div className="activity-row">
              <div className="activity-icon">✓</div>
              <div>
                <b>Signal precision</b>
                <small>
                  Manually verify whether each detected event is real and relevant.
                </small>
              </div>
            </div>
            <div className="activity-row">
              <div className="activity-icon">◎</div>
              <div>
                <b>Score calibration</b>
                <small>
                  Compare model scores with human qualification decisions.
                </small>
              </div>
            </div>
            <div className="activity-row">
              <div className="activity-icon">✉</div>
              <div>
                <b>Draft factuality</b>
                <small>Audit each personalized claim against its source.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
