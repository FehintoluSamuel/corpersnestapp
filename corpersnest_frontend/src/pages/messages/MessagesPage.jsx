/**
 * pages/messages/MessagesPage.jsx — inbox
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { messagesApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { socket } from '@/lib/socket'
import { formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'

export default function MessagesPage() {
  const { user }             = useAuth()
  const [convs,    setConvs] = useState([])
  const [loading,  setLoading] = useState(true)

  useEffect(() => {
    messagesApi.getInbox()
      .then(setConvs)
      .catch(() => {})
      .finally(() => setLoading(false))

    // Update inbox when a new message arrives
    const handler = ({ message }) => {
      setConvs(prev => prev.map(c =>
        c.id === message.conversation_id
          ? { ...c, last_message: message.content, last_message_at: message.created_at,
              unread_count: message.sender_id !== user?.id ? (c.unread_count || 0) + 1 : c.unread_count }
          : c
      ))
    }
    socket.on('message', handler)
    return () => socket.off('message', handler)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  )

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">
        <h1 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Messages
        </h1>

        {convs.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No conversations yet. Connect with someone to start messaging.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {convs.map(conv => (
            <Link key={conv.id} to={`/messages/${conv.other_user?.id}`}
              className="card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-card-hover)] transition-all">
              <div className="relative shrink-0">
                <Avatar name={conv.other_user?.full_name}
                  src={conv.other_user?.profile_picture_url} size="md" />
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ background: 'var(--brand)' }}>
                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-primary)', fontWeight: conv.unread_count > 0 ? 700 : 600 }}>
                    {conv.other_user?.full_name}
                  </p>
                  <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                    {conv.last_message_at ? formatDate(conv.last_message_at) : ''}
                  </span>
                </div>
                <p className="text-xs truncate"
                  style={{ color: conv.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {conv.last_message || 'No messages yet'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}