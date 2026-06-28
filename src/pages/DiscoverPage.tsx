import { useMemo, useState, useRef } from 'react'
import { RefreshCw, ArrowRight } from 'lucide-react'
import type { Skill, SkillData } from '../types'
import { SkillCard } from '../components/SkillCard'
import { formatStars } from '../utils/format'

interface Props {
  data: SkillData
  selectedCategory: string | null
  searchQuery: string
  onSelectSkill: (skill: Skill) => void
}

export function DiscoverPage({ data, selectedCategory, searchQuery, onSelectSkill }: Props) {
  const [randomSeed, setRandomSeed] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    let list = data.skills
    if (selectedCategory) list = list.filter(s => s.category === selectedCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.platforms.some(p => p.toLowerCase().includes(q)) ||
        s.repoTopics.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [data.skills, selectedCategory, searchQuery])

  const weeklyNew = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 86400000
    return filtered
      .filter(s => new Date(s.pushedAt).getTime() > weekAgo)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  }, [filtered])

  const collections = useMemo(
    () => filtered.filter(s => s.isCollection).sort((a, b) => b.stars - a.stars).slice(0, 4),
    [filtered]
  )

  const randomPicks = useMemo(() => {
    const pool = filtered.filter(s => !weeklyNew.includes(s))
    const shuffled = [...pool].sort(() => Math.sin(randomSeed + pool.indexOf(pool[0])) - 0.5)
    return shuffled.slice(0, 9)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, randomSeed])

  return (
    <div className="space-y-10">
      <section style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
        <div>
          <h1 className="mb-4 leading-tight" style={{ fontSize: 58, fontWeight: 950, color: '#111114', letterSpacing: '-0.03em' }}>
            发现适合你的 <span style={{ fontWeight: 950 }}>Agent Skills</span>
          </h1>
          <p style={{ color: '#999', marginBottom: 24, fontSize: 15, maxWidth: 560 }}>
            持续整理可安装的 Skills 与配套 Agent 工具，用准确中文简介帮你更快选对。
          </p>
          <div className="flex items-center gap-4" style={{ fontSize: 13, color: '#999' }}>
            <span><span style={{ fontSize: 20, fontWeight: 700, color: '#111114' }}>{data.meta.repositories}</span> 个仓库</span>
            <span><span style={{ fontSize: 20, fontWeight: 700, color: '#111114' }}>{data.categories.length}</span> 个分类</span>
            <span style={{ color: '#ccc' }}>
              更新于 {new Date(data.meta.generatedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
            </span>
          </div>
        </div>
        <img
          src="/assets/illustrations/superpowers.png"
          alt="Agent 正在发现新技能"
          style={{ width: 260, maxHeight: 190, objectFit: 'contain' }}
        />
      </section>

      {weeklyNew.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111114', marginBottom: 4 }}>本周新发现</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>最近仍在快速更新的实用项目。</p>
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto pb-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d8 transparent', scrollSnapType: 'x mandatory' }}
          >
            {weeklyNew.map(s => (
              <div key={s.id} className="shrink-0" style={{ width: 'calc(33.333% - 11px)', minWidth: 280, scrollSnapAlign: 'start' }}>
                <SkillCard skill={s} onSelect={onSelectSkill} />
              </div>
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111114', marginBottom: 4 }}>精选技能合集</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>一次找到一整套可安装的能力。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {collections.map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSkill(s)}
                className="flex items-center gap-3 p-4 rounded-xl text-left group"
                style={{ background: '#fff', border: '1px solid #E4E5E8' }}
              >
                <img src={s.avatarUrl} alt={s.owner} className="w-10 h-10 rounded-lg" style={{ border: '1px solid #E4E5E8' }} loading="lazy" />
                <div className="flex-1 min-w-0">
                  <h4 className="line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ fontSize: 13, fontWeight: 600, color: '#111114' }}>{s.fullName}</h4>
                  <p className="line-clamp-1" style={{ fontSize: 12, color: '#999' }}>{s.summary}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111114' }}>{s.skillCount > 1 ? `${s.skillCount}+ Skills` : `${formatStars(s.stars)}`}</span>
                  <ArrowRight size={14} style={{ color: '#999' }} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111114', marginBottom: 4 }}>随机漫游</h2>
            <p style={{ fontSize: 13, color: '#999' }}>换一批，也许会遇到意料之外的好工具。</p>
          </div>
          <button
            onClick={() => setRandomSeed(s => s + 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all"
            style={{ border: '1px solid #E4E5E8', color: '#666', background: '#fff' }}
          >
            <RefreshCw size={14} />
            换一批
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {randomPicks.map(s => (
            <SkillCard key={s.id} skill={s} onSelect={onSelectSkill} />
          ))}
        </div>
      </section>
    </div>
  )
}
