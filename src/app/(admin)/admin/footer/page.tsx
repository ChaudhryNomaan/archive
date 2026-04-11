"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'; // Import your Supabase client

export default function FooterSettings() {
  const router = useRouter();
  const supabase = createClient(); // Initialize Supabase
  
  const [formData, setFormData] = useState({
    location: '',
    project: '',
    instagram: '',
    twitter: ''
  });
  const [loading, setLoading] = useState(false);

  // 1. Fetch existing settings from Supabase on load
  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('content')
        .eq('section_name', 'footer')
        .single();

      if (data && !error) {
        setFormData(data.content);
      }
    };
    loadSettings();
  }, []);

  // 2. Updated Save Function to use Supabase Upsert
  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert({ 
          section_name: 'footer', 
          content: formData 
        }, { onConflict: 'section_name' });

      if (!error) {
        alert("SUCCESS: OSNOVA ARCHIVE UPDATED.");
        router.refresh(); 
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("ERROR: DATABASE SYNCHRONIZATION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-settings animate-in fade-in duration-700">
      <header className="settings-header">
        <div className="accent-line"></div>
        <div className="header-meta">
          <span className="serial-number">SYS-CONFIG-F01</span>
          <span className="category-label">FOOTER CONTROL</span>
        </div>
        <h1 className="luxury-title">
          LINKS <span className="serif-italic">& Info</span>
        </h1>
      </header>

      <section className="settings-form-container">
        <div className="settings-grid">
          <div className="input-group">
            <label>LOCATION DISPLAY</label>
            <input 
              type="text" 
              className="luxury-input" 
              placeholder="e.g. TOKYO, JAPAN"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>PROJECT / COPYRIGHT</label>
            <input 
              type="text" 
              className="luxury-input" 
              placeholder="e.g. © 2026 ARCHIVE"
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>INSTAGRAM URL</label>
            <input 
              type="text" 
              className="luxury-input serif-italic" 
              placeholder="instagram.com/archive"
              value={formData.instagram}
              onChange={(e) => setFormData({...formData, instagram: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>TWITTER URL</label>
            <input 
              type="text" 
              className="luxury-input serif-italic" 
              placeholder="x.com/archive"
              value={formData.twitter}
              onChange={(e) => setFormData({...formData, twitter: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="luxury-submit-btn"
        >
          {loading ? 'SYNCHRONIZING...' : 'SAVE FOOTER CHANGES'}
        </button>
      </section>

      <style jsx>{`
        /* Your existing styles remain exactly the same */
        .luxury-settings { padding: 20px; max-width: 1200px; color: #fff; }
        .settings-header { margin-bottom: 60px; }
        .accent-line { width: 40px; height: 1px; background: #d4af37; margin-bottom: 20px; }
        .header-meta { display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 4px; color: #666; margin-bottom: 10px; font-weight: bold; }
        .luxury-title { font-size: clamp(2.5rem, 8vw, 6rem); font-weight: 200; letter-spacing: -4px; line-height: 0.9; text-transform: uppercase; margin: 0; }
        .serif-italic { font-family: serif; font-style: italic; color: #444; }
        .settings-form-container { margin-top: 40px; background: #A39F9F; border: 1px solid #111; padding: 40px; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .input-group label { display: block; font-size: 9px; color: #555; font-weight: bold; letter-spacing: 2px; margin-bottom: 15px; text-transform: uppercase; }
        .luxury-input { background: transparent; border: none; border-bottom: 1px solid #222; color: #fff; width: 100%; padding: 12px 0; font-size: 16px; outline: none; transition: border-color 0.4s; border-radius: 0; }
        .luxury-input:focus { border-color: #d4af37; }
        .luxury-submit-btn { margin-top: 60px; background-color: #d4af37; color: black; border: none; padding: 20px 40px; font-size: 10px; font-weight: bold; letter-spacing: 3px; cursor: pointer; transition: all 0.3s; width: 100%; text-transform: uppercase; }
        .luxury-submit-btn:hover:not(:disabled) { background-color: #fff; }
        .luxury-submit-btn:disabled { background-color: #222; color: #444; cursor: not-allowed; }
        @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .luxury-title { font-size: 3.5rem; } }
      `}</style>
    </div>
  );
}