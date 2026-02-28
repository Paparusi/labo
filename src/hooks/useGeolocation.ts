'use client'

import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Trình duyệt không hỗ trợ định vị', loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        let message = 'Không thể lấy vị trí'
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Bạn đã từ chối quyền truy cập vị trí'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Vị trí không khả dụng'
        } else if (error.code === error.TIMEOUT) {
          message = 'Hết thời gian lấy vị trí'
        }
        setState(prev => ({ ...prev, error: message, loading: false }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return { ...state, refresh: requestLocation }
}
