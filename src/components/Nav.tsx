"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVelos } from '@/context/VelosContext';
import { CAT_MAP } from '@/lib/constants';
import { createClient } from '@/lib/supabase';

export default function Nav() {
  const supabase = createClient();
  const { isMenuOpen, setIsMenuOpen, bag, setIsBagOpen } = useVelos();
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const [branding, setBranding] = useState({
    logoText: 'VELOS',
    bagLabel: 'BAG'
  });

  useEffect(() => {
    // Fetch the branding settings from Supabase site_config
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase
          .from('site_config')
          .select('content')
          .eq('section_name', 'identity')
          .single();

        if (error) throw error;

        if (data?.content) {
          setBranding({
            logoText: data.content.logoText || 'VELOS',
            bagLabel: data.content.bagLabel || 'BAG'
          });
        }
      } catch (err) {
        console.warn("Branding sync skipped, using defaults:", err);
      }
    };

    fetchBranding();

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / (totalScroll || 1)) * 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [supabase]);

  return (
    <header className="site-nav">
      <div className="nav-container">
        <div className="nav-left">
          <button 
            className="menu-trigger" 
            aria-label="Toggle Menu" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`bar ${isMenuOpen ? 'open' : ''}`} />
            <div className={`bar ${isMenuOpen ? 'open' : ''}`} />
          </button>
          <div className="desktop-links">
            {Object.keys(CAT_MAP).map(c => (
              <Link key={c} href={`/category/${c}`}>{c}</Link>
            ))}
          </div>
        </div>
        
        <Link href="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          {branding.logoText}
        </Link>
        
        <div className="nav-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button className="bag-trigger" onClick={() => setIsBagOpen(true)}>
            {branding.bagLabel} ({bag?.length || 0})
          </button>
        </div>
      </div>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
    </header>
  );
}