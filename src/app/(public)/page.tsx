"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function Home() {
  const supabase = createClient();
  const [hasMounted, setHasMounted] = useState(false);
  
  // Set default values here so the site works even if the DB is empty
  const [config, setConfig] = useState<any>({
    hero: {
      title: 'VELOS ARCHIVE',
      subtitle: 'MODULAR DESIGN SYSTEM',
      videoSrc: '',
      buttonText: 'EXPLORE THE LAB',
      buttonLink: '/category/LAB'
    },
    marquee: {
      text: 'VELOS LAB SERIES — 2026 EDITION — MODULARITY — '
    }
  });

  useEffect(() => {
    setHasMounted(true);

    const fetchHeroConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('content')
          .eq('section_name', 'hero')
          .single();

        // If there's an error (like no row found), we just keep the defaults
        if (error) {
          console.warn("No hero config found in Supabase, using defaults.");
          return;
        }

        if (data?.content) {
          setConfig(data.content);
        }
      } catch (err) {
        console.error("Error loading site configuration:", err);
      }
    };

    fetchHeroConfig();
  }, [supabase]);

  if (!hasMounted) {
    return <div className="home-container bg-black min-h-screen" />;
  }

  return (
    <div className="home-container">
      <section className="h-hero">
        {config.hero?.videoSrc && (
          <video 
            src={config.hero.videoSrc} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="h-hero-img"
            key={config.hero.videoSrc}
          />
        )}
        
        <div className="h-overlay">
          <h1 
            className="reveal-text" 
            dangerouslySetInnerHTML={{ 
              __html: config.hero?.title?.replace(/\n/g, '<br/>') || "VELOS ARCHIVE" 
            }} 
          />
          
          <p className="stagger-in" style={{ animationDelay: '0.4s' }}>
            {config.hero?.subtitle}
          </p>
          
          <Link 
            href={config.hero?.buttonLink || "/category/LAB"} 
            className="h-btn stagger-in" 
            style={{ animationDelay: '0.6s' }}
          >
            {config.hero?.buttonText || "EXPLORE THE LAB"}
          </Link>
        </div>
      </section>

      <section className="h-marquee">
        <div className="m-track">
          {[1, 2, 3, 4].map(i => (
            <span key={i}>
              {config.marquee?.text || "VELOS LAB SERIES — 2026 EDITION — MODULARITY — "}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}