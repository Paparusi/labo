/**
 * Geospatial utilities for distance calculation and matching
 */

export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function getDistanceLabel(km: number): { label: string; color: string; transport: string } {
  if (km <= 2) return { label: 'Rất gần', color: 'text-green-600', transport: 'Đi bộ ~' + Math.round(km * 12) + ' phút' }
  if (km <= 5) return { label: 'Gần', color: 'text-emerald-600', transport: 'Xe máy ~' + Math.round(km * 2) + ' phút' }
  if (km <= 10) return { label: 'Trung bình', color: 'text-yellow-600', transport: 'Xe máy ~' + Math.round(km * 2.5) + ' phút' }
  if (km <= 20) return { label: 'Xa', color: 'text-orange-600', transport: 'Xe máy ~' + Math.round(km * 3) + ' phút' }
  return { label: 'Rất xa', color: 'text-red-600', transport: 'Xe máy ~' + Math.round(km * 3) + ' phút' }
}

export function formatSalary(amount: number | null): string {
  if (!amount) return 'Thỏa thuận'
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1) + ' triệu'
  }
  return amount.toLocaleString('vi-VN') + 'đ'
}

export function formatSalaryRange(min: number | null, max: number | null): string {
  if (!min && !max) return 'Thỏa thuận'
  if (min && max) return `${formatSalary(min)} - ${formatSalary(max)}`
  if (min) return `Từ ${formatSalary(min)}`
  return `Đến ${formatSalary(max)}`
}
