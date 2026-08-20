'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'

interface ImageUploadNewProps {
  onImagesSelected: (files: File[]) => void
  existingImages: File[]
}

export default function ImageUploadNew({ onImagesSelected, existingImages }: ImageUploadNewProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [coverIndex, setCoverIndex] = useState(0)

  const optimizeImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1, // Max 1MB per image
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
    }

    try {
      const compressedFile = await imageCompression(file, options)
      console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB → Optimized: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
      return compressedFile
    } catch (error) {
      console.error('Error optimizing image:', error)
      return file
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      // Optimize all images
      const optimizedFiles = await Promise.all(
        files.map(file => optimizeImage(file))
      )

      // Create previews
      const newPreviews = await Promise.all(
        optimizedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        })
      )

      setPreviews([...previews, ...newPreviews])
      onImagesSelected([...existingImages, ...optimizedFiles])
    } catch (error) {
      console.error('Error processing images:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = existingImages.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onImagesSelected(newFiles)
    
    if (coverIndex === index) {
      setCoverIndex(0)
    } else if (coverIndex > index) {
      setCoverIndex(coverIndex - 1)
    }
  }

  const setCover = (index: number) => {
    setCoverIndex(index)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Images
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploading ? 'Optimizing...' : 'Upload Photos'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <span className="text-sm text-gray-500">
            Images auto-optimized to save storage ✨
          </span>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              
              {/* Cover badge */}
              {coverIndex === index && (
                <div className="absolute top-2 left-2 bg-[#1877F2] text-white text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {coverIndex !== index && (
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Set as cover"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No images yet. Upload some photos!</p>
        </div>
      )}
    </div>
  )
}
