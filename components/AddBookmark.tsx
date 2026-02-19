'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const supabase = createClient() // ✅ outside component

export default function AddBookmark() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('bookmarks').insert({
        title: title.trim(),
        url: url.trim(),
        user_id: user.id,
      })
    }
    setTitle('')
    setUrl('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Add Bookmark</h2>
      <div className="space-y-4">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" required disabled={loading} />
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" required disabled={loading} />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? 'Adding...' : 'Add Bookmark'}
        </button>
      </div>
    </form>
  )
}