/**
 * pages/messages/ConversationPage.jsx — real-time chat thread
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { messagesApi, authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { socket } from '@/lib/socket'
import { formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

export default function ConversationPage() {
  const { userId }           = useParams()
  const { user }             = useAuth()
  const bottomRef            = useRef(null)

  const [messages,  setMessages]  = useState([])
  const [other,     setOther]     = useState(null)
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)

  // Load history + other user profile
  useEffect(() => {
    Promise.all([
      messagesApi.getMessages(userId),
      authApi.getPublicUser(userId),
    ])
      .then(([msgs, profile]) => { setMessages(msgs); setOther(profile) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  // Listen for incoming messages on this conversation
  useEffect(() => {
    const handler = ({ message }) => {
      const isThisConv =
        (message.sender_id === parseInt(userId) && message.sender_id !== user?.id) ||
        (message.sender_id === user?.id)
      if (isThisConv) {
        setMessages(prev => {
          // avoid duplicates (delivered receipt arrives too)
          if (prev.find(m => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    }
    socket.on('message',   handler)
    socket.on('delivered', handler)
    return () => { socket.off('message', handler); socket.off('delivered', handler) }
  }, [userId, user?.id])

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)

    // Optimistic message
    const optimistic = {
      id:         Date.now(),
      sender_id:  user.id,
      content,
      created_at: new Date().toISOString(),
      optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      // Send via WebSocket (preferred)
      socket.send({ type: 'message', recipient_id: parseInt(userId), content })
    } catch {
      // Fallback to REST
      try {
        const msg = await messagesApi.send(userId, { content })
        setMessages(prev => prev.map(m => m.optimistic ? msg : m))
      } catch {
        // Remove optimistic on failure
        setMessages(prev => prev.filter(m => !m.optimistic))
        setText(content)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  )

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-page)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <Link to="/messages" className="transition-colors hover:text-[var(--text-primary)]"
          style={{ color: 'var(--text-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <Link to={`/users/${userId}`} className="flex items-center gap-2.5 hover:opacity-80">
          <Avatar name={other?.full_name} src={other?.profile_picture_url} size="sm" />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {other?.full_name}
            </p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
              {other?.role?.replace(/_/g, ' ')}
            </p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
            Say hello to {other?.full_name?.split(' ')[0]}!
          </p>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === user?.id
          return (
            <div key={msg.id ?? i}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMine && (
                <Avatar name={other?.full_name} src={other?.profile_picture_url} size="xs" />
              )}
              <div className="max-w-[72%]">
                <div
                  className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMine ? 'var(--brand)' : 'var(--bg-subtle)',
                    color:      isMine ? 'white' : 'var(--text-primary)',
                    opacity:    msg.optimistic ? 0.7 : 1,
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius:  isMine ? 16 : 4,
                  }}
                >
                  {msg.content}
                </div>
                <p className={`text-xs mt-0.5 ${isMine ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--text-muted)' }}>
                  {msg.created_at ? formatDate(msg.created_at) : ''}
                  {isMine && !msg.optimistic && (
                    <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex items-center gap-3"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <Avatar name={user?.full_name} src={user?.profile_picture_url} size="xs" />
        <input
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="input-base flex-1 text-sm"
          autoFocus
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
          style={{ background: 'var(--brand)', color: 'white' }}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}