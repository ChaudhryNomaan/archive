"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function Footer() {
  const supabase = createClient();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Default values to show if database fetch fails or is empty
  const [data, setData] = useState({
    location: 'LONDON, UK',
    project: 'VELOS ARCHIVE © 2026',
    instagram: 'instagram.com',
    twitter: 'twitter.com'
  });

  useEffect(() => {
    setHasMounted(true);
    
    const fetchFooterData = async () => {
      try {
        const { data: config, error } = await supabase
          .from('site_config')
          .select('content')
          .eq('section_name', 'footer')
          .single();

        // If there's an error (like table doesn't exist yet), 
        // we just log a warning and keep the default data
        if (error) {
          console.warn("Footer sync: Table not found or empty. Using local defaults.");
          return;
        }

        if (config && config.content) {
          // Merge fetched data with defaults to ensure all fields exist
          setData((prev) => ({ ...prev, ...config.content }));
        }
      } catch (err) {
        // Silencing the crash by catching the error
        console.error("Footer sync error handled.");
      }
    };

    fetchFooterData();
  }, [supabase]);

  if (!hasMounted) {
    return <footer className="site-footer" style={{ opacity: 0 }} />;
  }

  // Safe URL helper
  const formatUrl = (url: string) => {
    if (!url || url === '#') return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <footer className="site-footer">
      <style jsx>{`
        .site-footer {
          padding: 60px 40px;
          background: #000;
          border-top: 1px solid #111;
          color: #fff;
        }
        .footer-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .footer-label {
          display: block;
          font-size: 8px;
          letter-spacing: 3px;
          color: #444;
          margin-bottom: 15px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .footer-section p, .footer-links a {
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #888;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links a:hover {
          color: #fff;
        }
      `}</style>

      <div className="footer-container">
        <div className="footer-section">
          <span className="footer-label">LOCATION</span>
          <p>{data.location}</p>
        </div>
        
        <div className="footer-section">
          <span className="footer-label">PROJECT</span>
          <p>{data.project}</p>
        </div>
        
        <div className="footer-section">
          <span className="footer-label">SOCIAL</span>
          <div className="footer-links">
            <a href={formatUrl(data.instagram)} target="_blank" rel="noopener noreferrer">
              INSTAGRAM
            </a>
            <a href={formatUrl(data.twitter)} target="_blank" rel="noopener noreferrer">
              TWITTER
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}