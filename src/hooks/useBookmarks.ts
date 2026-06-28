import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const STORAGE_KEY = 'skillscope-favorites'

function loadLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set()
}

function saveLocal(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

export function useBookmarks(user: User | null) {
  const [names, setNames] = useState<Set<string>>(loadLocal)
  const [loading, setLoading] = useState(false)
  const prevUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user || !supabase) {
      if (prevUserId.current) {
        setNames(loadLocal())
      }
      prevUserId.current = null
      return
    }
    if (user.id === prevUserId.current) return
    prevUserId.current = user.id

    let active = true
    setLoading(true)
    supabase
      .from('user_favorites')
      .select('repository')
      .then(({ data: rows, error }) => {
        if (!active) return
        if (error) {
          console.error('Failed to load favorites', error)
          setLoading(false)
          return
        }
        const remote = new Set((rows || []).map((r: { repository: string }) => r.repository))
        const local = loadLocal()
        const merged = new Set([...remote, ...local])
        setNames(merged)
        setLoading(false)

        const toSync = [...local].filter(n => !remote.has(n))
        if (toSync.length > 0) {
          supabase
            .from('user_favorites')
            .upsert(toSync.map(repository => ({ user_id: user.id, repository })))
            .then(() => localStorage.removeItem(STORAGE_KEY))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!user) saveLocal(names)
  }, [names, user])

  const toggle = useCallback((fullName: string) => {
    if (!user || !supabase) {
      setNames(prev => {
        const next = new Set(prev)
        if (next.has(fullName)) next.delete(fullName)
        else next.add(fullName)
        return next
      })
      return 'toggled' as const
    }

    const wasFav = names.has(fullName)
    setNames(prev => {
      const next = new Set(prev)
      if (wasFav) next.delete(fullName)
      else next.add(fullName)
      return next
    })

    const req = wasFav
      ? supabase.from('user_favorites').delete().eq('user_id', user.id).eq('repository', fullName)
      : supabase.from('user_favorites').insert({ user_id: user.id, repository: fullName })
    req.then(({ error }) => {
      if (error) {
        console.error('Favorite sync failed', error)
        setNames(prev => {
          const next = new Set(prev)
          if (wasFav) next.add(fullName)
          else next.delete(fullName)
          return next
        })
      }
    })
    return 'toggled' as const
  }, [user, names])

  const has = useCallback((fullName: string) => names.has(fullName), [names])

  return { names, toggle, has, loading }
}
