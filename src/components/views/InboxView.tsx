import React, { useState } from 'react';

const SAMPLE_INBOX = [
  {
    company: 'Northstar Health',
    logo: 'N',
    status: 'Interested',
    statusClass: 'pill-high',
    message:
      "Thanks for reaching out. We're currently reviewing our sales operations stack. Could you share a little more about how this works?",
    time: 'Sample reply · 2 hours ago'
  },
  {
    company: 'Vertex Labs',
    logo: 'V',
    status: 'Follow-up',
    statusClass: 'pill-medium',
    message:
      'We may revisit this next quarter. Please send over a short overview we can keep on file.',
    time: 'Sample reply · Yesterday'
  },
  {
    company: 'Fieldnote',
    logo: 'F',
    status: 'No response yet',
    statusClass: 'pill-muted',
    message:
      'Outreach draft is awaiting approval. No email has been sent.',
    time: 'Draft · Yesterday'
  }
];

export const InboxView: React.FC = () => {
  const [filter, setFilter] = useState('');

  const filtered = SAMPLE_INBOX.filter((item) =>
    (item.company + ' ' + item.message).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section className="page active" id="page-inbox">
      <div className="page-header">
        <div>
          <h1>Inbox</h1>
          <p>Keep replies and next steps in one place.</p>
        </div>
        <span className="pill pill-muted">Sample conversations</span>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent conversations</h3>
            <p>Illustrative messages for the product demo</p>
          </div>
          <input
            className="search"
            placeholder="Search conversations…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="panel-body" id="inboxList">
          {filtered.map((item, idx) => (
            <div className="inbox-item" key={idx}>
              <div className="company-logo">{item.logo}</div>
              <div>
                <h4>
                  {item.company}{' '}
                  <span className={`pill ${item.statusClass}`}>{item.status}</span>
                </h4>
                <p>{item.message}</p>
                <small style={{ fontSize: '9px', color: '#9aa39c' }}>
                  {item.time}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
