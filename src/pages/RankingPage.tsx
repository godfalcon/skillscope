import { useMemo, useState } from 'react'
import { Star, Bookmark, ExternalLink, SlidersHorizontal } from 'lucide-react'
import type { Skill, SkillData, SortBy } from '../types'
import { formatStars, formatDate } from '../utils/format'

interface Props {
  data: SkillData
  selectedCategory: string | null
  searchQuery: string
  onSelectSkill: (skill: Skill) => void
}

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'score', label: '综合热度' },
  { key: 'stars', label: 'Stars' },
  { key: 'pushedAt', label: '最近更新' },
]

const PAGE_SIZE = 50

function activityLabel(activity: string) {
  return activity || '—'
}

export function RankingPage({ data, selectedCategory, searchQuery, onSelectSkill }: Props) {
  const [sortBy, setSortBy] = useState<SortBy>('score')
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const effectiveCat = selectedCategory || catFilter

  const sorted = useMemo(() => {
    let list = [...data.skills]
    if (effectiveCat) list = list.filter(s => s.category === effectiveCat)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars
      if (sortBy === 'pushedAt') return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      return b.score - a.score
    })
    return list
  }, [data.skills, effectiveCat, searchQuery, sortBy])

  const visible = sorted.slice(0, visibleCount)

  return (
    <div>
      {/* Title row with count */}
      <section className="mb-6 flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111114', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Skills 榜单
          </h1>
          <p style={{ fontSize: 14, color: '#999' }}>
            按综合热度、Stars 或最近更新查看完整索引。
          </p>
        </div>
        <div className="text-right shrink-0">
          <div style={{ fontSize: 48, fontWeight: 900, color: '#111114', lineHeight: 1 }}>{sorted.length}</div>
          <div style={{ fontSize: 13, color: '#999' }}>匹配项目</div>
        </div>
      </section>

      {/* Category filter pills + sort */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5 flex-1">
          <button
            onClick={() => setCatFilter(null)}
            style={{
              padding: '6px 14px', fontSize: 12, borderRadius: 8,
              background: !catFilter ? '#111114' : '#fff',
              color: !catFilter ? '#fff' : '#666',
              border: !catFilter ? '1px solid #111114' : '1px solid #E4E5E8',
            }}
          >
            全部
          </button>
          {data.categories.map(c => (
            <button
              key={c.name}
              onClick={() => setCatFilter(catFilter === c.name ? null : c.name)}
              style={{
                padding: '6px 14px', fontSize: 12, borderRadius: 8,
                background: catFilter === c.name ? '#111114' : '#fff',
                color: catFilter === c.name ? '#fff' : '#666',
                border: catFilter === c.name ? '1px solid #111114' : '1px solid #E4E5E8',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5"
            style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, border: '1px solid #E4E5E8', background: '#fff', color: '#111114' }}
          >
            <SlidersHorizontal size={14} />
            {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 rounded-lg overflow-hidden" style={{ background: '#fff', border: '1px solid #E4E5E8', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setSortBy(opt.key); setShowSortMenu(false) }}
                  className="block w-full text-left px-4 py-2"
                  style={{ fontSize: 12, color: sortBy === opt.key ? '#111114' : '#666', fontWeight: sortBy === opt.key ? 600 : 400, background: sortBy === opt.key ? '#F5F5F5' : '#fff', whiteSpace: 'nowrap' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table (CSS Grid like original) */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E4E5E8' }}>
        <div
          className="items-center"
          style={{ display: 'grid', gridTemplateColumns: '54px 1fr 94px 82px 98px 72px 126px', gap: 8, padding: '0 12px', borderBottom: '1px solid #E4E5E8' }}
        >
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0' }}>排名</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0' }}>仓库</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0' }}>分类</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0', textTransform: 'uppercase' }}>Stars</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0', textAlign: 'center' }}>活跃度</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0', textAlign: 'center' }}>更新</span>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '12px 0', textAlign: 'center' }}>操作</span>
        </div>

        {visible.map((skill, i) => (
          <div
            key={skill.id}
            className="items-center cursor-pointer transition-colors"
            style={{ display: 'grid', gridTemplateColumns: '54px 1fr 94px 82px 98px 72px 126px', gap: 8, padding: '0 12px', borderBottom: '1px solid #F0F0F0' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
            onClick={() => onSelectSkill(skill)}
          >
            <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: '#111114', padding: '12px 0' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-3 min-w-0" style={{ padding: '12px 0' }}>
              <img src={skill.avatarUrl} alt="" className="w-8 h-8 rounded-full shrink-0" style={{ border: '1px solid #E4E5E8' }} loading="lazy" />
              <div className="min-w-0">
                <span className="block truncate" style={{ fontSize: 13, fontWeight: 600, color: '#111114' }}>{skill.fullName}</span>
                <span className="block truncate" style={{ fontSize: 11, color: '#999' }}>{skill.summary}</span>
              </div>
            </div>
            <span className="truncate" style={{ fontSize: 12, color: '#999', padding: '12px 0' }}>{skill.category}</span>
            <span className="inline-flex items-center gap-1" style={{ fontSize: 12, color: '#111114', padding: '12px 0' }}>
              <Star size={12} className="text-amber-500 fill-amber-500" />
              {formatStars(skill.stars)}
            </span>
            <span style={{ fontSize: 11, color: '#999', padding: '12px 0', textAlign: 'center' }}>
              {activityLabel(skill.activity)}
            </span>
            <span style={{ fontSize: 11, color: '#999', padding: '12px 0', textAlign: 'center' }}>
              {formatDate(skill.pushedAt)}
            </span>
            <div className="flex items-center justify-center gap-1.5" style={{ padding: '12px 0' }}>
              <button
                className="transition-colors"
                style={{ padding: '4px', border: '1px solid #E4E5E8', borderRadius: 6, color: '#999', background: '#fff', display: 'flex', alignItems: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <Bookmark size={14} />
              </button>
              <button
                className="transition-colors"
                style={{ padding: '3px 10px', border: '1px solid #E4E5E8', borderRadius: 6, fontSize: 11, color: '#111114', background: '#fff' }}
                onClick={e => { e.stopPropagation(); onSelectSkill(skill) }}
              >
                详情
              </button>
              <a
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ padding: '4px', border: '1px solid #E4E5E8', borderRadius: 6, color: '#999', background: '#fff', display: 'flex', alignItems: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < sorted.length && (
        <div className="text-center py-6">
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="px-6 py-2 text-sm rounded-lg transition-all"
            style={{ border: '1px solid #E4E5E8', color: '#666', background: '#fff' }}
          >
            加载更多 {sorted.length - visibleCount}
          </button>
        </div>
      )}
    </div>
  )
}
