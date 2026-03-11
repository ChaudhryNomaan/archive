"use client";
import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother performance
      window.requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    };

    const handleHover = () => cursor.classList.add('hover');
    const handleUnhover = () => cursor.classList.remove('hover');

    window.addEventListener('mousemove', moveCursor);

    // Attach hover listeners to all interactive elements
    const targets = document.querySelectorAll('a, button, .checkout-input, input');
    targets.forEach(t => {
      t.addEventListener('mouseenter', handleHover);
      t.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      targets.forEach(t => {
        t.removeEventListener('mouseenter', handleHover);
        t.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, []);

  return <div ref={cursorRef} className="cursor-dot" />;
}