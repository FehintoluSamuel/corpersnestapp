import { useState } from 'react'
import { LGA_OPTIONS } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'

export default function ListingFilter({ onFilter }) {
  const [filters, setFilters] = useState({ lga: '', price_max: '', bedrooms: '' })

  const set = (f) => (e) => setFilters(prev => ({ ...prev, [f]: e.target.value }))

  const handleApply = () => {
    const clean = {}
    if (filters.lga) clean.lga = filters.lga
    if (filters.price_max) clean.price_max = filters.price_max
    if (filters.bedrooms) clean.bedrooms = filters.bedrooms
    onFilter(clean)
  }

  const handleReset = () => {
    setFilters({ lga: '', price_max: '', bedrooms: '' })
    onFilter({})
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="card p-4 flex flex-col gap-3 md:flex-row md:items-end md:gap-4 mb-5">
      <div className="flex-1">
        <Select label="LGA" value={filters.lga} onChange={set('lga')}>
          <option value="">All LGAs</option>
          {LGA_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>
      <div className="w-full md:w-36">
        <Input
          label="Max price (₦)"
          type="number"
          placeholder="e.g. 30000"
          value={filters.price_max}
          onChange={set('price_max')}
          min="0"
        />
      </div>
      <div className="w-full md:w-28">
        <Select label="Bedrooms" value={filters.bedrooms} onChange={set('bedrooms')}>
          <option value="">Any</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApply} size="md">Filter</Button>
        {hasFilters && (
          <Button variant="ghost" onClick={handleReset} size="md">Clear</Button>
        )}
      </div>
    </div>
  )
}