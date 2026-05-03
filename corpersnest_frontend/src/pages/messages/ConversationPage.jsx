/**
 * pages/messages/ConversationPage.jsx — with image upload support
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { messagesApi, authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { socket } from '@/lib/socket'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function ConversationPage() {
  const { userId } = useParams()
  const { user }   = useAuth()
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const fileRef    = useRef(null)

  const [messages,     setMessages]     = useState([])
  const [other,        setOther]        = useState(null)
  const [text,         setText]         = useState('')
  const [loading,      setLoading]      = useState(true)
  const [sending,      setSending]      = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [imageUrl,     setImageUrl]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    Promise.all([messagesApi.getMessages(userId), authApi.getPublicUser(userId)])
      .then(([msgs, profile]) => { setMessages(msgs || []); setOther(profile) })
      .catch(e => setError(e.message || 'Could not load conversation'))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    const handler = ({ message }) => {
      const mine      = message.sender_id === user?.id
      const fromOther = message.sender_id === parseInt(userId)
      if (mine || fromOther)
        setMessages(prev => prev.find(m => m.id === message.id) ? prev : [...prev, message])
    }
    socket.on('message',   handler)
    socket.on('delivered', handler)
    return () => { socket.off('message', handler); socket.off('delivered', handler) }
  }, [userId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImagePick = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', UPLOAD_PRESET)
      fd.append('folder', 'corpersnest/messages')
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      const d = await r.json()
      setImageUrl(d.secure_url)
    } catch {
      setImagePreview(null); setImageUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setImageUrl(null); setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSend = async () => {
    const content = text.trim()
    if ((!content && !imageUrl) || sending || uploading) return
    setText('')
    const sentImageUrl = imageUrl
    clearImage()
    setSending(true)
    const optimistic = {
      id: `opt-${Date.now()}`, sender_id: user.id,
      content: content || '', image_url: sentImageUrl,
      created_at: new Date().toISOString(), optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])
    try {
      if (socket.connected) {
        socket.send({ type: 'message', recipient_id: parseInt(userId), content: content || '', image_url: sentImageUrl })
      } else {
        const msg = await messagesApi.send(userId, { content: content || '', image_url: sentImageUrl })
        setMessages(prev => prev.map(m => m.optimistic ? msg : m))
      }
    } catch {
      setMessages(prev => prev.filter(m => !m.optimistic))
      setText(content); setImageUrl(sentImageUrl)
    } finally {
      setSending(false); inputRef.current?.focus()
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
      <Link to="/messages" className="text-sm text-[var(--brand)] hover:underline">← Back</Link>
    </div>
  )

  return (
    /* 56px = navbar height (h-14). This gives the remaining viewport to the chat. */
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 56px)', background: 'var(--bg-page)', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <Link to="/messages" className="hover:text-[var(--text-primary)] transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <Link to={`/users/${userId}`} className="flex items-center gap-2.5 hover:opacity-80">
          <Avatar name={other?.full_name} src={other?.profile_picture_url} size="sm" />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{other?.full_name}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{other?.role?.replace(/_/g, ' ')}</p>
          </div>
        </Link>
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
            Say hello to {other?.full_name?.split(' ')[0]}!
          </p>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === user?.id
          return (
            <div key={msg.id ?? i} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMine && <Avatar name={other?.full_name} src={other?.profile_picture_url} size="xs" />}
              <div className="max-w-[72%]">
                {(msg.content || msg.image_url) && (
                  <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isMine ? 'var(--brand)' : 'var(--bg-subtle)',
                      color: isMine ? 'white' : 'var(--text-primary)',
                      opacity: msg.optimistic ? 0.7 : 1,
                      borderBottomRightRadius: isMine ? 4 : 16,
                      borderBottomLeftRadius:  isMine ? 16 : 4,
                    }}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.image_url && (
                      <img src={msg.image_url} alt="attachment"
                        className="rounded-xl max-w-full max-h-48 object-cover"
                        style={{ marginTop: msg.content ? 6 : 0 }}
                        onError={e => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                )}
                <p className={`text-xs mt-0.5 ${isMine ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--text-muted)' }}>
                  {msg.created_at ? formatDate(msg.created_at) : ''}
                  {isMine && !msg.optimistic && <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 shrink-0 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div className="relative">
            <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-xl object-cover" />
            {uploading && (
              <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                <Spinner size="sm" />
              </div>
            )}
          </div>
          <button onClick={clearImage} className="text-xs hover:text-red-500 transition-colors"
            style={{ color: 'var(--text-muted)' }}>Remove</button>
        </div>
      )}

      {/* Input bar — always pinned at bottom */}
      <div className="shrink-0 px-4 py-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--bg-subtle)]"
          style={{ color: 'var(--text-muted)' }} aria-label="Attach image">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

        <Avatar name={user?.full_name} src={user?.profile_picture_url} size="xs" />

        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          className="input-base flex-1 text-sm"
          style={{ minWidth: 0 }}
        />

        <button onClick={handleSend}
          disabled={(!text.trim() && !imageUrl) || sending || uploading}
          aria-label="Send"
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: 'var(--brand)', color: 'white' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}