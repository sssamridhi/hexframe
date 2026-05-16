'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

interface Chat {
  _id: string;
  title: string;
  mode: string;
  updatedAt: string;
}

interface FullChat extends Chat {
  messages: Message[];
}

const HexLogo = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
      fill="none" stroke="#7c3aed" strokeWidth="3"
      style={{ filter: 'drop-shadow(0 0 6px #7c3aed)' }} />
    <circle cx="50" cy="50" r="8" fill="#7c3aed" />
  </svg>
);

export default function Dashboard() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<FullChat | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (token) loadChats();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, generating]);

  const loadChats = async () => {
    const res = await fetch('/api/chats?mode=text-to-image', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.chats) {
      setChats(data.chats);
      if (data.chats.length > 0 && !activeChatId) {
        setActiveChatId(data.chats[0]._id);
      }
    }
  };

  const loadChat = async (chatId: string) => {
    const res = await fetch(`/api/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.chat) setActiveChat(data.chat);
  };

  useEffect(() => {
    if (activeChatId && token) loadChat(activeChatId);
  }, [activeChatId]);

  const newChat = async () => {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mode: 'text-to-image' }),
    });
    const data = await res.json();
    if (data.chat) {
      setChats(prev => [data.chat, ...prev]);
      setActiveChatId(data.chat._id);
      setActiveChat({ ...data.chat, messages: [] });
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/chats/${chatId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setChats(prev => prev.filter(c => c._id !== chatId));
    if (activeChatId === chatId) {
      const remaining = chats.filter(c => c._id !== chatId);
      if (remaining.length > 0) { setActiveChatId(remaining[0]._id); }
      else { setActiveChatId(null); setActiveChat(null); }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating || !activeChatId) return;
    setGenerating(true);
    setError('');
    const currentPrompt = prompt;
    setPrompt('');

    const userMsg: Message = { role: 'user', content: currentPrompt, type: 'text', createdAt: new Date().toISOString() };
    setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, userMsg] } : prev);

    try {
      const res = await fetch(`/api/chats/${activeChatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: currentPrompt, referenceImageUrl: referenceImage }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      const aiMsg: Message = { role: 'assistant', content: data.imageUrl, type: 'image', createdAt: new Date().toISOString() };
      setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, aiMsg], title: data.chatTitle } : prev);
      setChats(prev => prev.map(c => c._id === activeChatId ? { ...c, title: data.chatTitle } : c));
      setReferenceImage(null);
    } catch {
      setError('Generation failed');
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

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
            <Link href="/modes" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 14 }}>
              <HexLogo size={22} />
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', color: '#e2e8f0' }}>HEXFRAME</span>
            </Link>
            <button onClick={newChat} style={{
              width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(124,58,237,0.3)',
              background: 'rgba(124,58,237,0.08)', color: '#a855f7', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              + New Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {chats.length === 0 ? (
              <p style={{ fontSize: 12, color: '#4b5563', textAlign: 'center', padding: '20px 0' }}>No chats yet</p>
            ) : chats.map(chat => (
              <div key={chat._id} onClick={() => setActiveChatId(chat._id)}
                style={{
                  padding: '9px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: activeChatId === chat._id ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: activeChatId === chat._id ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (activeChatId !== chat._id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (activeChatId !== chat._id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 13, color: activeChatId === chat._id ? '#e2e8f0' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {chat.title}
                </span>
                <button onClick={(e) => deleteChat(chat._id, e)}
                  style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0, marginLeft: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(124,58,237,0.1)' }}>
            <Link href="/gallery" style={{ display: 'block', fontSize: 12, color: '#6b7280', textDecoration: 'none', marginBottom: 8 }}>🖼 Gallery</Link>
            <Link href="/modes" style={{ display: 'block', fontSize: 12, color: '#6b7280', textDecoration: 'none', marginBottom: 8 }}>⬡ All Modes</Link>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 12, color: '#7c3aed' }}>@{user?.username}</span>
              <button onClick={() => { logout(); router.push('/'); }}
                style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,10,15,0.97)', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18, padding: '2px 6px', borderRadius: 6 }}>
            ☰
          </button>
          <span style={{ fontSize: 14, color: '#9ca3af', flex: 1 }}>
            {activeChat?.title || 'Text to Image'}
          </span>
          <span style={{ fontSize: 12, color: '#7c3aed', padding: '3px 10px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            Text to Image
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {!activeChat || activeChat.messages.length === 0 && !generating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, textAlign: 'center', gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}>
                  <HexLogo size={30} />
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg, #e2e8f0, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {chats.length === 0 ? 'Start your first creation' : 'New canvas'}
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    Type a prompt below. You can reference a previous image by clicking it.
                  </p>
                </div>
              </div>
            ) : (
              activeChat?.messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 10 }}>
                      <div style={{ padding: '10px 16px', borderRadius: '18px 18px 4px 18px', background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)', color: '#e2e8f0', fontSize: 14, lineHeight: 1.5, maxWidth: 400 }}>
                        {msg.content}
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', fontSize: 13, fontWeight: 700 }}>
                        {user?.username?.[0]?.toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
                        <HexLogo size={18} />
                      </div>
                      <div
                        onClick={() => setReferenceImage(msg.content)}
                        style={{
                          borderRadius: '18px 18px 18px 4px', overflow: 'hidden',
                          border: referenceImage === msg.content ? '2px solid #7c3aed' : '1px solid rgba(124,58,237,0.2)',
                          boxShadow: referenceImage === msg.content ? '0 0 20px rgba(124,58,237,0.5)' : '0 8px 32px rgba(0,0,0,0.5)',
                          maxWidth: 340, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        title="Click to reference this image in your next prompt"
                      >
                        <img src={msg.content} alt="generated" style={{ width: '100%', display: 'block' }} loading="lazy" />
                        <div style={{ padding: '7px 12px', background: 'rgba(10,10,15,0.97)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: referenceImage === msg.content ? '#a855f7' : '#4b5563' }}>
                            {referenceImage === msg.content ? '✦ Selected as reference' : 'Click to use as reference'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#6d28d9' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <a href={msg.content} download target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize: 11, color: '#7c3aed', textDecoration: 'none', padding: '2px 6px', borderRadius: 6, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                              ↓ Save
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {generating && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <HexLogo size={18} />
                </div>
                <div style={{ padding: '14px 20px', borderRadius: '18px 18px 18px 4px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="animate-bounce" style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Conjuring... (10–30s)</span>
                </div>
              </div>
            )}

            {error && <p style={{ textAlign: 'center', fontSize: 13, color: '#f87171' }}>{error}</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        {referenceImage && (
          <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', padding: '0 20px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <img src={referenceImage} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
              <span style={{ fontSize: 12, color: '#a855f7', flex: 1 }}>Referencing previous image in next generation</span>
              <button onClick={() => setReferenceImage(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 20px 20px', background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(124,58,237,0.1)', flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            {!activeChatId && (
              <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
                Click "+ New Chat" to start
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={activeChatId ? "Describe what you want to conjure..." : "Create a new chat to start..."}
                disabled={generating || !activeChatId}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 14 }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
              <button onClick={handleGenerate} disabled={generating || !prompt.trim() || !activeChatId}
                style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 16, opacity: generating || !prompt.trim() || !activeChatId ? 0.4 : 1 }}>
                {generating ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : '↑'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 6 }}>
              Click any generated image to use it as a reference for your next prompt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}