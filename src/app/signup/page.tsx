'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Signup() {
  const [username, setUsername] = useState('');
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: '#7c3aed', opacity: 0.06, filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: '#4f46e5', opacity: 0.06, filter: 'blur(120px)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, padding: '48px 44px', borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.2)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Link href="/login" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <svg viewBox="0 0 100 100" width={44} height={44} style={{ filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.7))' }}>
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#7c3aed" strokeWidth="3" />
              <circle cx="50" cy="50" r="8" fill="#7c3aed" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.2em', color: '#e2e8f0' }}>HEXFRAME</span>
          </Link>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Join Hexframe and start creating</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, padding: '11px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="shadowweaver"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.2)'}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 0 24px rgba(124,58,237,0.3)', transition: 'opacity 0.2s' }}>
          {loading ? 'Creating account...' : 'Create account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#6b7280' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}