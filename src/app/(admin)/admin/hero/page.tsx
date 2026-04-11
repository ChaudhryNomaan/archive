"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase'; // Using your existing client

export default function HeroAdmin() {
  const supabase = createClient();
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load current Hero & Marquee settings from Supabase
    const loadConfig = async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('content')
        .eq('section_name', 'hero')
        .single();

      if (data && !error) {
        // Ensure structure exists to prevent input errors
        const content = data.content;
        if (!content.hero) content.hero = { videoSrc: "", subtitle: "", title: "" };
        if (!content.marquee) content.marquee = { text: "" };
        setConfig(content);
      } else {
        // Default state if table is empty
        setConfig({
          hero: { videoSrc: "", subtitle: "", title: "" },
          marquee: { text: "" }
        });
      }
    };
    loadConfig();
  }, [supabase]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    setStatus("UPLOADING_TO_VAULT...");
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    try {
      // Upload to your "vault" bucket
      const { data, error } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (error) throw error;

      // Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vault')
        .getPublicUrl(filePath);

      setConfig({ ...config, hero: { ...config.hero, videoSrc: publicUrl } });
      setStatus("VIDEO_UPLOADED_SUCCESSFULLY");
    } catch (err) {
      console.error(err);
      setStatus("UPLOAD_ERROR_CHECK_STORAGE_POLICIES");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("SYNCING_TO_SUPABASE...");
    
    // Upsert the entire config object into the 'hero' row
    const { error } = await supabase
      .from('site_config')
      .upsert({ 
        section_name: 'hero', 
        content: config 
      }, { onConflict: 'section_name' });

    if (!error) {
      setStatus("CHANGES_LIVE_ON_HOME_PAGE");
      setTimeout(() => setStatus(""), 4000);
    } else {
      console.error(error);
      setStatus("SAVE_FAILED_DATABASE_ERROR");
    }
  };

  if (!config) return <div className="p-20 text-[10px] tracking-[5px] animate-pulse">INITIALIZING_HERO_ENGINE...</div>;

  return (
    <div className="p-10">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
        <div style={{ width: '18px', height: '18px', border: '2px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '6px', height: '6px', background: '#d4af37' }}></div>
        </div>
        <h2 style={{ fontSize: '12px', letterSpacing: '3px', fontWeight: '900', margin: 0 }}>HERO_COMMAND_CENTER</h2>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          
          {/* Video Section */}
          <div>
            <label style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>VIDEO SOURCE (URL)</label>
            <input 
              type="text"
              className="admin-input"
              value={config.hero.videoSrc || ""}
              onChange={e => setConfig({...config, hero: {...config.hero, videoSrc: e.target.value}})}
            />
            <div style={{ marginTop: '15px' }}>
              <label className="upload-btn">
                {uploading ? "UPLOADING..." : "UPLOAD_TO_SUPABASE_VAULT"}
                <input type="file" accept="video/*" onChange={handleVideoUpload} hidden disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Subtitle Section */}
          <div>
            <label style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>HERO SUBTITLE</label>
            <input 
              type="text" 
              className="admin-input"
              value={config.hero.subtitle || ""}
              onChange={e => setConfig({...config, hero: {...config.hero, subtitle: e.target.value}})}
            />
          </div>

          {/* Headline Section */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '10px', color: '#555', letterSpacing: '2px' }}>MAIN HEADLINE</label>
            <textarea 
              className="admin-input" 
              style={{ height: '80px', paddingTop: '15px' }}
              value={config.hero.title || ""}
              onChange={e => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
            />
          </div>

          {/* MARQUEE SECTION */}
          <div style={{ gridColumn: 'span 2', borderTop: '1px solid #111', paddingTop: '40px' }}>
            <label style={{ fontSize: '10px', color: '#d4af37', letterSpacing: '2px', fontWeight: 'bold' }}>MARQUEE TRACK TEXT</label>
            <input 
              type="text" 
              className="admin-input"
              placeholder="Enter marquee text..."
              value={config.marquee?.text || ""}
              onChange={e => setConfig({
                ...config, 
                marquee: { ...config.marquee, text: e.target.value }
              })}
            />
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={uploading}>
          {uploading ? "WAITING_FOR_UPLOAD..." : "SAVE_ALL_HERO_CHANGES"}
        </button>
        
        {status && (
          <p style={{ color: '#d4af37', fontSize: '10px', marginTop: '20px', letterSpacing: '2px' }}>
            {status}
          </p>
        )}
      </form>

      <style jsx>{`
        .admin-input { width: 100%; background: #A39F9F; border: 1px solid #111; padding: 20px; color: #fff; font-size: 13px; margin-top: 10px; outline: none; }
        .admin-input:focus { border-color: #d4af37; }
        .upload-btn { display: inline-block; padding: 10px 20px; border: 1px solid #333; color: #888; font-size: 9px; letter-spacing: 2px; cursor: pointer; transition: 0.3s; }
        .upload-btn:hover { border-color: #d4af37; color: #fff; }
        .save-btn { background: #d4af37; color: #000; border: none; padding: 15px 40px; font-size: 10px; font-weight: 900; letter-spacing: 2px; cursor: pointer; }
        .save-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  );
}