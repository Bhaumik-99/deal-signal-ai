import React from 'react';

interface WorkflowSectionProps {
  onOpenApp: (page: string) => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({ onOpenApp }) => {
  return (
    <section className="section" id="workflow">
      <div className="wrap">
        <div className="workflow reveal is-visible">
          <div>
            <div className="eyebrow">How the agent works</div>
            <h2>
              Research before
              <br />
              the first hello.
            </h2>
            <p>
              DealSignal uses a bounded agent workflow to gather context, check for
              gaps, qualify a lead, and prepare a message for review. It shows its work
              instead of hiding it behind a score.
            </p>
            <button className="btn btn-dark" onClick={() => onOpenApp('discover')}>
              Try the workflow ↗
            </button>
          </div>
          <div className="steps reveal-stagger is-visible">
            <div className="step">
              <span className="step-num">01</span>
              <div>
                <strong>Research the company</strong>
                <small>Collect public evidence and source links.</small>
              </div>
            </div>
            <div className="step">
              <span className="step-num">02</span>
              <div>
                <strong>Check the signal</strong>
                <small>Identify gaps and research again when needed.</small>
              </div>
            </div>
            <div className="step">
              <span className="step-num">03</span>
              <div>
                <strong>Score the fit</strong>
                <small>Explain the recommendation against your ICP.</small>
              </div>
            </div>
            <div className="step">
              <span className="step-num">04</span>
              <div>
                <strong>Prepare outreach for approval</strong>
                <small>Keep a human in control of external actions.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
