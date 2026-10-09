import React, { useEffect, useState } from 'react';

interface NavbarProps {
  onOpenApp: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApp }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setScrolled(scrollY > 20);

      const sections = ['top', 'platform', 'workflow', 'features'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <a className="brand" href="#top">
          <span className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 17 11 5l3.5 7H19"
                stroke="#243c22"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="18.5" cy="17" r="2.5" fill="#243c22" />
            </svg>
          </span>
          dealsignal<span style={{ fontWeight: 500, color: '#819080' }}>.ai</span>
        </a>

        <div className="navlinks">
          <a
            href="#platform"
            className={activeSection === 'platform' ? 'active' : ''}
          >
            Platform
          </a>
          <a
            href="#workflow"
            className={activeSection === 'workflow' ? 'active' : ''}
          >
            How it works
          </a>
          <a
            href="#features"
            className={activeSection === 'features' ? 'active' : ''}
          >
            Capabilities
          </a>
        </div>

        <div className="nav-actions">
          <button className="btn" onClick={() => onOpenApp('home')}>
            Sign in
          </button>
          <button className="btn btn-dark" onClick={() => onOpenApp('discover')}>
            Launch workspace <span>↗</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
