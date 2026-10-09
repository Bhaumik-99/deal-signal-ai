import React from 'react';

export const PlatformSection: React.FC = () => {
  return (
    <section className="section" id="platform" style={{ background: '#fff' }}>
      <div className="wrap">
        <div className="section-head reveal is-visible">
          <div className="eyebrow">One focused workflow</div>
          <h2>
            Less guessing.
            <br />
            More meaningful conversations.
          </h2>
          <p>
            Move from a vague target market to a well-researched, prioritized list of
            prospects—without stitching together a dozen tabs.
          </p>
        </div>
        <div className="features reveal-stagger is-visible" id="features">
          <article className="feature">
            <div className="feature-icon">
              <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 5 5" />
              </svg>
            </div>
            <h3>Discover the why-now</h3>
            <p>
              Surface relevant company events from public sources and explain why each
              one may create an opportunity.
            </p>
          </article>
          <article className="feature">
            <div className="feature-icon">
              <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <h3>Qualify with evidence</h3>
            <p>
              Rank prospects against your ideal customer profile, with transparent
              criteria and clear uncertainty.
            </p>
          </article>
          <article className="feature">
            <div className="feature-icon">
              <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>
            <h3>Personalize with context</h3>
            <p>
              Draft outreach tied to a verified signal—not generic flattery or invented
              personalization.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};
