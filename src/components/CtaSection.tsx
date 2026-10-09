import React from 'react';

interface CtaSectionProps {
  onOpenApp: (page: string) => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenApp }) => {
  return (
    <section className="cta">
      <div className="wrap">
        <div className="cta-inner reveal is-visible" data-reveal="scale">
          <div>
            <h2>
              Make every first touch
              <br />
              feel well-timed.
            </h2>
            <p>Start with one company. Leave with a reasoned recommendation.</p>
          </div>
          <button className="btn btn-lime" onClick={() => onOpenApp('discover')}>
            Launch DealSignal <span>↗</span>
          </button>
        </div>
      </div>
    </section>
  );
};
