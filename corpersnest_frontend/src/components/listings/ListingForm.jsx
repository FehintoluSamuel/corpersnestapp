import { useState } from 'react'
import { LGA_OPTIONS } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const DEFAULTS = {
  title: '', address: '', lga: '', description: '',
  price_monthly: '', bedrooms: '', listing_type: 'corper_room',
  available_from: '', image_url: '',
}

export default function ListingForm({ initial = {}, onSubmit, loading = false, submitLabel = 'Post listing' }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...initial })
  const [errors, setErrors] = useState({})

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.lga) errs.lga = 'LGA is required'
    if (!form.price_monthly || isNaN(form.price_monthly) || form.price_monthly <= 0) errs.price_monthly = 'Valid price required'
    if (!form.bedrooms || isNaN(form.bedrooms) || form.bedrooms <= 0) errs.bedrooms = 'Number of bedrooms required'
    if (!form.description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = {
      ...form,
      price_monthly: parseFloat(form.price_monthly),
      bedrooms: parseInt(form.bedrooms),
    }
    if (!payload.image_url) delete payload.image_url
    if (!payload.available_from) delete payload.available_from
    onSubmit(payload)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Listing title"
            placeholder="e.g. Clean self-contain near Abia Poly"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />
        </div>
        <Input
          label="Address"
          placeholder="Street address"
          value={form.address}
          onChange={set('address')}
          error={errors.address}
        />
        <Select label="LGA" value={form.lga} onChange={set('lga')} error={errors.lga}>
          <option value="">Select LGA</option>
          {LGA_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Input
          label="Monthly rent (₦)"
          type="number"
          placeholder="e.g. 20000"
          value={form.price_monthly}
          onChange={set('price_monthly')}
          error={errors.price_monthly}
          min="0"
        />
        <Input
          label="Bedrooms"
          type="number"
          placeholder="1"
          value={form.bedrooms}
          onChange={set('bedrooms')}
          error={errors.bedrooms}
          min="1"
          max="20"
        />
        <Select label="Listing type" value={form.listing_type} onChange={set('listing_type')}>
          <option value="corper_room">Corper Room (handover)</option>
          <option value="landlord_property">Landlord Property</option>
        </Select>
        <Input
          label="Available from"
          type="date"
          value={form.available_from}
          onChange={set('available_from')}
          hint="Leave blank if available now"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]">Description</label>
        <textarea
          className="input-base resize-none h-28"
          placeholder="Describe the room — what's included, house rules, nearby landmarks..."
          value={form.description}
          onChange={set('description')}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Image URL — placeholder until Cloudinary endpoint is ready */}
      <Input
        label="Photo URL (optional)"
        placeholder="https://... — image upload coming soon"
        value={form.image_url}
        onChange={set('image_url')}
        hint="Paste a direct image link for now. Full upload support coming soon."
      />

      <Button onClick={handleSubmit} loading={loading} size="lg" fullWidth>
        {submitLabel}
      </Button>
    </div>
  )
}