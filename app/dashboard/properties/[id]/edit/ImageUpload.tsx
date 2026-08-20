'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface ImageUploadProps {
  propertyId: string
  existingImages: Array<{
    id: string
    image_url: string
    storage_path: string
    sort_order: number
    is_cover: boolean
  }>
  onImagesUpdated: () => void
}

export default function ImageUpload({ propertyId, existingImages, onImagesUpdated }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setErrorMsg(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select at least one image to upload.')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const files = Array.from(event.target.files)
      
      // Validate files
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`)
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Max size is 5MB`)
        }
      }

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        // Save to database
        const { error: dbError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            image_url: publicUrl,
            storage_path: fileName,
            sort_order: existingImages.length + i,
            is_cover: existingImages.length === 0 && i === 0, // First image is cover by default
          })

        if (dbError) throw dbError
      }

      onImagesUpdated()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteImage = async (imageId: string, storagePath: string) => {
    try {
      setErrorMsg(null)

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([storagePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId)

      if (dbError) throw dbError

      onImagesUpdated()
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  const setCoverImage = async (imageId: string) => {
    try {
      setErrorMsg(null)

      // First, unset all as cover
      const { error: unsetError } = await supabase
        .from('property_images')
        .update({ is_cover: false })
        .eq('property_id', propertyId)

      if (unsetError) throw unsetError

      // Set this one as cover
      const { error: setError } = await supabase
        .from('property_images')
        .update({ is_cover: true })
        .eq('id', imageId)

      if (setError) throw setError

      onImagesUpdated()
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  const reorderImage = async (imageId: string, newOrder: number) => {
    try {
      setErrorMsg(null)

      const { error } = await supabase
        .from('property_images')
        .update({ sort_order: newOrder })
        .eq('id', imageId)

      if (error) throw error

      onImagesUpdated()
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Property Images</h3>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMsg}</p>
        </div>
      )}

      <div className="mb-4">
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        <p className="mt-2 text-xs text-gray-500">
          Upload images (max 5MB each, multiple files supported)
        </p>
      </div>

      {uploading && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Uploading images...</p>
        </div>
      )}

      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingImages
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={image.image_url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.is_cover && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                        Cover
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex space-x-2">
                    {!image.is_cover && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(image.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Set as cover
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteImage(image.id, image.storage_path)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {existingImages.length === 0 && !uploading && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}
