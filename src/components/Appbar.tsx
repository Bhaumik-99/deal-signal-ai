import React from 'react';
import { HealthResponse } from '../types';

interface AppbarProps {
  currentPage: string;
  onBackLanding: () => void;
  onToggleSidebar: () => void;
  health: HealthResponse | null;
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Overview',
  discover: 'Discover',
  global_search: 'Global Search',
  leads: 'Leads',
  evaluation: 'Evaluation Lab',
  campaigns: 'Campaigns',
  inbox: 'Inbox',
  analytics: 'Analytics',
  settings: 'Settings'
};

export const Appbar: React.FC<AppbarProps> = ({
  currentPage,
  onBackLanding,
  onToggleSidebar,
  health
}) => {
  return (
    <header className="appbar">
      <div className="appbar-left">
        <button
          className="btn btn-small mobile-menu"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBackLanding();
          }}
        >
          <span className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 17 11 5l3.5 7H19"
                stroke="#243c22"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="18.5" cy="17" r="2.5" fill="#243c22" />
            </svg>
          </span>
          dealsignal<span style={{ fontWeight: 500, color: '#819080' }}>.ai</span>
        </a>
        <span className="crumb">
          / <b>{PAGE_LABELS[currentPage] || 'Overview'}</b>
        </span>
      </div>

      <div className="appbar-right">
        {health?.test_mode ? (
          <span className="status status-test" title="Deterministic test mode active">
            Test mode active
          </span>
        ) : (
          <span className="status" title="Connected to FastAPI backend">
            Agent ready
          </span>
        )}
        <button className="btn btn-small" onClick={onBackLanding}>
          ← Landing page
        </button>
      </div>
    </header>
  );
};
