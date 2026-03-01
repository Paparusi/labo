'use client'

import { useState, useRef, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressResult {
  address: string
  latitude: number
  longitude: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (result: AddressResult) => void
  placeholder?: string
  className?: string
}

interface Feature {
  place_name: string
  center: [number, number]
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Nhập địa chỉ...',
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debouncedValue = useDebounce(value, 400)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 3) {
      setSuggestions([])
      return
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    const controller = new AbortController()
    setLoading(true)

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedValue)}.json?access_token=${token}&country=vn&language=vi&limit=5&types=address,place,locality,neighborhood`,
      { signal: controller.signal }
    )
      .then(res => res.json())
      .then(data => {
        if (data.features) {
          setSuggestions(data.features)
          setIsOpen(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => controller.abort()
  }, [debouncedValue])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (feature: Feature) => {
    onChange(feature.place_name)
    onSelect({
      address: feature.place_name,
      latitude: feature.center[1],
      longitude: feature.center[0],
    })
    setIsOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-8"
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((feature, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex items-start gap-2 border-b last:border-b-0"
              onClick={() => handleSelect(feature)}
            >
              <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">{feature.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
