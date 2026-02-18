'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  const fetchBookmarks = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setBookmarks(data)
  }

  useEffect(() => {
    const supabase = createClient()

    // Fetch on mount
    fetchBookmarks()

    // Realtime subscription
    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status)
      })

    // Polling every 2 seconds as fallback (guarantees updates even if realtime fails)
    const interval = setInterval(() => {
      fetchBookmarks()
    }, 2000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const deleteBookmark = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      alert('Error deleting bookmark: ' + error.message)
    } else {
      // Immediately remove from UI
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <p className="mt-2 text-lg font-medium">No bookmarks yet!</p>
        <p className="text-sm">Add your first bookmark above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block mt-1"
              >
                {bookmark.url}
              </a>
              <p className="text-xs text-gray-400 mt-1">
                Added on{' '}
                {new Date(bookmark.created_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="ml-4 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}