'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

const supabase = createClient() // ✅ outside component = single instance

export default function BookmarkList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  useEffect(() => {
    const channel = supabase
      .channel(`bookmarks-realtime-${Math.random()}`) // unique per tab
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => {
              // avoid duplicate if same tab
              if (prev.find((b) => b.id === (payload.new as Bookmark).id)) return prev
              return [payload.new as Bookmark, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="mt-2">No bookmarks yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{bookmark.title}</h3>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                {bookmark.url}
              </a>
              <p className="text-xs text-gray-400 mt-1">{new Date(bookmark.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteBookmark(bookmark.id)} className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}