'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { newsAPI } from '@/lib/api'
import { ArrowLeft, Upload } from 'lucide-react'

interface NewsForm {
  title: string
  content: string
  valid_from?: string
  valid_until?: string
  published_at?: string
  featured_image: FileList | null
}

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NewsForm>()

  const featuredImage = watch('featured_image')

  useEffect(() => {
    if (params.id) {
      fetchNews()
    }
  }, [params.id])

  useEffect(() => {
    if (featuredImage && featuredImage.length > 0) {
      const file = featuredImage[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [featuredImage])

  const fetchNews = async () => {
    try {
      const response = await newsAPI.getNewsItem(Number(params.id))
      const news = response.data
      
      // Set form values
      setValue('title', news.title)
      setValue('content', news.content)
      if (news.valid_from) setValue('valid_from', news.valid_from.slice(0, 16))
      if (news.valid_until) setValue('valid_until', news.valid_until.slice(0, 16))
      if (news.published_at) setValue('published_at', news.published_at.slice(0, 16))
      
      // Set image preview if exists
      if (news.featured_image_url) {
        setImagePreview(news.featured_image_url)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      alert('Failed to load news article')
    } finally {
      setFetchLoading(false)
    }
  }

  const onSubmit = async (data: NewsForm) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('summary', data.title)
      formData.append('content', data.content)
      formData.append('status', 'published')
      formData.append('is_featured', 'false')
      formData.append('tags', '')
      formData.append('meta_description', '')
      if (data.valid_from) formData.append('valid_from', new Date(data.valid_from).toISOString())
      if (data.valid_until) formData.append('valid_until', new Date(data.valid_until).toISOString())
      if (data.published_at) formData.append('published_at', new Date(data.published_at).toISOString())
      if (data.featured_image && data.featured_image.length > 0) {
        formData.append('featured_image', data.featured_image[0])
      }

      await newsAPI.updateNews(Number(params.id), formData)
      router.push('/dashboard/news')
    } catch (error) {
      console.error('Error updating news:', error)
      alert('Failed to update news article')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/dashboard/news')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to News
      </button>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit News Article</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter news title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description/Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('content', { required: 'Description is required' })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter news description"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Validity Period (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From (Optional)
              </label>
              <input
                {...register('valid_from')}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty if news is valid indefinitely</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until (Optional)
              </label>
              <input
                {...register('valid_until')}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty if news is valid indefinitely</p>
            </div>
          </div>

          {/* Publish Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publish Date
            </label>
            <input
              {...register('published_at')}
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to publish immediately</p>
          </div>

          {/* Featured Image (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-lg" />
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload a new file</span>
                    <input
                      {...register('featured_image')}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Optional)</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/dashboard/news')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update News Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
