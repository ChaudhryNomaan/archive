"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminSettings() {
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  const [settings, setSettings] = useState({
    email: 'admin@velos-archive.com',
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    instagram: 'velos_archive' // Added for redirection logic
  });

  useEffect(() => {
    const fetchVaultData = async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('content')
        .eq('section_name', 'vault_config')
        .single();

      if (data && !error) {
        setSettings(data.content);
      }
    };
    fetchVaultData();
  }, [supabase]);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('INITIATING_ENCRYPTION...');
    
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({ 
          section_name: 'vault_config', 
          content: settings 
        }, { onConflict: 'section_name' });

      if (error) throw error;

      setStatus('CORE VAULT SYNCHRONIZED');
    } catch (err) {
      console.error(err);
      setStatus('SYNCHRONIZATION_FAILED');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(''), 4000);
    }
  };

  return (
    <div className="luxury-settings animate-in fade-in duration-1000">
      <header className="settings-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span className="serial-number">SYS-VAULT-PROTOCOL / 2026</span>
          <span className="category-label">FINANCIAL GATEWAY & CORE CONFIG</span>
        </div>
        <h1 className="luxury-title">
          VAULT <span className="serif-italic">& Config</span>
        </h1>
      </header>

      <section className="settings-form-container">
        <div className="settings-grid">
          
          <div className="input-group full-width">
            <div className="label-wrapper">
              <label>SYSTEM NOTIFICATION GATEWAY</label>
              <span className="label-detail">ENCRYPTED ENDPOINT</span>
            </div>
            <input 
              type="email" 
              className="luxury-input" 
              placeholder="admin@velos-archive.com"
              value={settings.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="protocol-divider full-width">
            <div className="divider-line"></div>
            <span className="divider-text">BANKING PROTOCOLS</span>
          </div>

          <div className="input-group">
            <label>INSTITUTION NAME</label>
            <input 
              type="text" 
              className="luxury-input" 
              placeholder="CENTRAL RESERVE"
              value={settings.bankName || ''}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>BENEFICIARY ACCOUNT</label>
            <input 
              type="text" 
              className="luxury-input serif-italic" 
              placeholder="VELOS ARCHIVE HOLDINGS"
              value={settings.accountName || ''}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>IBAN / ACCOUNT NUMBER</label>
            <input 
              type="text" 
              className="luxury-input monospace tracking-widest" 
              placeholder="GB00 0000 0000..."
              value={settings.iban || ''}
              onChange={(e) => handleInputChange('iban', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>SWIFT / BIC IDENTIFIER</label>
            <input 
              type="text" 
              className="luxury-input monospace" 
              placeholder="SWIFT CODE"
              value={settings.swift || ''}
              onChange={(e) => handleInputChange('swift', e.target.value)}
            />
          </div>

          <div className="protocol-divider full-width">
            <div className="divider-line"></div>
            <span className="divider-text">SOCIAL ARCHIVE REDIRECT</span>
          </div>

          <div className="input-group full-width">
            <div className="label-wrapper">
              <label>INSTAGRAM CONCIERGE HANDLE</label>
              <span className="label-detail">DM GATEWAY</span>
            </div>
            <input 
              type="text" 
              className="luxury-input" 
              placeholder="velos_archive"
              value={settings.instagram || ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
            />
          </div>
        </div>

        <div className="footer-action-row">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="luxury-submit-btn"
          >
            <span className="btn-content">
              {isSaving ? 'ENCRYPTING & SAVING...' : 'COMMIT CORE CHANGES'}
            </span>
            <div className="btn-shimmer"></div>
          </button>
          
          {status && (
            <div className="status-wrapper animate-in slide-in-from-left duration-500">
              <div className="status-dot"></div>
              <span className="status-indicator">{status}</span>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .luxury-settings { padding: 80px 40px; max-width: 1300px; margin: 0 auto; color: #fff; background: #000; min-height: 100vh; }
        .settings-header { margin-bottom: 100px; }
        .accent-line { width: 80px; height: 1px; background: #d4af37; margin-bottom: 40px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 10px; letter-spacing: 6px; color: #444; margin-bottom: 20px; font-weight: bold; }
        .luxury-title { font-size: clamp(3.5rem, 12vw, 8.5rem); font-weight: 200; letter-spacing: -6px; line-height: 0.8; text-transform: uppercase; margin: 0; }
        .serif-italic { font-family: serif; font-style: italic; color: #777; }
        .settings-form-container { background: #030303; border: 1px solid #0a0a0a; padding: 80px; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
        .full-width { grid-column: span 2; }
        .protocol-divider { display: flex; align-items: center; gap: 30px; margin: 20px 0; }
        .divider-line { flex-grow: 1; height: 1px; background: linear-gradient(90deg, #111, transparent); }
        .divider-text { font-size: 10px; letter-spacing: 5px; color: #222; font-weight: 900; }
        .label-wrapper { display: flex; justify-content: space-between; align-items: baseline; }
        .label-detail { font-size: 8px; color: #222; letter-spacing: 2px; }
        .input-group label { display: block; font-size: 9px; color: #555; font-weight: bold; letter-spacing: 3px; margin-bottom: 25px; text-transform: uppercase; }
        .luxury-input { background: transparent; border: none; border-bottom: 1px solid #1a1a1a; color: #fff; width: 100%; padding: 20px 0; font-size: 20px; outline: none; transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); border-radius: 0; }
        .luxury-input:focus { border-color: #d4af37; padding-left: 10px; }
        .luxury-input::placeholder { color: #1a1a1a; }
        .monospace { font-family: "SF Mono", "Fira Code", monospace; font-size: 16px; }
        .footer-action-row { display: flex; align-items: center; gap: 50px; margin-top: 100px; }
        .luxury-submit-btn { position: relative; overflow: hidden; background-color: #d4af37; color: black; border: none; padding: 30px 80px; font-size: 12px; font-weight: bold; letter-spacing: 5px; cursor: pointer; transition: all 0.5s; text-transform: uppercase; }
        .luxury-submit-btn:hover:not(:disabled) { background-color: #fff; transform: scale(1.02); }
        .luxury-submit-btn:disabled { background-color: #0a0a0a; color: #222; cursor: not-allowed; }
        .btn-shimmer { position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: 0.5s; }
        .luxury-submit-btn:hover .btn-shimmer { left: 150%; transition: 0.8s; }
        .status-wrapper { display: flex; align-items: center; gap: 15px; border-left: 1px solid #d4af37; padding-left: 30px; }
        .status-dot { width: 6px; height: 6px; background: #d4af37; border-radius: 50%; }
        .status-indicator { font-size: 11px; letter-spacing: 4px; color: #d4af37; text-transform: uppercase; }
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; gap: 50px; } .full-width { grid-column: span 1; } .luxury-settings { padding: 40px 20px; } .settings-form-container { padding: 40px 20px; } .footer-action-row { flex-direction: column; align-items: stretch; gap: 30px; } .status-wrapper { border-left: none; border-top: 1px solid #111; padding: 20px 0 0 0; } }
      `}</style>
    </div>
  );
}