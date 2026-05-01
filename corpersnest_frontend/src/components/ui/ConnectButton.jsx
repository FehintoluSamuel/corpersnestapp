/**
 * components/ui/ConnectButton.jsx
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { connectionsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'

export default function ConnectButton({ userId, userName }) {
  const { user } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()

  const [status,       setStatus]       = useState('loading')
  const [connectionId, setConnectionId] = useState(null)
  const [acting,       setActing]       = useState(false)

  useEffect(() => {
    if (!user || user.id === userId) return
    connectionsApi.getStatus(userId)
      .then(d => {
        setConnectionId(d.connection_id)
        if      (d.status === 'none')     setStatus('none')
        else if (d.status === 'accepted') setStatus('accepted')
        else if (d.status === 'pending')  setStatus(d.is_requester ? 'pending_sent' : 'pending_received')
        else                              setStatus('none')
      })
      .catch(() => setStatus('none'))
  }, [userId, user])

  if (!user || user.id === userId || status === 'loading') return null

  const act = async (fn, next) => {
    setActing(true)
    try { const r = await fn(); setConnectionId(r?.id ?? connectionId); setStatus(next) }
    catch (err) { toast.error(err.message) }
    finally { setActing(false) }
  }

  if (status === 'accepted') return (
    <Button size="sm" onClick={() => navigate(`/messages/${userId}`)}>
      <MsgIcon /> Message {userName?.split(' ')[0]}
    </Button>
  )

  if (status === 'pending_sent') return (
    <Button size="sm" variant="ghost" loading={acting}
      onClick={() => act(() => connectionsApi.remove(connectionId), 'none')}>
      Cancel request
    </Button>
  )

  if (status === 'pending_received') return (
    <div className="flex gap-2">
      <Button size="sm" loading={acting}
        onClick={() => act(() => connectionsApi.accept(connectionId), 'accepted')}>
        Accept
      </Button>
      <Button size="sm" variant="ghost" loading={acting}
        onClick={() => act(() => connectionsApi.reject(connectionId), 'none')}>
        Decline
      </Button>
    </div>
  )

  return (
    <Button size="sm" variant="ghost" loading={acting}
      onClick={() => act(() => connectionsApi.sendRequest(userId), 'pending_sent')}>
      <ConnIcon /> Connect
    </Button>
  )
}

function ConnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  )
}

function MsgIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )
}