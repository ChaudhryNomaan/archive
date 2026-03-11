"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function Cursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const springConfig = { damping: 35, stiffness: 350, mass: 0.5 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    // 1. Precise Detection: Only enable if screen is > 1024px AND has a fine pointer (mouse)
    const checkDevice = () => {
      const isLargeScreen = window.matchMedia("(min-width: 1025px)").matches;
      const hasMouse = window.matchMedia("(pointer: fine)").matches;
      setIsDesktop(isLargeScreen && hasMouse);
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);

    const moveMouse = (e: MouseEvent) => {
      // Wake up the cursor on first move
      if (!isVisible) setIsVisible(true);
      
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' ||
        target.closest('.nav-item') ||
        target.closest('.luxury-size-btn') ||
        target.closest('.inventory-row-luxury') ||
        target.closest('.select-trigger') ||
        target.closest('.upload-block') ||
        target.closest('.preview-btn');

      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Only attach listeners if on desktop
    if (window.matchMedia("(min-width: 1025px)").matches) {
      window.addEventListener("mousemove", moveMouse);
      window.addEventListener("mouseover", handleOver);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseenter", handleMouseEnter);
    }

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  // If not on desktop, render nothing at all
  if (!isDesktop) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          left: mouseX,
          top: mouseY,
          opacity: isVisible ? 1 : 0,
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
        }}
      />

      <motion.div
        className="cursor-halo"
        animate={{
          width: isHovered ? 60 : 20,
          height: isHovered ? 60 : 20,
          opacity: isVisible ? (isHovered ? 1 : 0.4) : 0,
          backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0)',
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          left: mouseX,
          top: mouseY,
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99998,
        }}
      />

      <style jsx global>{`
        /* Hide default cursor on desktops only */
        @media (min-width: 1025px) {
          body, a, button, input, .inventory-row-luxury, .select-trigger, .nav-item {
            cursor: none !important;
          }
        }

        .cursor-dot, .cursor-halo {
          top: 0;
          left: 0;
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }

        .cursor-dot {
          width: 5px;
          height: 5px;
          background: #d4af37;
        }

        .cursor-halo {
          border: 1px solid #d4af37;
        }
      `}</style>
    </>
  );
}