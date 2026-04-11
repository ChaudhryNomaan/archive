"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Cursor from '../Components/Cursor';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Added for responsiveness

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      console.error("Sign out failed:", err.message);
      alert("System access termination failed.");
    }
  };

  const navItems = [
    { label: "SALES", path: "/admin/sales" },
    { label: "HERO & LANDING", path: "/admin" }, 
    { label: "IDENTITY", path: "/admin/identity" },
    { label: "ARCHIVE / VAULT", path: "/admin/archive" },
    { label: "FOOTER & LINKS", path: "/admin/footer" },
    { label: "CHECKOUT", path: "/admin/checkout" },
    { label: "MOBILEOVERLAY", path: "/admin/mobileoverlay" },
  ];

  if (!mounted) {
    return <div style={{ background: '#000', minHeight: '100vh' }} />;
  }

  return (
    <div className={`admin-wrapper ${isMenuOpen ? 'menu-active' : ''}`}>
      <Cursor />

      {/* --- Mobile Hamburger Bar --- */}
      <header className="mobile-header">
        <div className="brand-logo-box serif-italic">P</div>
        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`bar ${isMenuOpen ? 'top' : ''}`}></div>
          <div className={`bar ${isMenuOpen ? 'mid' : ''}`}></div>
          <div className={`bar ${isMenuOpen ? 'bot' : ''}`}></div>
        </button>
      </header>

      <aside className={`admin-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '60px' }} className="sidebar-branding">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="brand-logo-box serif-italic">P</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '3px', color: '#fff' }}>
                PORTFOLIO
              </div>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '2px', fontStyle: 'italic' }}>
                STUDIO
              </div>
            </div>
          </div>
          <div style={{ fontSize: '9px', color: '#8b4513', fontWeight: 'bold', marginTop: '8px', letterSpacing: '1px' }}>
            ADMIN ENGINE V2
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.path} 
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ color: '#22c55e', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', letterSpacing: '1px' }}>
            <span className="status-dot"></span>
            LIVE SYNC ACTIVE
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/" target="_blank" style={{ textDecoration: 'none' }}>
              <button className="preview-btn" style={{ width: '100%' }}>
                PREVIEW SITE ↗
              </button>
            </Link>

            <button 
              onClick={handleSignOut}
              className="signout-btn"
            >
              TERMINATE SESSION [02]
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-top-nav">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="SYSTEM SEARCH..." 
              className="admin-search"
            />
          </div>
          <div className="admin-notification">🔔</div>
        </header>
        
        <section className="admin-content-frame">
          {children}
        </section>
      </main>

      <style jsx>{`
        /* Mobile Header Styling */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          width: 100%;
          height: 70px;
          background: #080808;
          z-index: 2000;
          padding: 0 25px;
          border-bottom: 1px solid #1a1a1a;
          align-items: center;
          justify-content: space-between;
        }

        .hamburger {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          padding: 10px;
        }

        .bar {
          width: 25px;
          height: 1px;
          background: #fff;
          transition: 0.3s;
        }

        .bar.top { transform: translateY(7px) rotate(45deg); }
        .bar.mid { opacity: 0; }
        .bar.bot { transform: translateY(-7px) rotate(-45deg); }

        .admin-top-nav {
          display: flex; 
          justify-content: flex-end; 
          margin-bottom: 60px; 
          gap: 20px;
        }

        .signout-btn {
          background: transparent;
          border: 1px solid #333;
          color: #666;
          padding: 12px;
          font-size: 9px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.4s ease;
          text-transform: uppercase;
          width: 100%;
        }

        .signout-btn:hover {
          background: #ff4444;
          color: #fff;
          border-color: #ff4444;
        }

        /* Logic for responsiveness */
        @media (max-width: 1024px) {
          .mobile-header { display: flex; }
          
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 70px;
            bottom: 0;
            width: 100%;
            height: calc(100vh - 70px);
            background: #000;
            z-index: 1500;
            transform: translateY(-110%);
            transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
            padding: 40px 25px;
          }

          .admin-sidebar.open {
            transform: translateY(0);
          }

          .admin-main {
            padding: 100px 20px 40px 20px !important;
          }

          .admin-top-nav {
            display: none; /* Hide top search bar on mobile to save space */
          }

          .sidebar-branding {
            display: none; /* Already in mobile header */
          }
          
          .sidebar-footer {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 1px solid #1a1a1a;
          }
        }
      `}</style>
    </div>
  );
}