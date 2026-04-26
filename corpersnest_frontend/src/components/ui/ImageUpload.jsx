import { useState, useRef } from 'react'
import Spinner from './Spinner'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

export default function ImageUpload({ value, onChange, label = 'Photo' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(value || '')
  const inputRef = useRef()

  
  const handleFile = async (file) => {
  console.log('cloud:', CLOUD_NAME, 'preset:', UPLOAD_PRESET, 'url:', UPLOAD_URL)
  if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setError('')
    setUploading(true)

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'corpersnest')

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      const cloudUrl = data.secure_url

      setPreview(cloudUrl)
      onChange(cloudUrl)
    } catch (err) {
      setError('Upload failed. Please try again.')
      setPreview(value || '')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}

      {/* Upload area */}
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
          style={{
            borderColor: 'var(--border-strong)',
            background: 'var(--bg-subtle)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
        >
          {uploading ? (
            <>
              <Spinner size="md" />
              <p className="text-sm font-medium" style={{ color: 'var(--brand)' }}>
                Uploading...
              </p>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--brand-light)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Click to upload or drag and drop
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  PNG, JPG, WEBP — max 5MB
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Preview */
        <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          {/* Overlay on upload */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <p className="text-xs text-white font-medium">Uploading to cloud...</p>
              </div>
            </div>
          )}
          {/* Actions */}
          {!uploading && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                style={{ background: 'rgba(220,38,38,0.8)' }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 4v2M6 8v.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}