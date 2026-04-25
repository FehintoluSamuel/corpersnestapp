import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const STEPS = ['Pick your role', 'Your details', "You're in!"]

const ROLES = [
  {
    value: 'incoming_corper',
    label: 'Incoming Corper',
    desc: 'Freshly deployed and looking for a place to stay',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    value: 'outgoing_corper',
    label: 'Outgoing Corper',
    desc: 'Passing out soon and have a room to hand over',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
      </svg>
    ),
  },
  {
    value: 'landlord',
    label: 'Landlord',
    desc: 'Property owner looking to rent to corps members',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
        <path d="M3 21h18M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4"/>
      </svg>
    ),
  },
]

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    phone_no: '', nysc_state_code: '', batch_stream: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validateStep1 = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRoleSelect = (r) => {
    setRole(r)
    setStep(1)
  }

  const handleDetailsNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = { ...form, role }
      // Strip empty optional fields
      if (!payload.phone_no) delete payload.phone_no
      if (!payload.nysc_state_code) delete payload.nysc_state_code
      if (!payload.batch_stream) delete payload.batch_stream

      const user = await register(payload)
      toast.success(`Welcome, ${user.full_name.split(' ')[0]}! 🎉`)
      navigate('/listings')
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
          <span style={{ color: 'var(--text-primary)' }}>Nest</span>
        </span>
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all
              ${i < step ? 'bg-[var(--brand)] text-white'
              : i === step ? 'bg-[var(--brand)] text-white ring-4 ring-[var(--brand-light)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>
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

        {/* STEP 0 — Role selection */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1 text-center">Who are you?</h1>
            <p className="text-sm text-[var(--text-muted)] text-center mb-6">Pick the option that best describes you</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
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

        {/* STEP 1 — Details */}
        {step === 1 && (
          <div className="card p-6 animate-slide-up">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
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
              {(role === 'incoming_corper' || role === 'outgoing_corper') && (
                <>
                  <Input
                    label="NYSC State Code (optional)"
                    placeholder="e.g. AB/24A/1234"
                    value={form.nysc_state_code}
                    onChange={set('nysc_state_code')}
                  />
                  <Input
                    label="Batch & Stream (optional)"
                    placeholder="e.g. Batch B Stream 2"
                    value={form.batch_stream}
                    onChange={set('batch_stream')}
                  />
                </>
              )}
            </div>

            <Button fullWidth className="mt-6" onClick={handleDetailsNext}>
              Continue →
            </Button>
          </div>
        )}

        {/* STEP 2 — Confirm & submit */}
        {step === 2 && (
          <div className="card p-6 animate-slide-up text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.8">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Almost there!</h2>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              Creating account for <span className="font-medium text-[var(--text-primary)]">{form.full_name}</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-6">{form.email}</p>

            {role === 'landlord' && (
              <div className="text-left p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mb-5">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">⚠️ Landlord note</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Your account will be marked pending verification. An admin will review and activate your listings shortly.</p>
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