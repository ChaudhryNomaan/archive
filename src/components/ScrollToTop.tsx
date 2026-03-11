'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ScrollToTop = () => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    const toggleVisibility = () => {
      // Show button after scrolling 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  const s = {
    button: {
      position: 'fixed' as const,
      bottom: '40px',
      right: '40px',
      width: '60px',
      height: '30px',
      zIndex: 999999,
      backgroundColor: isHovered ? '#fff' : '#000',
      border: '1px solid #fff',
      color: isHovered ? '#000' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'none', // Critical to match your custom cursor logic
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      pointerEvents: isVisible ? ('auto' as const) : ('none' as const),
      padding: 0,
      overflow: 'hidden',
    },
    text: {
      fontSize: '8px',
      fontWeight: 900,
      textTransform: 'uppercase' as const,
      letterSpacing: '3px',
      transition: 'all 0.5s ease',
    },
    line: {
      position: 'absolute' as const,
      bottom: '0',
      left: '0',
      width: isHovered ? '100%' : '0%',
      height: '1px',
      backgroundColor: '#000',
      transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    // The "Scanning" sweep animation via inline keyframes is tricky, 
    // so we use a transition-based light streak on hover.
    streak: {
      position: 'absolute' as const,
      top: 0,
      left: isHovered ? '150%' : '-150%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      transform: 'skewX(-20deg)',
      transition: isHovered ? 'left 0.7s ease-in-out' : 'none',
    }
  };

  const buttonContent = (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Scroll to top"
      style={s.button}
    >
      <div style={s.streak} />
      <span style={s.text}>Top</span>
      <div style={s.line} />
    </button>
  );

  return createPortal(buttonContent, document.body);
};

export default ScrollToTop;