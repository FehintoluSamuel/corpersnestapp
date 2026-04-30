/**
 * pages/admin/AdminReports.jsx
 *
 * Lists all submitted reports. Admin can resolve with an optional note.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

const STATUS_OPTIONS = ['', 'open', 'reviewed', 'resolved']

const STATUS_STYLES = {
  open:     { bg: '#FEF2F2', color: '#DC2626' },
  reviewed: { bg: '#FFFBEB', color: '#D97706' },
  resolved: { bg: '#ECFDF5', color: '#008751' },
}

export default function AdminReports() {
  const toast = useToast()
  const [reports,      setReports]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [statusFilter, setStatusFilter] = useState('open')
  const [resolving,    setResolving]    = useState({})
  const [notes,        setNotes]        = useState({})
  const [showNote,     setShowNote]     = useState({})

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getReports(statusFilter)
      .then(setReports)
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const handleResolve = async (reportId) => {
    setResolving(p => ({ ...p, [reportId]: true }))
    try {
      await adminApi.resolveReport(reportId, { resolution_note: notes[reportId] || null })
      setReports(prev => prev.filter(r => r.id !== reportId))
      toast.success('Report resolved')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setResolving(p => { const n = { ...p }; delete n[reportId]; return n })
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/admin" className="text-sm transition-colors hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-muted)' }}>
            ← Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Reports Queue
          </h1>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {STATUS_OPTIONS.map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                background:  statusFilter === s ? 'var(--brand)' : 'var(--bg-subtle)',
                color:       statusFilter === s ? 'white' : 'var(--text-muted)',
                borderColor: statusFilter === s ? 'var(--brand)' : 'var(--border)',
              }}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {!loading && reports.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No {statusFilter || ''} reports.
            </p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="flex flex-col gap-4">
            {reports.map(r => {
              const s = STATUS_STYLES[r.status] || STATUS_STYLES.open
              return (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {r.report_type === 'listing' ? 'Listing report' : 'User report'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        By {r.reporter_name} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 capitalize"
                      style={{ background: s.bg, color: s.color }}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-sm mb-3 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}>
                    "{r.reason}"
                  </p>

                  <div className="flex gap-4 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    {r.reported_user && (
                      <Link to={`/users/${r.reported_user_id}`}
                        className="hover:text-[var(--brand)] transition-colors">
                        Reported user: {r.reported_user}
                      </Link>
                    )}
                    {r.listing_id && (
                      <Link to={`/listings/${r.listing_id}`}
                        className="hover:text-[var(--brand)] transition-colors">
                        View listing →
                      </Link>
                    )}
                  </div>

                  {r.status !== 'resolved' && (
                    <>
                      {showNote[r.id] && (
                        <textarea rows={2}
                          placeholder="Resolution note (optional)"
                          value={notes[r.id] || ''}
                          onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))}
                          className="w-full text-xs px-3 py-2 rounded-xl border mb-3 resize-none"
                          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" loading={!!resolving[r.id]}
                          onClick={() => handleResolve(r.id)}>
                          Mark resolved
                        </Button>
                        <button
                          onClick={() => setShowNote(p => ({ ...p, [r.id]: !p[r.id] }))}
                          className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:border-[var(--brand)]"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                          {showNote[r.id] ? 'Hide note' : 'Add note'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}