import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Skill, SkillData } from '../types'
import { SkillCard } from '../components/SkillCard'

interface Props {
  data: SkillData
  selectedCategory: string | null
  searchQuery: string
  onSelectSkill: (skill: Skill) => void
  onSelectCategory: (cat: string | null) => void
}

export function CategoriesPage({ data, selectedCategory, searchQuery, onSelectSkill, onSelectCategory }: Props) {
  const filtered = useMemo(() => {
    let list = data.skills
    if (selectedCategory) list = list.filter(s => s.category === selectedCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.score - a.score)
  }, [data.skills, selectedCategory, searchQuery])

  const allCats = [{ name: '全部分类', count: data.meta.repositories, description: `浏览 SkillScope 收录的全部开源项目。` }, ...data.categories]

  return (
    <div>
      {/* Title with large faded count */}
      <section className="mb-8 relative">
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111114', marginBottom: 8, letterSpacing: '-0.02em' }}>
          技能分类
        </h1>
        <p style={{ fontSize: 14, color: '#999' }}>
          按真实工作场景浏览，所有页面使用同一套分类标准。
        </p>
        <span className="absolute top-0 right-0" style={{ fontSize: 100, fontWeight: 900, color: '#F0F0F0', lineHeight: 1, pointerEvents: 'none' }}>
          {data.categories.length}
        </span>
      </section>

      {/* Category grid - 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {allCats.map((cat, i) => {
          const isAll = i === 0
          const isActive = isAll ? !selectedCategory : selectedCategory === cat.name
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(isAll ? null : (selectedCategory === cat.name ? null : cat.name))}
              className="flex flex-col justify-between p-4 rounded-xl text-left transition-all"
              style={{
                minHeight: 120,
                background: isActive ? '#111114' : '#fff',
                border: isActive ? '1px solid #111114' : '1px solid #E4E5E8',
              }}
            >
              <div className="flex items-start justify-between w-full">
                <span style={{ fontSize: 14, fontWeight: 600, color: isActive ? '#fff' : '#111114' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: 28, fontWeight: 900, color: isActive ? '#fff' : '#111114', lineHeight: 1 }}>
                  {cat.count}
                </span>
              </div>
              <p className="line-clamp-2" style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#999', marginTop: 8 }}>
                {cat.description}
              </p>
              <ArrowRight size={16} style={{ color: isActive ? 'rgba(255,255,255,0.6)' : '#999', marginTop: 8 }} />
            </button>
          )
        })}
      </div>

      {/* Skills list */}
      {selectedCategory && (
        <section>
          <div className="mb-4">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111114' }}>
              {selectedCategory}
            </h2>
            <p style={{ fontSize: 13, color: '#999' }}>
              {data.categories.find(c => c.name === selectedCategory)?.description}
              <span style={{ marginLeft: 4, fontWeight: 500, color: '#111114' }}>{filtered.length} 个项目</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.slice(0, 24).map(s => (
              <SkillCard key={s.id} skill={s} onSelect={onSelectSkill} compact />
            ))}
          </div>

          {filtered.length > 24 && (
            <div className="text-center py-6">
              <p style={{ fontSize: 13, color: '#999' }}>显示前 24 个，共 {filtered.length} 个项目。使用侧边栏或搜索缩小范围。</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
