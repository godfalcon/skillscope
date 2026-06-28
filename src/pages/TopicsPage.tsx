import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Skill, SkillData } from '../types'
import { SkillCard } from '../components/SkillCard'
import { formatStars } from '../utils/format'

interface Props {
  data: SkillData
  searchQuery: string
  onSelectSkill: (skill: Skill) => void
}

export function TopicsPage({ data, searchQuery, onSelectSkill }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(
    data.topics.length > 0 ? data.topics[0].name : null
  )

  const platformTopics = useMemo(
    () => data.topics.filter(t =>
      t.name.includes('agent') || t.name.includes('claude') ||
      t.name.includes('codex') || t.name.includes('openclaw') ||
      t.name.includes('anthropic') || t.name.includes('agentic')
    ),
    [data.topics]
  )

  const abilityTopics = useMemo(
    () => data.topics.filter(t => !platformTopics.includes(t)),
    [data.topics, platformTopics]
  )

  const topicSkills = useMemo(() => {
    if (!selectedTopic) return []
    let list = data.skills.filter(s =>
      s.sourceTopics.includes(selectedTopic) || s.repoTopics.includes(selectedTopic)
    )
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.stars - a.stars)
  }, [data.skills, selectedTopic, searchQuery])

  const activeTopic = data.topics.find(t => t.name === selectedTopic)

  return (
    <div>
      {/* Title with large faded count */}
      <section className="mb-8 relative">
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111114', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Skills 生态话题
        </h1>
        <p style={{ fontSize: 14, color: '#999' }}>
          按平台生态与能力方向聚合 GitHub Topics，快速了解每个话题的项目规模与活跃度。
        </p>
        <span className="absolute top-0 right-0" style={{ fontSize: 100, fontWeight: 900, color: '#F0F0F0', lineHeight: 1, pointerEvents: 'none' }}>
          {data.topics.length}
        </span>
      </section>

      {/* Top 6 topic cards - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {data.topics.slice(0, 6).map((t) => {
          const isActive = selectedTopic === t.name
          return (
            <button
              key={t.name}
              onClick={() => setSelectedTopic(selectedTopic === t.name ? null : t.name)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: isActive ? '#111114' : '#fff',
                border: isActive ? '1px solid #111114' : '1px solid #E4E5E8',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? '#fff' : '#111114' }}>
                #{t.name}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: isActive ? '#fff' : '#111114', margin: '4px 0' }}>
                {t.repositories}
              </div>
              <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#999' }}>
                {t.activeRepositories} 个本月活跃 · {formatStars(t.stars)} Stars
              </div>
            </button>
          )
        })}
      </div>

      {/* Platform & Ability sections - pill tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid #E4E5E8' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111114' }}>平台生态</h3>
            <span style={{ fontSize: 13, color: '#999' }}>{platformTopics.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {platformTopics.map(t => {
              const isActive = selectedTopic === t.name
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTopic(selectedTopic === t.name ? null : t.name)}
                  className="flex items-center gap-1.5 transition-all"
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 12,
                    background: isActive ? '#111114' : '#fff',
                    color: isActive ? '#fff' : '#666',
                    border: isActive ? '1px solid #111114' : '1px solid #E4E5E8',
                  }}
                >
                  #{t.name}
                  <span style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#999' }}>{t.repositories}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid #E4E5E8' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111114' }}>能力与工具</h3>
            <span style={{ fontSize: 13, color: '#999' }}>{abilityTopics.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {abilityTopics.map(t => {
              const isActive = selectedTopic === t.name
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTopic(selectedTopic === t.name ? null : t.name)}
                  className="flex items-center gap-1.5 transition-all"
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 12,
                    background: isActive ? '#111114' : '#fff',
                    color: isActive ? '#fff' : '#666',
                    border: isActive ? '1px solid #111114' : '1px solid #E4E5E8',
                  }}
                >
                  #{t.name}
                  <span style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#999' }}>{t.repositories}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected topic detail */}
      {selectedTopic && activeTopic && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111114' }}>#{selectedTopic}</h2>
              <p style={{ fontSize: 13, color: '#999' }}>
                {activeTopic.repositories} 个仓库，其中 {activeTopic.activeRepositories} 个最近 30 天仍在更新。
              </p>
            </div>
            <a
              href={activeTopic.url || `https://github.com/topics/${selectedTopic}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 shrink-0"
              style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid #E4E5E8', color: '#111114', background: '#fff', textDecoration: 'none' }}
            >
              在 GitHub 查看 <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicSkills.slice(0, 20).map(s => (
              <SkillCard key={s.id} skill={s} onSelect={onSelectSkill} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
