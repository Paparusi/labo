'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface ResumeUploadProps {
  userId: string
  resumeUrl: string | null
  resumeFilename: string | null
  onUpload: (url: string, filename: string) => void
  onRemove: () => void
}

export default function ResumeUpload({ userId, resumeUrl, resumeFilename, onUpload, onRemove }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file PDF hoặc Word (.doc, .docx)')
      return
    }

    if (file.size > maxSize) {
      toast.error('Kích thước file tối đa là 5MB')
      return
    }

    setUploading(true)

    // Delete old resume if exists
    if (resumeUrl) {
      const oldPath = resumeUrl.split('/resumes/')[1]
      if (oldPath) {
        await supabase.storage.from('resumes').remove([oldPath])
      }
    }

    const ext = file.name.split('.').pop()
    const filePath = `${userId}/resume_${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true })

    if (error) {
      toast.error('Tải lên thất bại. Vui lòng thử lại.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath)

    // Update worker profile
    await supabase
      .from('worker_profiles')
      .update({ resume_url: publicUrl, resume_filename: file.name })
      .eq('user_id', userId)

    onUpload(publicUrl, file.name)
    toast.success('Đã tải lên hồ sơ/CV')
    setUploading(false)

    // Reset input
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleRemove = async () => {
    if (!resumeUrl) return

    const path = resumeUrl.split('/resumes/')[1]
    if (path) {
      await supabase.storage.from('resumes').remove([path])
    }

    await supabase
      .from('worker_profiles')
      .update({ resume_url: null, resume_filename: null })
      .eq('user_id', userId)

    onRemove()
    toast.success('Đã xóa hồ sơ/CV')
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleUpload}
        className="hidden"
      />

      {resumeUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <FileText className="h-8 w-8 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900 truncate">
              {resumeFilename || 'Hồ sơ/CV'}
            </p>
            <p className="text-xs text-emerald-600">Đã tải lên</p>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" asChild>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-2" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Đang tải lên...' : 'Nhấn để tải lên hồ sơ/CV'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF hoặc Word, tối đa 5MB</p>
        </div>
      )}

      {resumeUrl && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Thay thế file
        </Button>
      )}
    </div>
  )
}
