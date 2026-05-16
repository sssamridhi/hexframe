'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/hex1/400/400',
  'https://picsum.photos/seed/hex2/400/400',
  'https://picsum.photos/seed/hex3/400/400',
  'https://picsum.photos/seed/hex4/400/400',
  'https://picsum.photos/seed/hex5/400/400',
  'https://picsum.photos/seed/hex6/400/400',
  'https://picsum.photos/seed/hex7/400/400',
  'https://picsum.photos/seed/hex8/400/400',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.token, data.user);
      router.push('/modes');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', overflowX: 'hidden' }}>

      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: '#7c3aed', opacity: 0.06, filter: 'blur(140px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: '#4f46e5', opacity: 0.06, filter: 'blur(140px)', pointerEvents: 'none', zIndex: 0 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '18px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,58,237,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg viewBox="0 0 100 100" width={32} height={32} style={{ filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.8))' }}>
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#7c3aed" strokeWidth="3" />
            <circle cx="50" cy="50" r="8" fill="#7c3aed" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.18em', color: '#e2e8f0' }}>HEXFRAME</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/signup" style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none', padding: '8px 20px' }}>
            Sign up
          </Link>
          <a href="#login" style={{ fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none', padding: '9px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
            Sign in
          </a>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 24px 60px' }}>
        <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a855f7', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', padding: '6px 18px', borderRadius: 20, marginBottom: 28 }}>
          AI Creative Studio
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #f1f5f9 0%, #c4b5fd 45%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', maxWidth: 800, margin: '0 auto 24px' }}>
          Create anything.<br />Imagine everything.
        </h1>
        <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.8 }}>
          Turn your words into stunning AI-generated images and 3D renders. No skills required — just your imagination.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#login" style={{ fontSize: 15, fontWeight: 700, color: 'white', textDecoration: 'none', padding: '15px 36px', borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.45)' }}>
            Start Creating Free →
          </a>
          <Link href="/signup" style={{ fontSize: 15, fontWeight: 600, color: '#a855f7', textDecoration: 'none', padding: '15px 36px', borderRadius: 14, border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.06)' }}>
            Create Account
          </Link>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, overflow: 'hidden', padding: '40px 0', marginBottom: 20 }}>
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scroll-track {
            display: flex;
            gap: 16px;
            width: max-content;
            animation: scroll-left 30s linear infinite;
          }
          .scroll-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="scroll-track">
          {[...SAMPLE_IMAGES, ...SAMPLE_IMAGES].map((url, i) => (
            <div key={i} style={{ width: 220, height: 220, borderRadius: 16, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(124,58,237,0.15)' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6) saturate(0.8)' }} loading="lazy" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '80px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f1f5f9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Two powerful modes
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
            Whether you want a stunning image or a rotating 3D render, Hexframe has you covered.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {[
            {
              icon: '✦',
              title: 'Text to Image',
              subtitle: 'Conjure visuals from words',
              description: 'Type any prompt and watch Hexframe generate a stunning, high-quality image in seconds. Dark fantasy, surreal art, portraits, landscapes — anything you can describe.',
              gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              glow: 'rgba(124,58,237,0.4)',
              color: '#a855f7',
              perks: ['Photorealistic results', 'Any style or genre', 'Chat-style history', 'Reference previous images'],
            },
            {
              icon: '⬡',
              title: 'Text to 3D',
              subtitle: 'Manifest objects into space',
              description: 'Go beyond flat images. Generate fully rendered 3D models from a text description and explore them live in the browser with real-time rotation and zoom.',
              gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              glow: 'rgba(14,165,233,0.4)',
              color: '#38bdf8',
              perks: ['Live 3D browser preview', 'Rotate & zoom controls', 'Download your renders', 'Octane-style quality'],
            },
          ].map((f, i) => (
            <div key={i} style={{ borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: `1px solid ${f.color}30` }}>
              <div style={{ height: 3, background: f.gradient }} />
              <div style={{ padding: '36px 36px 32px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: f.gradient, boxShadow: `0 0 24px ${f.glow}`, marginBottom: 28 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 12, fontWeight: 700, color: f.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{f.subtitle}</p>
                <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 28 }}>{f.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {f.perks.map((p, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#9ca3af' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '60px 60px 80px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, background: 'linear-gradient(135deg, #f1f5f9, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          How it works
        </h2>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 56, lineHeight: 1.7 }}>Three steps to your creation</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {[
            { step: '01', title: 'Sign up free', desc: 'Create your Hexframe account in seconds. No credit card needed.' },
            { step: '02', title: 'Choose your mode', desc: 'Pick Text to Image or Text to 3D depending on what you want to create.' },
            { step: '03', title: 'Describe & generate', desc: 'Type your prompt, hit enter, and watch your vision materialize.' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '32px 28px', borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.15)', textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.1em', marginBottom: 16 }}>{s.step}</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{s.title}</h4>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="login" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', padding: '20px 24px 100px' }}>
        <div style={{ width: '100%', maxWidth: 420, padding: '48px 44px', borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.2)', backdropFilter: 'blur(12px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Sign in</h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Welcome back to the void</p>
          </div>
          {error && (
            <div style={{ marginBottom: 20, padding: '11px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 0 24px rgba(124,58,237,0.3)', transition: 'opacity 0.2s' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </section>
    </div>
  );
}