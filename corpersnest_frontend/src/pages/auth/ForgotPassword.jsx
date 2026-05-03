// ─── pages/auth/ForgotPassword.jsx ───────────────────────────────────────────
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

export function ForgotPasswordPage() {
  const toast = useToast()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      const r = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d?.detail || 'Request failed')
      }
      setSent(true)
      toast.success('Reset link sent — check your email')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-page)' }}>
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
            <circle cx="9" cy="7.5" r="1.2" fill="white"/>
          </svg>
        </div>
        <span className="font-semibold text-base">
          <span style={{ color: 'var(--brand)' }}>Corpers</span>
          <span style={{ color: 'var(--text-primary)' }}>Nest</span>
        </span>
      </Link>

      <div className="card p-6 w-full max-w-md animate-slide-up">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--brand-light)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="text-sm text-[var(--brand)] hover:underline">Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Forgot password?</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Enter your email and we'll send you a reset link.
            </p>
            <div className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="ada@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
              <Button fullWidth loading={loading} onClick={handleSubmit}>
                Send reset link
              </Button>
            </div>
            <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
              <Link to="/login" className="text-[var(--brand)] hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}


