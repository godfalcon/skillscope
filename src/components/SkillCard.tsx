import { Star, Bookmark, ExternalLink } from 'lucide-react'
import type { Skill } from '../types'
import { formatStars, timeAgo } from '../utils/format'

interface Props {
  skill: Skill
  onSelect: (skill: Skill) => void
  compact?: boolean
}

export function SkillCard({ skill, onSelect, compact }: Props) {
  if (compact) {
    return (
      <div
        className="cursor-pointer group"
        style={{ background: '#fff', border: '1px solid #E4E5E8', borderRadius: 11 }}
        onClick={() => onSelect(skill)}
      >
        <div style={{ padding: 14 }}>
          <div className="flex items-start gap-3">
            <img src={skill.avatarUrl} alt={skill.owner} className="w-8 h-8 rounded-full shrink-0" style={{ border: '1px solid #E4E5E8' }} loading="lazy" />
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{skill.category}</span>
              <h4 className="mt-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ fontSize: 13, fontWeight: 600, color: '#111114' }}>{skill.fullName}</h4>
              {skill.platforms.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {skill.platforms.slice(0, 3).map(p => (
                    <span key={p} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#F5F5F5', color: '#666', border: '1px solid #E4E5E8' }}>{p}</span>
                  ))}
                </div>
              )}
              <p className="mt-1.5 line-clamp-2" style={{ fontSize: 12, color: '#999' }}>{skill.summary}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #E4E5E8' }}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#666' }}>
                <Star size={12} className="text-amber-500 fill-amber-500" />
                {formatStars(skill.stars)}
              </span>
              <span style={{ fontSize: 12, color: '#999' }}>{timeAgo(skill.pushedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button style={{ padding: '2px 8px', fontSize: 12, color: '#666', borderRadius: 4 }} onClick={e => { e.stopPropagation(); onSelect(skill) }}>详情</button>
              <a href={skill.url} target="_blank" rel="noopener noreferrer" className="p-1 transition-colors" style={{ color: '#999' }} onClick={e => e.stopPropagation()}><ExternalLink size={14} /></a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden cursor-pointer group" style={{ background: '#fff', border: '1px solid #E4E5E8', borderRadius: 11 }} onClick={() => onSelect(skill)}>
      {/* OG Image preview */}
      <div className="relative overflow-hidden" style={{ height: 118 }}>
        <img
          src={skill.media.socialPreview || skill.avatarUrl}
          alt={skill.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = skill.avatarUrl }}
        />
        <span className="absolute top-2 left-2" style={{ fontSize: 9, padding: '5px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.92)', color: '#111114' }}>
          {skill.category}
        </span>
      </div>

      {/* Card content */}
      <div style={{ padding: 14 }}>
        <div className="flex items-center gap-2 mb-1.5">
          <img src={skill.avatarUrl} alt={skill.owner} className="w-6 h-6 rounded-full" style={{ border: '1px solid #E4E5E8' }} loading="lazy" />
          <div className="min-w-0 flex-1">
            <strong className="block truncate group-hover:text-blue-600 transition-colors" style={{ fontSize: 13, color: '#111114' }}>{skill.fullName}</strong>
            {skill.platforms.length > 0 && (
              <small style={{ fontSize: 10, color: '#999' }}>
                {skill.platforms.slice(0, 3).join(' · ')}
              </small>
            )}
          </div>
        </div>

        <p className="line-clamp-2 leading-relaxed" style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{skill.summary}</p>

        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span className="flex items-center gap-1" style={{ fontSize: 12, color: '#666' }}>
            <Star size={14} className="text-amber-500 fill-amber-500" />
            {formatStars(skill.stars)}
          </span>
          <span style={{ fontSize: 12, color: '#999' }}>{timeAgo(skill.pushedAt)}</span>
        </div>

        {/* Actions bar - grid layout matching original */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 6 }}>
          <button
            className="transition-colors"
            style={{ padding: '1px 6px', border: '1px solid #E4E5E8', borderRadius: 7, color: '#999', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => { e.stopPropagation() }}
          >
            <Bookmark size={16} />
          </button>
          <button
            className="transition-colors"
            style={{ padding: '1px 6px', border: '1px solid #E4E5E8', borderRadius: 7, fontSize: 10, color: '#111114', background: '#fff' }}
            onClick={e => { e.stopPropagation(); onSelect(skill) }}
          >
            详情
          </button>
          <a
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ padding: '1px 6px', border: '1px solid #E4E5E8', borderRadius: 7, color: '#999', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}
