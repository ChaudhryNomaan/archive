"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function Footer() {
  const supabase = createClient();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Стандартні значення українською
  const [data, setData] = useState({
    location: 'ЛОНДОН, ВЕЛИКОБРИТАНІЯ',
    project: 'OSNOVA ARCHIVE © 2026',
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

        if (error) {
          console.warn("Footer sync: Таблицю не знайдено або вона порожня. Використовуються локальні значення.");
          return;
        }

        if (config && config.content) {
          setData((prev) => ({ ...prev, ...config.content }));
        }
      } catch (err) {
        console.error("Помилка синхронізації футера оброблена.");
      }
    };

    fetchFooterData();
  }, [supabase]);

  if (!hasMounted) {
    return <footer className="site-footer" style={{ opacity: 0 }} />;
  }

  const formatUrl = (url: string) => {
    if (!url || url === '#') return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <footer className="site-footer">
      <style jsx>{`
        .site-footer {
          padding: 60px 40px;
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
          <span className="footer-label">ЛОКАЦІЯ</span>
          <p>{data.location}</p>
        </div>
        
        <div className="footer-section">
          <span className="footer-label">ПРОЄКТ</span>
          <p>{data.project}</p>
        </div>
        
        <div className="footer-section">
          <span className="footer-label">СОЦМЕРЕЖІ</span>
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