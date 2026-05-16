'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Modes() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  const modes = [
    {
      id: 'text-to-image',
      icon: '✦',
      title: 'Text to Image',
      subtitle: 'Conjure visuals from words',
      description: 'Describe anything and watch it materialize. From dark fantasy landscapes to surreal portraits — if you can imagine it, Hexframe can render it.',
      href: '/dashboard',
      gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      glow: 'rgba(124,58,237,0.5)',
      border: 'rgba(124,58,237,0.25)',
      tagColor: '#a855f7',
      tag: 'Available',
    },
    {
      id: 'text-to-3d',
      icon: '⬡',
      title: 'Text to 3D',
      subtitle: 'Manifest objects into space',
      description: 'Transform your words into fully realized 3D renders. Watch your creation come alive on a rotating 3D canvas rendered live in the browser.',
      href: '/generate-3d',
      gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
      glow: 'rgba(14,165,233,0.5)',
      border: 'rgba(14,165,233,0.25)',
      tagColor: '#38bdf8',
      tag: 'Available',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '20%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: '#7c3aed', opacity: 0.05, filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: '#0ea5e9', opacity: 0.05, filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(124,58,237,0.12)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <svg viewBox="0 0 100 100" width={36} height={36}>
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none" stroke="#7c3aed" strokeWidth="3"
              style={{ filter: 'drop-shadow(0 0 6px #7c3aed)' }} />
            <circle cx="50" cy="50" r="8" fill="#7c3aed" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.15em', color: '#e2e8f0' }}>HEXFRAME</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/gallery" style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none' }}>Gallery</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a855f7' }}>@{user?.username}</span>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 20 }}>
            Welcome back, {user?.username}
          </p>
          <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg, #f1f5f9 0%, #a855f7 55%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            What will you<br />create today?
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            Choose your mode. Each path conjures something entirely different.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, width: '100%', maxWidth: 900 }}>
          {modes.map((mode) => (
            <Link key={mode.id} href={mode.href} style={{ textDecoration: 'none' }}>
              <div style={{
                position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: 24,
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${mode.border}`,
                overflow: 'hidden', transition: 'all 0.4s ease', cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-8px) scale(1.02)';
                  el.style.boxShadow = `0 24px 60px ${mode.glow.replace('0.5', '0.25')}`;
                  el.style.borderColor = mode.border.replace('0.25', '0.5');
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = mode.border;
                }}
              >
                {/* Top color bar */}
                <div style={{ height: 3, background: mode.gradient, width: '100%' }} />

                {/* Body */}
                <div style={{ padding: '40px 40px 36px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                  {/* Icon + tag */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: mode.gradient, boxShadow: `0 0 28px ${mode.glow}`, flexShrink: 0 }}>
                      {mode.icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: `${mode.tagColor}15`, color: mode.tagColor, border: `1px solid ${mode.tagColor}30`, letterSpacing: '0.05em' }}>
                      {mode.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 10, letterSpacing: '-0.02em' }}>
                    {mode.title}
                  </h2>

                  {/* Subtitle */}
                  <p style={{ fontSize: 13, fontWeight: 600, color: mode.tagColor, marginBottom: 20, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    {mode.subtitle}
                  </p>

                  {/* Description */}
                  <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, flex: 1 }}>
                    {mode.description}
                  </p>

                  {/* CTA */}
                  <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: mode.tagColor }}>
                    Enter mode
                    <span style={{ fontSize: 18 }}>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}