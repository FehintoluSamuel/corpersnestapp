import { useState } from 'react'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

const TAGS = [
  {
    value: 'question',
    label: 'Question',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
      </svg>
    )
  },
  {
    value: 'tip',
    label: 'Tip',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="6"/>
        <path d="M12 6a6 6 0 016 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 016-6z"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
        <line x1="10" y1="18" x2="14" y2="18"/>
      </svg>
    )
  },
  {
    value: 'room_available',
    label: 'Room available',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
      </svg>
    )
  },
  {
    value: 'roommate_needed',
    label: 'Roommate needed',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    )
  },
  {
    value: 'scam_warning',
    label: 'Scam warning',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  },
  {
    value: 'general',
    label: 'General',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    )
  },
]

export default function PostForm({ onCreated }) {
  const { user } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('general')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) { toast.info('Write something first'); return }
    setLoading(true)
    try {
      const payload = { content: content.trim(), tag }
      if (imageUrl.trim()) payload.image_url = imageUrl.trim()
      const post = await feedApi.create(payload)
      onCreated?.(post)
      setContent('')
      setTag('general')
      setImageUrl('')
      setOpen(false)
      toast.success('Post shared!')
    } catch (err) {
      toast.error(err.message || 'Could not post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-4 mb-4">
      {/* Collapsed trigger */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 w-full text-left"
        >
          <Avatar name={user?.full_name} size="sm" />
          <span className="flex-1 input-base text-[var(--text-muted)] cursor-text text-sm">
            What's on your mind, {user?.full_name?.split(' ')[0]}?
          </span>
        </button>
      ) : (
        <div className="flex flex-col gap-3 animate-slide-up">
          <div className="flex items-start gap-3">
            <Avatar name={user?.full_name} size="sm" />
            <textarea
              autoFocus
              rows={3}
              placeholder="Share a tip, ask a question, warn about a scam, or say hi…"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="input-base flex-1 resize-none text-sm"
            />
          </div>

          {/* Tag selector */}
          {TAGS.map(t => (
  <button
    key={t.value}
    onClick={() => setTag(t.value)}
    className={`tag tag-${t.value} cursor-pointer transition-all border
      flex items-center gap-1.5
      ${tag === t.value
        ? 'ring-2 ring-[var(--brand)] ring-offset-1'
        : 'opacity-60 hover:opacity-100'}`}
    style={{ borderColor: 'transparent' }}
  >
    {t.icon}
    {t.label}
  </button>
))}

          {/* Optional image URL */}
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="input-base text-sm ml-11"
          />

          <div className="flex justify-end gap-2 pl-11">
            <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setContent(''); }}>
              Cancel
            </Button>
            <Button size="sm" loading={loading} onClick={handleSubmit}>
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}