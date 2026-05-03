// ─── pages/auth/ResetPassword.jsx ────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export function ResetPasswordPage() {
  const toast      = useToast()
  const navigate   = useNavigate()
  const [params]   = useSearchParams()
  const token      = params.get('token') || ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})

  const validate = () => {
    const e = {}
    if (password.length < 6)       e.password = 'Password must be at least 6 characters'
    if (password !== confirm)       e.confirm  = 'Passwords do not match'
    if (!token)                     e.token    = 'Invalid or missing reset token'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const r = await fetch(`${BASE_URL}/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, new_password: password }),
      })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d?.detail || 'Reset failed')
      }
      toast.success('Password reset! Please log in.')
      navigate('/login')
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
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Set new password</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Choose a strong password for your account.</p>

        {errors.token && (
          <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: '#FEF2F2', color: '#DC2626' }}>
            {errors.token} — <Link to="/forgot-password" className="underline">request a new link</Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            autoFocus
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={errors.confirm}
          />
          <Button fullWidth loading={loading} onClick={handleSubmit}>
            Reset password
          </Button>
        </div>
      </div>
    </div>
  )
}