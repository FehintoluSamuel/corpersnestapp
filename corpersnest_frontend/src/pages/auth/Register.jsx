/**
 * pages/auth/Register.jsx
 *
 * Minimal registration — name, email, password, role (PCM or Landlord).
 * After registration, redirects to /onboarding for NYSC details.
 * Keeps the existing 3-step UI pattern the user already has.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const STEPS = ['Pick your role', 'Your details', "You're in!"]

const ROLES = [
  {
    value: 'pcm',
    label: 'Corp Member (PCM)',
    desc:  'Prospective or active NYSC corp member',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    value: 'landlord',
    label: 'Landlord',
    desc:  'Property owner looking to rent to corp members',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
        <path d="M3 21h18M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/>
      </svg>
    ),
  },
]

export default function RegisterPage() {
  const [step, setStep]     = useState(0)
  const [role, setRole]     = useState('')
  const [form, setForm]     = useState({ full_name: '', email: '', password: '', phone_no: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const toast        = useToast()
  const navigate     = useNavigate()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim())                              errs.full_name = 'Full name is required'
    if (!form.email.trim())                                  errs.email     = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email   = 'Enter a valid email'
    if (!form.password || form.password.length < 6)          errs.password  = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRoleSelect = (r) => {
    setRole(r)
    setStep(1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = { full_name: form.full_name, email: form.email, password: form.password, role }
      if (form.phone_no.trim()) payload.phone_no = form.phone_no.trim()

      const user = await register(payload)
      toast.success(`Welcome, ${user.full_name.split(' ')[0]}!`)

      // Always go to onboarding — it handles both PCM and landlord setup
      navigate('/onboarding', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg-page)' }}>

      {/* Logo */}
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
          <span style={{ color: 'var(--text-primary)' }}>sNest</span>
        </span>
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all
              ${i < step
                ? 'bg-[var(--brand)] text-white'
                : i === step
                  ? 'bg-[var(--brand)] text-white ring-4 ring-[var(--brand-light)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}
            >
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 transition-all ${i < step ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`}/>
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">

        {/* STEP 0 — Role */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1 text-center">Who are you?</h1>
            <p className="text-sm text-[var(--text-muted)] text-center mb-6">
              Pick the option that describes you
            </p>
            <div className="flex flex-col gap-3">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => handleRoleSelect(r.value)}
                  className="card p-4 flex items-center gap-4 text-left hover:border-[var(--brand)] hover:shadow-[0_0_0_1px_var(--brand)] transition-all duration-150 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-subtle)] group-hover:bg-[var(--brand-light)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-all shrink-0">
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--text-primary)] text-sm">{r.label}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{r.desc}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    stroke="var(--text-muted)" strokeWidth="1.5">
                    <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--brand)] font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* STEP 1 — Basic details */}
        {step === 1 && (
          <div className="card p-6 animate-slide-up">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Your details</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Registering as{' '}
              <span className="font-medium text-[var(--brand)]">
                {ROLES.find(r => r.value === role)?.label}
              </span>
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label="Full name"
                placeholder="Ada Okafor"
                value={form.full_name}
                onChange={set('full_name')}
                error={errors.full_name}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                placeholder="ada@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoComplete="new-password"
              />
              <Input
                label="Phone number (optional)"
                type="tel"
                placeholder="08012345678"
                value={form.phone_no}
                onChange={set('phone_no')}
              />
            </div>

            <Button
              fullWidth
              className="mt-6"
              onClick={() => { if (validate()) setStep(2) }}
            >
              Continue →
            </Button>
          </div>
        )}

        {/* STEP 2 — Confirm */}
        {step === 2 && (
          <div className="card p-6 animate-slide-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="var(--brand)" strokeWidth="1.8">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Almost there!</h2>
            <p className="text-sm text-[var(--text-muted)] mb-1">
              Creating account for{' '}
              <span className="font-medium text-[var(--text-primary)]">{form.full_name}</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-6">{form.email}</p>

            {role === 'landlord' && (
              <div className="text-left p-3 rounded-xl mb-5"
                style={{ background: '#FFFBEB', border: '1px solid #D97706' }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#92400E' }}>
                  Landlord accounts require verification
                </p>
                <p className="text-xs" style={{ color: '#B45309' }}>
                  An admin will review and activate your account before you can post listings.
                  We'll let you know once you're approved.
                </p>
              </div>
            )}

            {role === 'pcm' && (
              <div className="text-left p-3 rounded-xl mb-5"
                style={{ background: 'var(--brand-light)', border: '1px solid var(--brand)' }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--brand-dark)' }}>
                  Next: set up your NYSC profile
                </p>
                <p className="text-xs" style={{ color: 'var(--brand)' }}>
                  After joining, we'll ask for your callup number and state code
                  to unlock full access.
                </p>
              </div>
            )}

            <Button fullWidth loading={loading} onClick={handleSubmit}>
              Create my account
            </Button>
            <button
              onClick={() => setStep(1)}
              className="mt-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← Edit details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}