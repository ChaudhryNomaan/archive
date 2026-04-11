"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminSettings() {
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  // Updated state to match the redirect requirements
  const [settings, setSettings] = useState({
    active_method: 'whatsapp',
    recipient_id: ''
  });

  useEffect(() => {
    const fetchProtocolData = async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setSettings({
          active_method: data.active_notification_method || 'whatsapp',
          recipient_id: data.notification_recipient || ''
        });
      }
    };
    fetchProtocolData();
  }, [supabase]);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('INITIATING_ENCRYPTION...');
    
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          id: 1,
          active_notification_method: settings.active_method, 
          notification_recipient: settings.recipient_id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

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
          <span className="serial-number">SYS-REDIRECT-PROTOCOL / 2026</span>
          <span className="category-label">PURCHASE GATEWAY & REDIRECT CONFIG</span>
        </div>
        <h1 className="luxury-title">
          GATEWAY <span className="serif-italic">& Protocol</span>
        </h1>
      </header>

      <section className="settings-form-container">
        <div className="settings-grid">
          
          <div className="input-group full-width">
            <div className="label-wrapper">
              <label>ACTIVE REDIRECT PLATFORM</label>
              <span className="label-detail">WHATSAPP / TELEGRAM / VK</span>
            </div>
            <select 
              className="luxury-input"
              value={settings.active_method}
              onChange={(e) => handleInputChange('active_method', e.target.value)}
              style={{ appearance: 'none', background: 'transparent' }}
            >
              <option value="whatsapp" style={{background: '#000'}}>WHATSAPP</option>
              <option value="telegram" style={{background: '#000'}}>TELEGRAM</option>
              <option value="vk" style={{background: '#000'}}>VKONTAKTE</option>
            </select>
          </div>

          <div className="protocol-divider full-width">
            <div className="divider-line"></div>
            <span className="divider-text">CONNECTION IDENTITY</span>
          </div>

          <div className="input-group full-width">
            <label>RECIPIENT IDENTIFIER</label>
            <input 
              type="text" 
              className="luxury-input monospace tracking-widest" 
              placeholder={settings.active_method === 'whatsapp' ? "79000000000" : "username_handle"}
              value={settings.recipient_id || ''}
              onChange={(e) => handleInputChange('recipient_id', e.target.value)}
            />
            <div style={{marginTop: '20px'}}>
               <span className="label-detail" style={{opacity: 0.5}}>
                 {settings.active_method === 'whatsapp' && "NUMERIC ONLY // NO '+' SYMBOL"}
                 {settings.active_method === 'telegram' && "HANDLE ONLY // NO '@' SYMBOL"}
                 {settings.active_method === 'vk' && "USER ID OR SHORTNAME"}
               </span>
            </div>
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
        /* EXACT ORIGINAL STYLES PRESERVED */
        .luxury-settings { padding: 80px 40px; max-width: 1300px; margin: 0 auto; color: #fff; background: #000; min-height: 100vh; }
        .settings-header { margin-bottom: 100px; }
        .accent-line { width: 80px; height: 1px; background: #d4af37; margin-bottom: 40px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 10px; letter-spacing: 6px; color: #444; margin-bottom: 20px; font-weight: bold; }
        .luxury-title { font-size: clamp(3.5rem, 12vw, 8.5rem); font-weight: 200; letter-spacing: -6px; line-height: 0.8; text-transform: uppercase; margin: 0; }
        .serif-italic { font-family: serif; font-style: italic; color: #777; }
        .settings-form-container { background: #A39F9F; border: 1px solid #2D2B2B; padding: 80px; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5); }
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