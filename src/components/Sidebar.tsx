import React from 'react';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen
}) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="workspace-label">Workspace</div>

      <button
        className={`side-link ${currentPage === 'home' ? 'active' : ''}`}
        onClick={() => onSelectPage('home')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v12h14V9M9 21v-7h6v7" />
          </svg>
        </span>
        Overview
      </button>

      <button
        className={`side-link ${currentPage === 'discover' ? 'active' : ''}`}
        onClick={() => onSelectPage('discover')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
        </span>
        Discover
      </button>

      <button
        className={`side-link ${currentPage === 'global_search' ? 'active' : ''}`}
        onClick={() => onSelectPage('global_search')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        Global Search
      </button>

      <button
        className={`side-link ${currentPage === 'leads' ? 'active' : ''}`}
        onClick={() => onSelectPage('leads')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 8 9-8 9-8-9 8-9Z" />
            <path d="m12 8 4 4-4 4-4-4 4-4Z" />
          </svg>
        </span>
        Leads
      </button>

      <button
        className={`side-link ${currentPage === 'evaluation' ? 'active' : ''}`}
        onClick={() => onSelectPage('evaluation')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </span>
        Evaluation Lab
      </button>

      <button
        className={`side-link ${currentPage === 'campaigns' ? 'active' : ''}`}
        onClick={() => onSelectPage('campaigns')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        Campaigns
      </button>

      <button
        className={`side-link ${currentPage === 'inbox' ? 'active' : ''}`}
        onClick={() => onSelectPage('inbox')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        </span>
        Inbox
      </button>

      <button
        className={`side-link ${currentPage === 'analytics' ? 'active' : ''}`}
        onClick={() => onSelectPage('analytics')}
      >
        <span>
          <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        Analytics
      </button>

      <div className="sidebar-bottom">
        <div className="workspace-label">Workspace settings</div>
        <button
          className={`side-link ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectPage('settings')}
        >
          <span>
            <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="m19.4 15 .1.1 1.1 1.8-1.8 3.1-2.1-.5a8 8 0 0 1-1.7 1l-.4 2.1h-3.6l-.4-2.1a8 8 0 0 1-1.7-1l-2.1.5L5 16.9l1.1-1.8A8 8 0 0 1 6 13.2l-2-1.2 1-3.4 2.2.1a8 8 0 0 1 1.4-1.4L8.5 5l3.5-1 1.2 2a8 8 0 0 1 1.9.2l1.6-1.5 2.9 2-.7 2a8 8 0 0 1 .6 1.8l1.8 1v3.5l-2 .5a8 8 0 0 1-.9 1.5Z" />
            </svg>
          </span>
          Settings
        </button>
        <div className="profile">
          <div className="profile-avatar">AS</div>
          <div>
            <b>Alex Smith</b>
            <small>Growth workspace</small>
          </div>
        </div>
      </div>
    </aside>
  );
};
