import React, { useState, useEffect } from 'react';
import { EmailSettings, TestConnectionPayload } from '../types';
import { getEmailSettings, updateEmailSettings, testEmailConnection } from '../api';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onSettingsSaved?: () => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  onToast,
  onSettingsSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [testRecipient, setTestRecipient] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<EmailSettings>({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'DealSignal Outbound',
    use_tls: true,
    use_ssl: false,
    is_configured: false
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setTestResult(null);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getEmailSettings();
      setFormData(data);
      if (data.from_email && !testRecipient) {
        setTestRecipient(data.from_email);
      }
    } catch {
      onToast('Failed to load email settings.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: 'gmail' | 'outlook' | 'brevo' | 'custom') => {
    if (preset === 'gmail') {
      setFormData((prev) => ({
        ...prev,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        use_tls: true,
        use_ssl: false
      }));
    } else if (preset === 'outlook') {
      setFormData((prev) => ({
        ...prev,
        smtp_host: 'smtp.office365.com',
        smtp_port: 587,
        use_tls: true,
        use_ssl: false
      }));
    } else if (preset === 'brevo') {
      setFormData((prev) => ({
        ...prev,
        smtp_host: 'smtp-relay.brevo.com',
        smtp_port: 587,
        use_tls: true,
        use_ssl: false
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateEmailSettings(formData);
      onToast('Email delivery configuration saved.');
      if (onSettingsSaved) onSettingsSaved();
      onClose();
    } catch (err: any) {
      onToast(err.message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const payload: TestConnectionPayload = {
        test_recipient: testRecipient.trim() || undefined,
        smtp_host: formData.smtp_host,
        smtp_port: formData.smtp_port,
        smtp_user: formData.smtp_user,
        smtp_password: formData.smtp_password,
        from_email: formData.from_email,
        from_name: formData.from_name,
        use_tls: formData.use_tls,
        use_ssl: formData.use_ssl
      };
      const res = await testEmailConnection(payload);
      setTestResult({
        success: true,
        message: res.message || 'SMTP connection verified successfully.'
      });
      onToast('SMTP connection verified.');
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'SMTP connection failed.'
      });
      onToast('SMTP verification failed.');
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #dbe3dc',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #edf1ee', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#17221d', margin: 0 }}>
              Email Delivery & SMTP Settings
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
              Configure your real SMTP credentials to dispatch live B2B outreach emails
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
            Provider Presets:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => applyPreset('gmail')}
              className="btn btn-outline"
              style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '6px' }}
            >
              Gmail (App Password)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('outlook')}
              className="btn btn-outline"
              style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '6px' }}
            >
              Outlook / Office 365
            </button>
            <button
              type="button"
              onClick={() => applyPreset('brevo')}
              className="btn btn-outline"
              style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '6px' }}
            >
              Brevo / Sendinblue
            </button>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                Sender From Email *
              </label>
              <input
                type="email"
                required
                value={formData.from_email}
                onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                placeholder="you@yourcompany.com"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                Sender Display Name
              </label>
              <input
                type="text"
                value={formData.from_name}
                onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                placeholder="Alex Smith · DealSignal"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                SMTP Host *
              </label>
              <input
                type="text"
                required
                value={formData.smtp_host}
                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                SMTP Port *
              </label>
              <input
                type="number"
                required
                value={formData.smtp_port}
                onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) || 587 })}
                placeholder="587"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                SMTP Username *
              </label>
              <input
                type="text"
                required
                value={formData.smtp_user}
                onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                placeholder="you@gmail.com"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px'
                }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                  SMTP App Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', fontSize: '10px', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.smtp_password || ''}
                onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
                placeholder={formData.is_configured ? '••••••••' : '16-character App Password'}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="use_tls_checkbox"
              checked={formData.use_tls}
              onChange={(e) => setFormData({ ...formData, use_tls: e.target.checked })}
            />
            <label htmlFor="use_tls_checkbox" style={{ fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
              Use TLS / STARTTLS Encryption (Recommended on port 587)
            </label>
          </div>

          {/* Test connection section */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              marginBottom: '18px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Verify Connection & Test Delivery
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Optional test recipient (e.g. your email)"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  background: '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !formData.smtp_user || !formData.smtp_password}
                className="btn btn-outline"
                style={{ fontSize: '11px', padding: '6px 14px', whiteSpace: 'nowrap' }}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  background: testResult.success ? '#f0fdf4' : '#fff1f2',
                  border: testResult.success ? '1px solid #86efac' : '1px solid #fecdd3',
                  color: testResult.success ? '#166534' : '#be123c'
                }}
              >
                {testResult.success ? testResult.message : testResult.error}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark"
              style={{ fontSize: '12px', padding: '8px 20px', background: '#17221d', color: '#ffffff' }}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
