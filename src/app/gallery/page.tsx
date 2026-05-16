'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface GalleryImage {
  prompt: string;
  imageUrl: string;
  mode: string;
  createdAt: string;
}

const HexLogo = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
      fill="none" stroke="#7c3aed" strokeWidth="3"
      style={{ filter: 'drop-shadow(0 0 6px #7c3aed)' }} />
    <circle cx="50" cy="50" r="8" fill="#7c3aed" />
  </svg>
);

const modeColor: Record<string, string> = {
  'text-to-image': '#a855f7',
  'text-to-3d': '#0ea5e9',
};

const modeLabel: Record<string, string> = {
  'text-to-image': '✦ Image',
  'text-to-3d': '⬡ 3D',
};

export default function Gallery() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<'all' | 'text-to-image' | 'text-to-3d'>('all');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/gallery', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setImages(data.images || []); setFetching(false); });
  }, [token]);

  const filtered = filter === 'all' ? images : images.filter(i => i.mode === filter);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: '#7c3aed', opacity: 0.04, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: '#0ea5e9', opacity: 0.04, filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.97)', borderBottom: '1px solid rgba(124,58,237,0.12)', backdropFilter: 'blur(12px)' }}>
        <Link href="/modes" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <HexLogo size={28} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.15em', color: '#e2e8f0' }}>HEXFRAME</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/modes" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Modes</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed' }} />
            <span style={{ fontSize: 13, color: '#a855f7', fontWeight: 500 }}>@{user?.username}</span>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 12 }}>Your Collection</p>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 12, background: 'linear-gradient(135deg, #e2e8f0 0%, #a855f7 60%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            The Void Gallery
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Every image you've conjured, in one place.</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {(['all', 'text-to-image', 'text-to-3d'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#a855f7' : '#6b7280',
                outline: filter === f ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s',
              }}>
              {f === 'all' ? `All (${images.length})` : f === 'text-to-image' ? `✦ Images (${images.filter(i => i.mode === 'text-to-image').length})` : `⬡ 3D (${images.filter(i => i.mode === 'text-to-3d').length})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✦</p>
            <p style={{ fontSize: 16, color: '#4b5563', marginBottom: 8 }}>Nothing here yet</p>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 24 }}>Generate something to see it appear here</p>
            <Link href="/modes" style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Start Creating
            </Link>
          </div>
        ) : (
          <div style={{ columns: '4 200px', gap: 12 }}>
            {filtered.map((img, i) => (
              <div key={i}
                onClick={() => setSelected(img)}
                style={{ breakInside: 'avoid', marginBottom: 12, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid rgba(124,58,237,0.1)', transition: 'all 0.2s' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}>
                <img src={img.imageUrl} alt={img.prompt} style={{ width: '100%', display: 'block' }} loading="lazy" />
                {/* Overlay on hover */}
                <div className="group" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                  <p style={{ fontSize: 11, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 6 }}>{img.prompt}</p>
                  <span style={{ fontSize: 10, fontWeight: 600, color: modeColor[img.mode] || '#a855f7' }}>{modeLabel[img.mode] || '✦'}</span>
                </div>
                {/* Mode badge */}
                <div style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: 'rgba(0,0,0,0.6)', color: modeColor[img.mode] || '#a855f7', backdropFilter: 'blur(4px)' }}>
                  {modeLabel[img.mode] || '✦'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={() => setSelected(null)}>
          <div style={{ position: 'relative', maxWidth: 560, width: '100%', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 80px rgba(124,58,237,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <img src={selected.imageUrl} alt={selected.prompt} style={{ width: '100%', display: 'block' }} />
            <div style={{ padding: '16px 20px', background: 'rgba(10,10,15,0.98)' }}>
              <p style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 8, lineHeight: 1.5 }}>{selected.prompt}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: modeColor[selected.mode] || '#a855f7' }}>{modeLabel[selected.mode]}</span>
                <span style={{ fontSize: 11, color: '#4b5563' }}>{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}