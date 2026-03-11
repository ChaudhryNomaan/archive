'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message.toUpperCase());
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  if (!mounted) return null;

  const s = {
    wrapper: {
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#fff',
      cursor: 'none'
    },
    cursor: {
      position: 'fixed' as const,
      left: 0,
      top: 0,
      width: isHovering ? '40px' : '10px',
      height: isHovering ? '40px' : '10px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      pointerEvents: 'none' as const,
      zIndex: 999999,
      mixBlendMode: 'difference' as const,
      transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%)`,
      transition: 'width 0.3s ease, height 0.3s ease',
    },
    card: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '420px',
      backgroundColor: '#050505',
      border: '1px solid rgba(255,255,255,0.05)',
      padding: '60px 40px',
      zIndex: 10
    },
    accent: {
      position: 'absolute' as const,
      top: '-16px',
      left: '-16px',
      width: '48px',
      height: '48px',
      borderTop: '1px solid #d4af37',
      borderLeft: '1px solid #d4af37',
      zIndex: 0
    },
    header: { marginBottom: '48px', textAlign: 'center' as const },
    topLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '8px',
      letterSpacing: '4px',
      color: '#3f3f46',
      marginBottom: '24px',
      fontWeight: 'bold'
    },
    title: { fontSize: '30px', fontWeight: 200, letterSpacing: '6px', textTransform: 'uppercase' as const, margin: 0 },
    italic: { fontFamily: 'serif', fontStyle: 'italic', color: '#71717a' },
    subTitle: { fontSize: '9px', letterSpacing: '3px', color: '#18181b', marginTop: '16px', fontWeight: 900 },
    formGroup: { marginBottom: '40px', display: 'flex', flexDirection: 'column' as const, gap: '12px', position: 'relative' as const },
    label: { fontSize: '9px', letterSpacing: '2px', color: '#71717a', fontWeight: 'bold', textTransform: 'uppercase' as const },
    input: {
      width: '100%',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '1px solid #18181b',
      padding: '12px 0',
      color: '#fff',
      fontSize: '12px',
      outline: 'none',
      letterSpacing: '0.1em',
      cursor: 'none'
    },
    // Show/Hide Toggle Button Style
    toggleBtn: {
      position: 'absolute' as const,
      right: 0,
      bottom: '12px',
      background: 'none',
      border: 'none',
      color: '#3f3f46',
      fontSize: '8px',
      fontWeight: 900,
      letterSpacing: '1px',
      cursor: 'none',
      padding: '4px'
    },
    button: {
      width: '100%',
      backgroundColor: '#fff',
      color: '#000',
      padding: '20px',
      fontSize: '10px',
      fontWeight: 900,
      letterSpacing: '5px',
      border: 'none',
      cursor: 'none',
      textTransform: 'uppercase' as const,
      transition: 'all 0.3s ease'
    },
    error: { fontSize: '9px', color: '#ff4444', letterSpacing: '1px', textAlign: 'center' as const, marginBottom: '20px' },
    footer: { marginTop: '64px', textAlign: 'center' as const, fontSize: '7px', letterSpacing: '3px', color: '#18181b', fontWeight: 'bold' }
  };

  return (
    <div style={s.wrapper}>
      <div style={s.cursor} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
        <div style={s.accent} />
        
        <div style={s.card}>
          <header style={s.header}>
            <div style={s.topLabel}>
              <span>EST. 2026</span>
              <span>SECURE ACCESS</span>
            </div>
            <h1 style={s.title}>ATELIER <span style={s.italic}>Vault</span></h1>
            <p style={s.subTitle}>IDENTIFICATION REQUIRED FOR ARCHIVE ENTRY</p>
          </header>

          <form onSubmit={handleLogin}>
            <div style={s.formGroup}>
              <label style={s.label}>CREDENTIALS / EMAIL</label>
              <input
                type="email"
                required
                placeholder="ADDRESS@STUDIO.COM"
                style={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onFocus={(e) => (e.target.style.borderBottomColor = '#d4af37')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#18181b')}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>ACCESS KEY / PASSWORD</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                style={s.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onFocus={(e) => (e.target.style.borderBottomColor = '#d4af37')}
                onBlur={(e) => (e.target.style.borderBottomColor = '#18181b')}
              />
              <button
                type="button"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setShowPassword(!showPassword)}
                style={s.toggleBtn}
              >
                {showPassword ? '[HIDE]' : '[SHOW]'}
              </button>
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button 
              type="submit" 
              disabled={loading} 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{
                ...s.button,
                opacity: loading ? 0.3 : 1,
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d4af37')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
            >
              {loading ? 'SYNCHRONIZING...' : 'AUTHENTICATE'}
            </button>
          </form>

          <footer style={s.footer}>
            © 2026 LIZA STUDIO ARCHIVE — ALL RIGHTS RESERVED
          </footer>
        </div>
      </div>
    </div>
  );
}