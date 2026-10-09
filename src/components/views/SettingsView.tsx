import React, { useState } from 'react';

interface SettingsViewProps {
  onToast: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onToast }) => {
  const [workspaceName, setWorkspaceName] = useState('Growth workspace');
  const [defaultIcp, setDefaultIcp] = useState(
    'Mid-market B2B SaaS companies growing sales teams and investing in revenue operations.'
  );
  const [evidenceReq, setEvidenceReq] = useState('require_source');
  const [approvalReq, setApprovalReq] = useState('human_approval');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onToast('Workspace preferences saved successfully.');
  };

  return (
    <section className="page active" id="page-settings">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your ideal customer profile and research preferences.</p>
        </div>
      </div>

      <div className="panel form-panel" style={{ maxWidth: '700px' }}>
        <h3>Workspace preferences</h3>
        <p>Configured for evidence-led outbound safety and quality.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="wsName">Workspace name</label>
            <input
              id="wsName"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="defIcp">Default ideal customer profile</label>
            <textarea
              id="defIcp"
              value={defaultIcp}
              onChange={(e) => setDefaultIcp(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="evReq">Evidence requirement</label>
            <select
              id="evReq"
              value={evidenceReq}
              onChange={(e) => setEvidenceReq(e.target.value)}
            >
              <option value="require_source">
                Require source links for every buying signal
              </option>
              <option value="allow_unverified">
                Allow unverified signals with explicit warnings
              </option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="appReq">External actions policy</label>
            <select
              id="appReq"
              value={approvalReq}
              onChange={(e) => setApprovalReq(e.target.value)}
            >
              <option value="human_approval">
                Human approval required before any draft can be sent
              </option>
              <option value="disabled" disabled>
                Automatic dispatch (disabled by policy)
              </option>
            </select>
          </div>

          <button className="btn btn-dark" type="submit">
            Save preferences
          </button>
        </form>
      </div>
    </section>
  );
};
