"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOSNOVA } from '../context/OSNOVAContext';
import { createClient } from '@/lib/supabase';

// Назви секторів для відображення (перекладені) та їхні параметри для URL
const NAV_SECTORS = [
  { label: "ЧОЛОВІЧЕ ВЗУТТЯ", param: "men-shoes" },
  { label: "ЖІНОЧЕ ВЗУТТЯ", param: "women-shoes" },
  { label: "СОРОЧКИ", param: "shirts" },
  { label: "ШОРТИ", param: "shorts" }
];

export default function Nav() {
  const supabase = createClient();
  const { 
    isMenuOpen, 
    setIsMenuOpen, 
    bag, 
    setIsBagOpen 
  } = useOSNOVA();
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [branding, setBranding] = useState({
    logoText: 'OSNOVA', 
    bagLabel: 'КОШИК' // Стандартне значення українською
  });

  useEffect(() => {
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
            logoText: data.content.logoText || 'OSNOVA',
            // Якщо в БД мітка "BAG", замінюємо на "КОШИК" або використовуємо значення з БД
            bagLabel: data.content.bagLabel === 'BAG' ? 'КОШИК' : (data.content.bagLabel || 'КОШИК')
          });
        }
      } catch (err) {
        console.warn("Помилка синхронізації брендингу, використовуємо стандартні значення:", err);
      }
    };

    fetchBranding();

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / (totalScroll || 1)) * 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
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
            aria-label="Відкрити меню" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`bar ${isMenuOpen ? 'open' : ''}`} />
            <div className={`bar ${isMenuOpen ? 'open' : ''}`} />
          </button>
          
          <div className="desktop-links">
            {NAV_SECTORS.map(sector => (
              <Link 
                key={sector.param} 
                href={`/category/${sector.param}`}
                className="nav-item"
              >
                {sector.label}
              </Link>
            ))}
          </div>
        </div>
        
        <Link href="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          <span className="logo-main">{branding.logoText}</span>
        </Link>
        
        <div className="nav-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button className="bag-trigger" onClick={() => setIsBagOpen(true)}>
            {branding.bagLabel} ({bag?.length || 0})
          </button>
        </div>
      </div>

      <style jsx>{`
        .logo-main {
          font-weight: 900;
          letter-spacing: -1px;
          text-transform: uppercase;
        }
        .desktop-links {
          display: flex;
          gap: 25px;
          margin-left: 40px;
        }
        .nav-item {
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-decoration: none;
          transition: color 0.3s;
          text-transform: uppercase;
        }
        .nav-item:hover {
          color: #000;
        }
        .scroll-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: #000;
          transition: width 0.1s ease-out;
        }
        @media (max-width: 1024px) {
          .desktop-links { display: none; }
        }
      `}</style>

      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
    </header>
  );
}