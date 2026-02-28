'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MarkerData {
  id: string
  latitude: number
  longitude: number
  title: string
  subtitle?: string
  type: 'job' | 'worker' | 'factory' | 'user'
  color?: string
  onClick?: () => void
}

interface MapViewProps {
  center?: [number, number] // [lng, lat]
  zoom?: number
  markers?: MarkerData[]
  radiusKm?: number
  showUserLocation?: boolean
  userLocation?: { latitude: number; longitude: number } | null
  className?: string
  onMapClick?: (lng: number, lat: number) => void
}

export default function MapView({
  center = [106.6297, 10.8231], // Default: Ho Chi Minh City
  zoom = 12,
  markers = [],
  radiusKm,
  showUserLocation = true,
  userLocation,
  className = 'w-full h-[500px]',
  onMapClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat)
      })
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add user location marker
    if (showUserLocation && userLocation) {
      const el = document.createElement('div')
      el.className = 'user-location-marker'
      el.innerHTML = `
        <div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 2px #3b82f6, 0 0 10px rgba(59,130,246,0.5);"></div>
      `
      const marker = new mapboxgl.Marker(el)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>Vị trí của bạn</strong>'))
        .addTo(map.current)
      markersRef.current.push(marker)
    }

    // Add data markers
    markers.forEach(m => {
      const colors: Record<string, string> = {
        job: '#10b981',
        worker: '#3b82f6',
        factory: '#f59e0b',
        user: '#6366f1',
      }
      const color = m.color || colors[m.type] || '#10b981'

      const el = document.createElement('div')
      el.innerHTML = `
        <div style="
          width: 32px; height: 32px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          font-size: 14px; color: white;
        ">
          ${m.type === 'job' ? '💼' : m.type === 'factory' ? '🏭' : '👷'}
        </div>
      `

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 4px;">
          <strong style="font-size: 14px;">${m.title}</strong>
          ${m.subtitle ? `<p style="margin: 4px 0 0; font-size: 12px; color: #666;">${m.subtitle}</p>` : ''}
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([m.longitude, m.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      if (m.onClick) {
        el.addEventListener('click', m.onClick)
      }

      markersRef.current.push(marker)
    })
  }, [markers, mapLoaded, showUserLocation, userLocation])

  // Draw radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation || !radiusKm) return

    const sourceId = 'radius-circle'

    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(sourceId + '-fill')
      map.current.removeLayer(sourceId + '-border')
      map.current.removeSource(sourceId)
    }

    // Create circle as GeoJSON polygon
    const center = [userLocation.longitude, userLocation.latitude]
    const points = 64
    const coords = []
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 360
      const rad = (angle * Math.PI) / 180
      const dx = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180))
      const dy = radiusKm / 110.574
      coords.push([center[0] + dx * Math.cos(rad), center[1] + dy * Math.sin(rad)])
    }
    coords.push(coords[0]) // Close the ring

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [coords] },
      },
    })

    map.current.addLayer({
      id: sourceId + '-fill',
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.08,
      },
    })

    map.current.addLayer({
      id: sourceId + '-border',
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#10b981',
        'line-width': 2,
        'line-dasharray': [3, 2],
      },
    })
  }, [userLocation, radiusKm, mapLoaded])

  // Fly to center when changed
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.flyTo({ center, zoom, duration: 1000 })
    }
  }, [center, zoom, mapLoaded])

  return (
    <div className={`relative rounded-xl overflow-hidden border ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Đang tải bản đồ...</div>
        </div>
      )}
    </div>
  )
}
