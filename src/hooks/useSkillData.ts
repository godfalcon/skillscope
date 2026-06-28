import { useState, useEffect } from 'react'
import type { SkillData } from '../types'

export function useSkillData() {
  const [data, setData] = useState<SkillData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/skills.json')
      .then(r => r.json())
      .then((d: SkillData) => {
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
