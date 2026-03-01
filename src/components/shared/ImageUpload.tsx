'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  bucket: 'avatars' | 'logos'
  currentUrl: string | null
  onUpload: (url: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  shape?: 'circle' | 'square'
  placeholder?: React.ReactNode
}

const SIZE_CLASSES = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024

export default function ImageUpload({
  bucket,
  currentUrl,
  onUpload,
  className,
  size = 'md',
  shape = 'circle',
  placeholder,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Chỉ chấp nhận file JPG, PNG hoặc WebP')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File không được vượt quá 2MB')
      return
    }

    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

    if (error) {
      alert('Lỗi tải ảnh lên: ' + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl

    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function renderContent() {
    if (uploading) {
      return <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
    }
    if (preview) {
      return <img src={preview} alt="Upload" className="h-full w-full object-cover" />
    }
    return placeholder || <Camera className="h-6 w-6 text-gray-400" />
  }

  return (
    <div className={cn('relative group', className)}>
      <div
        className={cn(
          SIZE_CLASSES[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-xl',
          'overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50',
          'flex items-center justify-center cursor-pointer',
          'hover:border-emerald-400 transition-colors',
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {renderContent()}
      </div>

      {preview && !uploading && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRemove() }}
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <p className="text-xs text-gray-400 mt-1 text-center">
        {uploading ? 'Đang tải...' : 'JPG, PNG, WebP (tối đa 2MB)'}
      </p>
    </div>
  )
}
