"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function IdentityAdmin() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    logoText: 'VELOS',
    bagLabel: 'BAG',
    menuLabel: 'MENU',
    menuVideo: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadIdentity = async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('content')
        .eq('section_name', 'identity')
        .single();

      if (data && !error) {
        setFormData(data.content);
      }
    };
    loadIdentity();
  }, [supabase]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("UPLOADING_MOTION_ASSET...");

    const fileExt = file.name.split('.').pop();
    const fileName = `identity-menu-${Math.random()}.${fileExt}`;
    const filePath = `identity/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vault')
        .getPublicUrl(filePath);

      setFormData({ ...formData, menuVideo: publicUrl });
      setStatus("ASSET_UPLOAD_COMPLETE");
    } catch (err) {
      console.error(err);
      setStatus("UPLOAD_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus("SYNCHRONIZING_IDENTITY...");
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({ 
          section_name: 'identity', 
          content: formData 
        }, { onConflict: 'section_name' });

      if (error) throw error;
      
      setStatus("IDENTITY_COMMITTED_SUCCESSFULLY");
      router.refresh();
      setTimeout(() => setStatus(""), 4000);
    } catch (error) {
      console.error("Save failed");
      setStatus("SYNCHRONIZATION_FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-container">
      <header className="luxury-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span className="serial-number">VLS-001</span>
          <span className="category-label">BRAND ARCHITECTURE</span>
        </div>
        <h1 className="luxury-title">
          IDENTITY <span className="serif-italic">& Studio</span>
        </h1>
      </header>

      <div className="luxury-grid">
        <section className="luxury-card">
          <h3 className="card-subtitle">NAVIGATION SYSTEM</h3>
          <div className="input-group">
            <label>LOGO IDENTIFIER</label>
            <input 
              type="text" 
              className="luxury-input" 
              value={formData.logoText} 
              onChange={(e) => setFormData({...formData, logoText: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>COLLECTION LABEL</label>
            <input 
              type="text" 
              className="luxury-input" 
              value={formData.bagLabel} 
              onChange={(e) => setFormData({...formData, bagLabel: e.target.value})} 
            />
          </div>
        </section>

        <section className="luxury-card">
          <h3 className="card-subtitle">CINEMATIC OVERLAY</h3>
          <div className="input-group">
            <label>MENU TRIGGER</label>
            <input 
              type="text" 
              className="luxury-input" 
              value={formData.menuLabel} 
              onChange={(e) => setFormData({...formData, menuLabel: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>MOTION ASSET (MP4)</label>
            <div className="upload-wrapper">
              <input 
                type="text" 
                className="luxury-input flex-1" 
                value={formData.menuVideo} 
                onChange={(e) => setFormData({...formData, menuVideo: e.target.value})} 
              />
              <button className="luxury-upload-btn" onClick={() => fileInputRef.current?.click()}>
                {loading ? 'BUSY' : 'SELECT'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleVideoUpload} accept="video/*" hidden />
            </div>
          </div>
        </section>
      </div>

      <footer className="luxury-footer">
        <div className="footer-content">
          <button className="luxury-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}
          </button>
          {status && (
            <p className="status-msg">
              {status}
            </p>
          )}
        </div>
      </footer>

      <style jsx>{`
        .luxury-container { 
          padding: 40px 20px; 
          max-width: 1200px; 
          margin: 0 auto;
          animation: fadeInUp 1s ease-out; 
        }
        
        .luxury-header { margin-bottom: 60px; }
        .accent-line { width: 60px; height: 1px; background: #d4af37; margin-bottom: 20px; }
        
        .header-meta { 
          display: flex; 
          justify-content: space-between; 
          font-size: 10px; 
          letter-spacing: 4px; 
          color: #666; 
          margin-bottom: 15px; 
        }

        .luxury-title { 
          font-size: clamp(2.5rem, 8vw, 7rem); 
          font-weight: 200; 
          letter-spacing: -3px; 
          line-height: 0.9; 
          text-transform: uppercase; 
          word-break: break-word;
        }

        .serif-italic { font-family: 'Playfair Display', serif; font-style: italic; text-transform: lowercase; }

        .luxury-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 2px; 
          background: #111; 
          border: 1px solid #111; 
        }

        .luxury-card { background: #000; padding: 60px; }
        .card-subtitle { font-size: 11px; letter-spacing: 5px; color: #d4af37; margin-bottom: 40px; text-transform: uppercase; }
        
        .input-group { margin-bottom: 35px; }
        .input-group label { display: block; font-size: 9px; letter-spacing: 2px; color: #444; margin-bottom: 12px; font-weight: 700; }
        
        .luxury-input { 
          background: transparent; 
          border: none; 
          border-bottom: 1px solid #222; 
          color: #fff; 
          width: 100%; 
          padding: 10px 0; 
          font-size: 18px; 
          transition: border-color 0.4s; 
          border-radius: 0;
        }

        .luxury-input:focus { outline: none; border-color: #d4af37; }
        .upload-wrapper { display: flex; gap: 20px; align-items: flex-end; }
        
        .luxury-upload-btn { 
          background: transparent; 
          border: 1px solid #333; 
          color: #888; 
          padding: 10px 20px; 
          font-size: 9px; 
          letter-spacing: 2px; 
          cursor: pointer; 
          white-space: nowrap;
          transition: 0.3s;
        }
        .luxury-upload-btn:hover { border-color: #d4af37; color: #fff; }

        .luxury-footer { margin-top: 80px; display: flex; justify-content: center; padding-bottom: 60px; }
        .footer-content { width: 100%; text-align: center; }

        .luxury-save-btn { 
          background: #fff; 
          color: #000; 
          border: none; 
          padding: 25px 80px; 
          font-size: 11px; 
          font-weight: 900; 
          letter-spacing: 5px; 
          cursor: pointer; 
          transition: 0.3s; 
          width: auto;
          text-transform: uppercase;
        }

        .luxury-save-btn:hover { background: #d4af37; transform: translateY(-2px); }
        .luxury-save-btn:disabled { background: #222; color: #444; cursor: not-allowed; }

        .status-msg { color: #d4af37; font-size: 10px; marginTop: 20px; letterSpacing: 2px; text-transform: uppercase; }

        /* --- Responsiveness Updates --- */
        
        @media (max-width: 1024px) {
          .luxury-grid { grid-template-columns: 1fr; }
          .luxury-card { padding: 40px; }
          .luxury-title { letter-spacing: -1px; }
        }

        @media (max-width: 640px) {
          .luxury-container { padding: 40px 15px; }
          .luxury-card { padding: 40px 20px; }
          .luxury-save-btn { width: 100%; padding: 20px; }
          .header-meta { flex-direction: column; gap: 10px; }
          .upload-wrapper { flex-direction: column; align-items: stretch; gap: 15px; }
          .luxury-input { font-size: 16px; }
        }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}