/**
 * pages/auth/Onboarding.jsx
 *
 * Shown immediately after registration.
 * PCMs: callup number + stream + camp start date
 * Landlords: LGA
 * All fields are optional — users can skip and complete later from profile.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const ABIA_LGAS = [
  'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
  'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa',
  'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West',
  'Umuahia North', 'Umuahia South', 'Umu Nneochi',
]

export default function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const toast    = useNavigate()
  const navigate = useNavigate()
  const toastCtx = useToast()

  const [loading, setLoading]   = useState(false)
  const [skipping, setSkipping] = useState(false)

  // PCM fields
  const [callupNumber,   setCallupNumber]   = useState('')
  const [stateCode,      setStateCode]      = useState('')
  const [stream,         setStream]         = useState('')
  const [campStartDate,  setCampStartDate]  = useState('')
  const [errors,         setErrors]         = useState({})

  // Landlord fields
  const [lga, setLga] = useState('')

  const isLandlord = user?.role === 'landlord'
  const isPcm      = user?.role === 'pcm'

  const validateCallup = (val) => {
    if (!val) return null
    const pattern = /^NYSC\/[A-Z]{2,5}\/\d{4}\/\d+$/i
    if (!pattern.test(val.trim())) return 'Format: NYSC/XXX/YYYY/NNNNNN'
    return null
  }

  const validateStateCode = (val) => {
    if (!val) return null
    const pattern = /^[A-Z]{2}\/\d{2}[ABC]\/\d+$/i
    if (!pattern.test(val.trim())) return 'Format: AB/25A/2008'
    return null
  }

  const handleSubmit = async () => {
    const errs = {}
    const callupErr = validateCallup(callupNumber)
    const stateErr  = validateStateCode(stateCode)
    if (callupErr) errs.callup_number   = callupErr
    if (stateErr)  errs.nysc_state_code = stateErr
    if (stream && !['1', '2'].includes(stream)) errs.stream = 'Stream must be 1 or 2'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      if (isLandlord && lga) {
        const updated = await authApi.updateLandlordProfile({ lga })
        updateUser(updated)
      }

      if (isPcm) {
        const payload = {}
        if (callupNumber.trim())  payload.callup_number   = callupNumber.trim().toUpperCase()
        if (stateCode.trim())     payload.nysc_state_code = stateCode.trim().toUpperCase()
        if (stream)               payload.stream          = parseInt(stream)
        if (campStartDate)        payload.camp_start_date = campStartDate

        if (Object.keys(payload).length > 0) {
          const updated = await authApi.updateProfile(payload)
          updateUser(updated)
        }
      }

      toastCtx.success('Profile set up! Welcome to CorpersNest.')
      navigate('/home', { replace: true })
    } catch (err) {
      toastCtx.error(err.message || 'Could not save profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setSkipping(true)
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg-page)' }}>

      {/* Logo mark */}
      <div className="w-12 h-12 rounded-2xl bg-[var(--brand)] flex items-center justify-center mb-6">
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
          <circle cx="9" cy="7.5" r="1.2" fill="white"/>
        </svg>
      </div>

      <div className="w-full max-w-md">
        <div className="card p-6 animate-slide-up">

          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {isLandlord ? 'Tell us about your property' : 'Set up your NYSC profile'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {isLandlord
              ? 'This helps corpers find listings in your area. You can update this anytime.'
              : 'This keeps your role accurate as you progress through service. All fields optional — you can finish later.'}
          </p>

          {/* ── PCM fields ── */}
          {isPcm && (
            <div className="flex flex-col gap-4">
              <div>
                <Input
                  label="Callup number (optional)"
                  placeholder="NYSC/FUA/2025/107449"
                  value={callupNumber}
                  onChange={e => setCallupNumber(e.target.value)}
                  error={errors.callup_number}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Found on your NYSC call-up letter
                </p>
              </div>

              <div>
                <Input
                  label="State code (optional)"
                  placeholder="AB/25A/2008"
                  value={stateCode}
                  onChange={e => setStateCode(e.target.value)}
                  error={errors.nysc_state_code}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Unlocks your full corper role and listing access
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5"
                    style={{ color: 'var(--text-primary)' }}>
                    Stream (optional)
                  </label>
                  <div className="flex gap-2">
                    {['1', '2'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStream(stream === s ? '' : s)}
                        className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                        style={{
                          background:   stream === s ? 'var(--brand)' : 'var(--bg-subtle)',
                          color:        stream === s ? 'white' : 'var(--text-secondary)',
                          borderColor:  stream === s ? 'var(--brand)' : 'var(--border)',
                        }}
                      >
                        Stream {s}
                      </button>
                    ))}
                  </div>
                  {errors.stream && (
                    <p className="text-xs text-red-500 mt-1">{errors.stream}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Camp start date (optional)"
                    type="date"
                    value={campStartDate}
                    onChange={e => setCampStartDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Landlord fields ── */}
          {isLandlord && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5"
                  style={{ color: 'var(--text-primary)' }}>
                  LGA your property is in (optional)
                </label>
                <select
                  value={lga}
                  onChange={e => setLga(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border transition-colors"
                  style={{
                    background:  'var(--bg-subtle)',
                    borderColor: 'var(--border)',
                    color:       'var(--text-primary)',
                  }}
                >
                  <option value="">Select LGA</option>
                  {ABIA_LGAS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Pending verification notice */}
              <div className="p-3 rounded-xl"
                style={{ background: '#FFFBEB', border: '1px solid #D97706' }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#92400E' }}>
                  Your account is pending verification
                </p>
                <p className="text-xs" style={{ color: '#B45309' }}>
                  An admin will review your registration and activate your account.
                  You can still browse the app while you wait.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-6">
            <Button fullWidth loading={loading} onClick={handleSubmit}>
              {isLandlord ? 'Save and continue' : 'Save and go to app'}
            </Button>
            <button
              onClick={handleSkip}
              disabled={skipping}
              className="text-sm py-2 transition-colors hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              Skip for now — I'll finish later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}