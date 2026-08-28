'use client'
import { useState, useEffect, useRef } from 'react'
import { Upload, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

type Props = {
  currentImage: string | null
  bucket?: string
  folder?: string
  onUploaded: (url: string) => void
}

export default function ImageUpload({ currentImage, bucket = 'menu-images', folder = 'menu', onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImage || '')
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImageUrl(currentImage || '')
    setUploadError('')
  }, [currentImage])

  const upload = async (file: File) => {
    setUploading(true)
    setUploadError('')
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) {
      setUploadError(`Error al subir: ${error.message}`)
    } else {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
      setImageUrl(publicUrl)
      onUploaded(publicUrl)
    }
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <div
        className="relative h-32 bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:border-[#006B42] transition group"
        onClick={() => fileRef.current?.click()}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-1">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs font-semibold">Subir imagen</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
        />
      </div>
      {uploadError && (
        <p className="text-red-400 text-xs font-semibold px-1">{uploadError}</p>
      )}
      <input
        value={imageUrl}
        onChange={(e) => { setImageUrl(e.target.value); onUploaded(e.target.value) }}
        placeholder="O pega una URL de imagen"
        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#006B42] placeholder:text-gray-600"
      />
    </div>
  )
}
