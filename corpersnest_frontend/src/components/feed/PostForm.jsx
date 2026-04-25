import { useState } from 'react'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

const TAGS = [
  { value: 'question', label: '❓ Question' },
  { value: 'tip', label: '💡 Tip' },
  { value: 'room_available', label: '🏠 Room available' },
  { value: 'scam_warning', label: '⚠️ Scam warning' },
  { value: 'general', label: '💬 General' },
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
          <div className="flex flex-wrap gap-2 pl-11">
            {TAGS.map(t => (
              <button
                key={t.value}
                onClick={() => setTag(t.value)}
                className={`tag tag-${t.value} cursor-pointer transition-all border
                  ${tag === t.value
                    ? 'ring-2 ring-[var(--brand)] ring-offset-1'
                    : 'opacity-60 hover:opacity-100'}`}
                style={{ borderColor: 'transparent' }}
              >
                {t.label}
              </button>
            ))}
          </div>

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