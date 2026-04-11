"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';

export default function MenuSettingsAdmin() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    menuLabel: '',
    menuVideo: '',
    project: '',
    instagram: '',
    twitter: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetching from your centralized site_config table
        const { data, error } = await supabase
          .from('site_config')
          .select('content')
          .eq('section_name', 'menu_assets')
          .single();

        if (data && !error) {
          setSettings(data.content);
        }
      } catch (err) {
        console.error("Vault Access Error:", err);
      }
    };

    fetchSettings();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('INITIATING SYNC...');

    let updatedVideoUrl = settings.menuVideo;

    try {
      // 1. Handle Video Upload if a new file is selected
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `menu-bg-${Math.random()}.${fileExt}`;
        const filePath = `assets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vault')
          .upload(filePath, videoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('vault')
          .getPublicUrl(filePath);
        
        updatedVideoUrl = publicUrl;
      }

      // 2. Sync all settings to site_config table
      const updatedSettings = { ...settings, menuVideo: updatedVideoUrl };
      
      const { error: upsertError } = await supabase
        .from('site_config')
        .upsert({ 
          section_name: 'menu_assets', 
          content: updatedSettings 
        }, { onConflict: 'section_name' });

      if (upsertError) throw upsertError;

      setSettings(updatedSettings);
      setVideoFile(null);
      setMessage('SYSTEM SYNCED');
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error(error);
      setMessage('UPDATE DENIED');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="luxury-settings animate-in fade-in duration-1000">
      <header className="settings-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span className="serial-number">ATELIER-MNU-09</span>
          <span className="category-label">CORE INTERFACE</span>
        </div>
        <h1 className="luxury-title">
          MENU <span className="serif-italic">& Assets</span>
        </h1>
      </header>

      <section className="settings-form-container">
        <form onSubmit={handleSubmit}>
          <div className="settings-grid">
            
            <div className="input-group">
              <label>MENU LABEL</label>
              <input 
                className="luxury-input"
                value={settings.menuLabel || ''}
                onChange={e => handleInputChange('menuLabel', e.target.value)}
                placeholder="e.g. NAVIGATION"
              />
            </div>

            <div className="input-group">
              <label>CINEMATIC ASSET (VIDEO)</label>
              <div className="video-upload-wrapper">
                <input 
                  type="text"
                  className="luxury-input opacity-40 text-xs"
                  value={videoFile ? videoFile.name : settings.menuVideo || 'NO ASSET SELECTED'}
                  readOnly
                />
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="asset-action-btn"
                >
                  {videoFile ? 'REPLACE ASSET' : 'SELECT FROM DISK'}
                </button>
              </div>
            </div>

            <div className="input-group md:col-span-2">
              <label>PROJECT IDENTIFIER</label>
              <input 
                className="luxury-input"
                value={settings.project || ''}
                onChange={e => handleInputChange('project', e.target.value)}
                placeholder="e.g. ARCHIVE / 2026"
              />
            </div>

            <div className="input-group">
              <label>INSTAGRAM</label>
              <input 
                className="luxury-input serif-italic"
                value={settings.instagram || ''}
                onChange={e => handleInputChange('instagram', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>TWITTER / X</label>
              <input 
                className="luxury-input serif-italic"
                value={settings.twitter || ''}
                onChange={e => handleInputChange('twitter', e.target.value)}
              />
            </div>
          </div>

          <div className="form-footer">
            <button 
              type="submit" 
              disabled={loading}
              className="luxury-submit-btn"
            >
              {loading ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}
            </button>
            {message && <p className="sync-status">{message}</p>}
          </div>
        </form>
      </section>

      <style jsx>{`
        .luxury-settings { padding: 40px; max-width: 1200px; margin: 0 auto; color: #fff; background: #000; min-height: 100vh; }
        .settings-header { margin-bottom: 80px; }
        .accent-line { width: 60px; height: 1px; background: #d4af37; margin-bottom: 30px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 9px; letter-spacing: 5px; color: #555; margin-bottom: 15px; font-weight: bold; }
        .luxury-title { font-size: clamp(3rem, 10vw, 7rem); font-weight: 200; letter-spacing: -5px; line-height: 0.85; text-transform: uppercase; margin: 0; }
        .serif-italic { font-family: serif; font-style: italic; color: #666; }
        .settings-form-container { background: #A39F9F; border: 1px solid #111; padding: 60px; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .input-group label { display: block; font-size: 9px; color: #444; font-weight: bold; letter-spacing: 3px; margin-bottom: 20px; text-transform: uppercase; }
        .luxury-input { background: transparent; border: none; border-bottom: 1px solid #222; color: #fff; width: 100%; padding: 15px 0; font-size: 18px; outline: none; transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); border-radius: 0; }
        .luxury-input:focus { border-color: #d4af37; }
        .video-upload-wrapper { display: flex; flex-direction: column; gap: 10px; }
        .asset-action-btn { background: transparent; border: 1px solid #222; color: #666; font-size: 8px; letter-spacing: 2px; padding: 10px; cursor: pointer; transition: all 0.3s; }
        .asset-action-btn:hover { border-color: #d4af37; color: #d4af37; }
        .form-footer { margin-top: 80px; position: relative; }
        .luxury-submit-btn { background-color: #d4af37; color: black; border: none; padding: 25px 40px; font-size: 11px; font-weight: bold; letter-spacing: 4px; cursor: pointer; transition: all 0.4s; width: 100%; text-transform: uppercase; }
        .luxury-submit-btn:hover:not(:disabled) { background-color: #fff; transform: translateY(-2px); }
        .luxury-submit-btn:disabled { background-color: #111; color: #333; cursor: not-allowed; }
        .sync-status { position: absolute; width: 100%; text-align: center; bottom: -40px; font-size: 10px; letter-spacing: 3px; color: #d4af37; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; gap: 40px; } .luxury-settings { padding: 20px; } .settings-form-container { padding: 30px; } }
      `}</style>
    </div>
  );
}