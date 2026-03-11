"use client";
import { useState, useEffect } from 'react';
import { ASSETS } from '@/lib/constants';

interface MediaProps {
  item: {
    media?: any;           // Now accepts any to handle Supabase JSONB
    basePath?: string;     // Support for legacy static assets
    fallbackIdx?: number;
    name?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export default function Media({ item, className = "", style = {} }: MediaProps) {
  const [stage, setStage] = useState(0);
  const extensions = ['jpg', 'webp', 'png', 'mp4'];

  // 1. Robust Source Resolution (Handles String, Array, or JSONB Object)
  const getInitialPath = () => {
    let raw = item?.media || item?.basePath || "";
    
    // If Supabase returns an array from a JSONB column
    if (Array.isArray(raw)) return raw[0];
    
    // If Supabase returns an object { url: "..." } or { path: "..." }
    if (typeof raw === 'object' && raw !== null) {
      return raw.url || raw.path || "";
    }
    
    return raw;
  };

  const initialPath = getInitialPath();

  // 2. Determine if it's a direct file path or a base name needing an extension
  const hasExtension = /\.(jpg|jpeg|png|webp|mp4|mov|webm)$/i.test(initialPath);

  useEffect(() => {
    setStage(0);
  }, [initialPath]);

  // Placeholder for empty paths
  if (!initialPath) {
    return (
      <div 
        className={`media-frame ${className}`} 
        style={{ background: '#f5f5f5', width: '100%', height: '100%', ...style }} 
      />
    );
  }

  const handleError = () => {
    // Only try extension cycling if the original path didn't have one
    if (!hasExtension && stage < extensions.length) {
      setStage(prev => prev + 1);
    }
  };

  // 3. Construct Final Source URL
  let currentSrc = initialPath;
  
  if (!hasExtension) {
    // Static logic: cycle through extensions
    currentSrc = `${initialPath}.${extensions[stage]}`;
  } else {
    // Dynamic logic: Ensure it's a valid relative or absolute URL
    if (!currentSrc.startsWith('/') && !currentSrc.startsWith('http')) {
      currentSrc = `/images/${currentSrc}`;
    }
  }

  // 4. Final Fallback (if cycling fails)
  if (!hasExtension && stage >= extensions.length) {
    const fallbackImage = ASSETS[item.fallbackIdx ?? 0]?.i || "";
    return (
      <div className={`media-frame reveal-frame ${className}`} style={{ width: '100%', height: '100%', ...style }}>
        <img src={fallbackImage} alt="Fallback" className="object-cover w-full h-full grayscale" />
      </div>
    );
  }

  const isVideo = currentSrc.toLowerCase().endsWith('.mp4');

  return (
    <div 
      className={`media-frame reveal-frame ${className}`} 
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      {isVideo ? (
        <video 
          key={currentSrc} 
          src={currentSrc} 
          autoPlay 
          loop 
          muted 
          playsInline 
          onError={handleError}
          className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
        />
      ) : (
        <img 
          key={currentSrc} 
          src={currentSrc} 
          alt={item.name || "Archive Asset"} 
          onError={handleError} 
          className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
        />
      )}
    </div>
  );
}