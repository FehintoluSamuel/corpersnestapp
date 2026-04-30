/**
 * pages/admin/AdminLandlords.jsx
 *
 * Lists landlords pending verification.
 * Admin can approve or reject with an optional note.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import PageWrapper from '@/components/layout/PageWrapper'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Avatar from '@/components/ui/Avatar'

export default function AdminLandlords() {
  const toast = useToast()
  const [landlords, setLandlords] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [acting,    setActing]     = useState({})   // { [userId]: 'approve' | 'reject' }
  const [notes,     setNotes]      = useState({})   // { [userId]: string }
  const [showNote,  setShowNote]   = useState({})   // { [userId]: boolean }

  useEffect(() => {
    adminApi.getPendingLandlords()
      .then(setLandlords)
      .catch(() => toast.error('Failed to load landlords'))
      .finally(() => setLoading(false))
  }, [])

  const handle = async (userId, approve) => {
    setActing(p => ({ ...p, [userId]: approve ? 'approve' : 'reject' }))
    try {
      await adminApi.verifyLandlord(userId, { approve, note: notes[userId] || null })
      setLandlords(prev => prev.filter(l => l.user_id !== userId))
      toast.success(approve ? 'Landlord approved' : 'Landlord rejected')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActing(p => { const n = { ...p }; delete n[userId]; return n })
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="text-sm hover:text-[var(--text-primary)] transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            ← Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Landlord Verification Queue
          </h1>
        </div>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {!loading && landlords.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No pending verifications.
            </p>
          </div>
        )}

        {!loading && landlords.length > 0 && (
          <div className="flex flex-col gap-4">
            {landlords.map(l => (
              <div key={l.user_id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={l.full_name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {l.full_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {l.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #D97706' }}>
                    Pending
                  </span>
                </div>

                <div className="flex gap-4 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  {l.phone_no && <span>📞 {l.phone_no}</span>}
                  {l.lga      && <span>📍 {l.lga}</span>}
                  {l.joined   && <span>Joined {new Date(l.joined).toLocaleDateString('en-NG')}</span>}
                </div>

                {/* Optional note */}
                {showNote[l.user_id] && (
                  <textarea
                    rows={2}
                    placeholder="Add a note (optional — shown to landlord on rejection)"
                    value={notes[l.user_id] || ''}
                    onChange={e => setNotes(p => ({ ...p, [l.user_id]: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border mb-3 resize-none"
                    style={{
                      background:  'var(--bg-subtle)',
                      borderColor: 'var(--border)',
                      color:       'var(--text-primary)',
                    }}
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={acting[l.user_id] === 'approve'}
                    disabled={!!acting[l.user_id]}
                    onClick={() => handle(l.user_id, true)}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={acting[l.user_id] === 'reject'}
                    disabled={!!acting[l.user_id]}
                    onClick={() => handle(l.user_id, false)}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                  <button
                    onClick={() => setShowNote(p => ({ ...p, [l.user_id]: !p[l.user_id] }))}
                    className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:border-[var(--brand)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    {showNote[l.user_id] ? 'Hide note' : 'Add note'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}