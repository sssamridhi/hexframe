'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import * as THREE from 'three';

const HexLogo = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
      fill="none" stroke="#7c3aed" strokeWidth="3"
      style={{ filter: 'drop-shadow(0 0 6px #7c3aed)' }} />
    <circle cx="50" cy="50" r="8" fill="#7c3aed" />
  </svg>
);

export default function Generate3D() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [history, setHistory] = useState<{ prompt: string; imageUrl: string }[]>([]);
  const [savedChats, setSavedChats] = useState<{ _id: string; title: string }[]>([]);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (token) loadSavedChats();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, generating]);

  useEffect(() => {
    if (!currentImageUrl) return;
    const timer = setTimeout(() => initThreeScene(currentImageUrl), 100);
    return () => {
      clearTimeout(timer);
      if (sceneRef.current?.frameId) cancelAnimationFrame(sceneRef.current.frameId);
      if (sceneRef.current?.renderer) sceneRef.current.renderer.dispose();
    };
  }, [currentImageUrl]);

  const loadSavedChats = async () => {
    const res = await fetch('/api/chats?mode=text-to-3d', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.chats) setSavedChats(data.chats);
  };

  const loadChat = async (chatId: string) => {
    const res = await fetch(`/api/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.chat) {
      const msgs = data.chat.messages;
      const items: { prompt: string; imageUrl: string }[] = [];
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].role === 'assistant' && msgs[i].type === 'image') {
          items.push({ prompt: i > 0 ? msgs[i-1].content : '', imageUrl: msgs[i].content });
        }
      }
      setHistory(items);
      if (items.length > 0) setCurrentImageUrl(items[items.length - 1].imageUrl);
    }
  };

  const initThreeScene = (imgUrl: string) => {
    if (!canvasRef.current) return;
    if (sceneRef.current?.frameId) cancelAnimationFrame(sceneRef.current.frameId);
    if (sceneRef.current?.renderer) sceneRef.current.renderer.dispose();

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(320, 320);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pLight = new THREE.PointLight(0x7c3aed, 3, 15);
    pLight.position.set(3, 3, 3);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(0x4f46e5, 2, 15);
    pLight2.position.set(-3, -2, -3);
    scene.add(pLight2);

    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(600);
    for (let i = 0; i < 600; i++) pos[i] = (Math.random() - 0.5) * 10;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x7c3aed, size: 0.04, transparent: true, opacity: 0.4 })));

    const mouse = { isDown: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0, autoRotate: true };
    canvas.addEventListener('mousedown', (e) => { mouse.isDown = true; mouse.lastX = e.clientX; mouse.lastY = e.clientY; mouse.autoRotate = false; });
    canvas.addEventListener('mouseup', () => { mouse.isDown = false; });
    canvas.addEventListener('mouseleave', () => { mouse.isDown = false; });
    canvas.addEventListener('mousemove', (e) => {
      if (!mouse.isDown) return;
      mouse.rotY += (e.clientX - mouse.lastX) * 0.01;
      mouse.rotX += (e.clientY - mouse.lastY) * 0.01;
      mouse.lastX = e.clientX; mouse.lastY = e.clientY;
    });
    canvas.addEventListener('touchstart', (e) => { mouse.isDown = true; mouse.lastX = e.touches[0].clientX; mouse.lastY = e.touches[0].clientY; mouse.autoRotate = false; });
    canvas.addEventListener('touchend', () => { mouse.isDown = false; });
    canvas.addEventListener('touchmove', (e) => {
      if (!mouse.isDown) return;
      mouse.rotY += (e.touches[0].clientX - mouse.lastX) * 0.01;
      mouse.rotX += (e.touches[0].clientY - mouse.lastY) * 0.01;
      mouse.lastX = e.touches[0].clientX; mouse.lastY = e.touches[0].clientY;
    });
    canvas.addEventListener('wheel', (e) => {
      camera.position.z = Math.max(1.5, Math.min(6, camera.position.z + e.deltaY * 0.005));
    });

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const buildScene = (texture?: THREE.Texture) => {
      const geo = new THREE.DodecahedronGeometry(1, 0);
      const mat = texture
        ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.6 })
        : new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3, metalness: 0.8 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.15 });
      scene.add(new THREE.Mesh(new THREE.DodecahedronGeometry(1.02, 0), wireMat));
      let frameId: number;
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        if (mouse.autoRotate) { mouse.rotY += 0.007; mouse.rotX += 0.003; }
        mesh.rotation.y = mouse.rotY;
        mesh.rotation.x = mouse.rotX;
        renderer.render(scene, camera);
      };
      animate();
      sceneRef.current = { renderer, frameId: frameId! };
    };
    loader.load(imgUrl, (texture) => buildScene(texture), undefined, () => buildScene());
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError('');
    const p = prompt;
    setPrompt('');
    setHistory(prev => [...prev, { prompt: p, imageUrl: '' }]);
    try {
      const res = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: p }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setHistory(prev => prev.map((h, i) => i === prev.length - 1 ? { ...h, imageUrl: data.imageUrl } : h));
      setCurrentImageUrl(data.imageUrl);
      loadSavedChats(); // refresh sidebar
    } catch (err: any) {
      setError(err.message || 'Generation failed');
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(14,165,233,0.15)' }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
          <Link href="/modes" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
            <HexLogo size={22} />
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', color: '#e2e8f0' }}>HEXFRAME</span>
          </Link>
          <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600 }}>⬡ Text to 3D</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          <p style={{ fontSize: 11, color: '#4b5563', padding: '8px 6px 4px', fontWeight: 600, letterSpacing: '0.08em' }}>PAST GENERATIONS</p>
          {savedChats.length === 0 ? (
            <p style={{ fontSize: 12, color: '#374151', textAlign: 'center', padding: '16px 8px' }}>No 3D generations yet</p>
          ) : savedChats.map((chat) => (
            <div key={chat._id} onClick={() => loadChat(chat._id)}
              style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, border: '1px solid transparent', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
              <span style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>⬡ {chat.title}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(14,165,233,0.1)' }}>
          <Link href="/modes" style={{ display: 'block', fontSize: 12, color: '#6b7280', textDecoration: 'none', marginBottom: 6 }}>← All Modes</Link>
          <Link href="/gallery" style={{ display: 'block', fontSize: 12, color: '#6b7280', textDecoration: 'none', marginBottom: 10 }}>🖼 Gallery</Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#0ea5e9' }}>@{user?.username}</span>
            <button onClick={() => { logout(); router.push('/'); }} style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,10,15,0.97)' }}>
          <span style={{ fontSize: 14, color: '#9ca3af', flex: 1 }}>Describe a 3D object to conjure</span>
          <span style={{ fontSize: 12, color: '#0ea5e9', padding: '3px 10px', borderRadius: 20, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>Text to 3D</span>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Chat */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
            <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {history.length === 0 && !generating && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60, textAlign: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 0 30px rgba(14,165,233,0.5)' }}>
                    <span style={{ fontSize: 26 }}>⬡</span>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #e2e8f0, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Conjure a 3D object</p>
                  <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 260, lineHeight: 1.7 }}>Type anything — a crystal sword, alien spaceship, glowing orb. Renders live in the 3D viewer.</p>
                </div>
              )}

              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ padding: '10px 16px', borderRadius: '18px 18px 4px 18px', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)', color: '#e2e8f0', fontSize: 14, maxWidth: 300 }}>
                      {h.prompt}
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: 13, fontWeight: 700 }}>
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  </div>

                  {h.imageUrl ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', fontSize: 14 }}>⬡</div>
                      <div onClick={() => setCurrentImageUrl(h.imageUrl)}
                        style={{ borderRadius: '18px 18px 18px 4px', overflow: 'hidden', border: currentImageUrl === h.imageUrl ? '2px solid #0ea5e9' : '1px solid rgba(14,165,233,0.2)', cursor: 'pointer', maxWidth: 260 }}>
                        <img src={h.imageUrl} alt={h.prompt} style={{ width: '100%', display: 'block' }} />
                        <div style={{ padding: '7px 12px', background: 'rgba(10,10,15,0.97)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: currentImageUrl === h.imageUrl ? '#0ea5e9' : '#4b5563' }}>
                            {currentImageUrl === h.imageUrl ? '⬡ Showing in 3D viewer →' : 'Click to view in 3D'}
                          </span>
                          <a href={h.imageUrl} download target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 11, color: '#0ea5e9', textDecoration: 'none', padding: '2px 6px', borderRadius: 6, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>↓</a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', fontSize: 14 }}>⬡</div>
                      <div style={{ padding: '14px 20px', borderRadius: '18px 18px 18px 4px', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {[0,1,2].map(j => <div key={j} className="animate-bounce" style={{ width: 7, height: 7, borderRadius: '50%', background: '#0ea5e9', animationDelay: `${j*0.15}s` }} />)}
                        </div>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Materializing 3D render... (10–30s)</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {error && <p style={{ textAlign: 'center', fontSize: 13, color: '#f87171' }}>{error}</p>}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* 3D Viewer */}
          <div style={{ width: 380, flexShrink: 0, borderLeft: '1px solid rgba(14,165,233,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(14,165,233,0.02)' }}>
            {currentImageUrl ? (
              <>
                <p style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, marginBottom: 16, letterSpacing: '0.1em' }}>⬡ LIVE 3D VIEWER</p>
                <canvas ref={canvasRef} style={{ borderRadius: 16, border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 0 40px rgba(14,165,233,0.15)', width: 320, height: 320, cursor: 'grab' }} />
                <p style={{ fontSize: 11, color: '#374151', marginTop: 12, textAlign: 'center' }}>🖱 Drag to rotate · Scroll to zoom</p>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>⬡</div>
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7 }}>3D viewer appears here<br />after first generation</p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px 20px', background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(14,165,233,0.1)', flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="A crystal sword with glowing runes, dark background..."
                disabled={generating}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 14 }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
              <button onClick={handleGenerate} disabled={generating || !prompt.trim()}
                style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 16, opacity: generating || !prompt.trim() ? 0.4 : 1 }}>
                {generating ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : '↑'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 6 }}>Generates a 3D-style render · Drag to rotate · Scroll to zoom</p>
          </div>
        </div>
      </div>
    </div>
  );
}