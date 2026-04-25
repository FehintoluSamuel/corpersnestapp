import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/listings'

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
      setErrors({ password: 'Invalid email or password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-page)' }}>

      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-[var(--brand)] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
            <circle cx="9" cy="7.5" r="1.2" fill="white"/>
          </svg>
        </div>
        <span className="font-semibold text-lg">
          <span style={{ color: 'var(--brand)' }}>Corper</span>
          <span style={{ color: 'var(--text-primary)' }}>Nest</span>
        </span>
      </Link>

      <div className="card p-6 w-full max-w-md animate-slide-up">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Log in to your CorperNest account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="ada@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth loading={loading} className="mt-2">
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--brand)] font-medium hover:underline">
            Join CorperNest
          </Link>
        </p>
      </div>
    </div>
  )
}