import { Star, ExternalLink, Bookmark, ChevronLeft, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Skill } from '../types'
import type { DetailViewMode } from '../App'
import { formatStars, timeAgo } from '../utils/format'

interface Props {
  skill: Skill | null
  onClose: () => void
  onRestore: () => void
  hasLastSkill: boolean
  viewMode: DetailViewMode
  onViewModeChange: (mode: DetailViewMode) => void
  isBookmarked: boolean
  onToggleBookmark: () => void
}

function ViewModeSwitch({ mode, onChange }: { mode: DetailViewMode; onChange: (m: DetailViewMode) => void }) {
  return (
    <div role="group" aria-label="详情面板宽度" style={{ display: 'flex', border: '1px solid #E4E5E8', borderRadius: 8, background: '#fff', height: 32, overflow: 'hidden' }}>
      {[
        { key: 'side' as const, label: '靠右显示', icon: <><rect x="13" y="3" width="8" height="18" rx="1" fill="currentColor" /><rect x="3" y="3" width="8" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /></> },
        { key: 'half' as const, label: '占一半', icon: <><rect x="13" y="3" width="8" height="18" rx="1" fill="currentColor" /><rect x="3" y="3" width="8" height="18" rx="1" fill="currentColor" /></> },
        { key: 'full' as const, label: '全屏', icon: <><rect x="3" y="3" width="18" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M9 3v18" stroke="currentColor" strokeWidth="1.5" /></> },
      ].map(m => (
        <button
          key={m.key}
          type="button"
          aria-pressed={mode === m.key}
          aria-label={m.label}
          title={m.label}
          onClick={() => onChange(m.key)}
          style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: mode === m.key ? '#111114' : '#fff',
            color: mode === m.key ? '#fff' : '#6F7078',
            border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">{m.icon}</svg>
        </button>
      ))}
    </div>
  )
}

export function DetailPanel({ skill, onClose, onRestore, hasLastSkill, viewMode, onViewModeChange, isBookmarked, onToggleBookmark }: Props) {
  const [copied, setCopied] = useState(false)

  if (!skill) {
    return (
      <aside style={{ position: 'sticky', top: 72, height: 'calc(100vh - 72px)', background: '#fff', borderLeft: '1px solid #E4E5E8', width: 44 }}>
        <button
          onClick={hasLastSkill ? onRestore : undefined}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
            gap: 8, width: 43, height: '100%', padding: '12px 0', background: '#fff', border: 'none',
            cursor: hasLastSkill ? 'pointer' : 'default', color: '#6F7078',
          }}
        >
          <ChevronLeft size={17} />
          <span style={{ fontSize: 9, color: '#6F7078' }}>详情</span>
        </button>
      </aside>
    )
  }

  const handleCopy = () => {
    if (skill.installCommand) {
      navigator.clipboard.writeText(skill.installCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className="overflow-y-auto"
      style={{
        position: 'sticky', top: 72, height: 'calc(100vh - 72px)',
        background: '#FAFAFA', borderLeft: '1px solid #E4E5E8',
        padding: '16px 20px 22px',
      }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 34 }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '0 8px', height: 34, fontSize: 10,
            color: '#111114', border: '1px solid #E4E5E8', borderRadius: 8, background: '#fff', cursor: 'pointer',
          }}
        >
          <ChevronLeft size={18} />
          收起
        </button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: 34 }}>
          <ViewModeSwitch mode={viewMode} onChange={onViewModeChange} />
          <button
            onClick={onToggleBookmark}
            style={{
              display: 'flex', alignItems: 'center', padding: '0 8px', height: 34,
              border: '1px solid #E4E5E8', borderRadius: 8, background: '#fff', cursor: 'pointer',
              color: isBookmarked ? '#F59E0B' : '#111114',
            }}
          >
            <Bookmark size={18} fill={isBookmarked ? '#F59E0B' : 'none'} />
          </button>
        </div>
      </div>

      {/* Heading */}
      <div style={{ padding: '24px 0 18px', borderBottom: '1px solid #E4E5E8' }}>
        <span style={{ fontSize: 10, fontWeight: 750, color: '#111114' }}>{skill.category}</span>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111114', letterSpacing: -0.8, margin: '8px 0 10px', lineHeight: '27.6px', wordBreak: 'break-word' }}>
          {skill.fullName}
        </h2>
        <p style={{ fontSize: 12, color: '#6F7078', lineHeight: '19.8px', margin: 0 }}>{skill.summary}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#111114' }}>
            <Star size={12} className="text-amber-500 fill-amber-500" />
            {formatStars(skill.stars)}
          </strong>
          <span style={{ fontSize: 10, color: '#6F7078' }}>{timeAgo(skill.pushedAt)}</span>
        </div>
      </div>

      {/* Card Preview */}
      <a
        href={skill.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', margin: '18px 0', borderRadius: 9, overflow: 'hidden', border: '1px solid #E4E5E8', background: '#fff' }}
      >
        <img
          src={skill.media.socialPreview || `https://opengraph.githubassets.com/skillhot/${skill.fullName}`}
          alt={`${skill.fullName} GitHub 预览`}
          style={{ width: '100%', display: 'block' }}
          onError={e => { (e.target as HTMLImageElement).src = skill.avatarUrl }}
        />
      </a>

      {/* Facts Table */}
      <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #E4E5E8', borderRadius: 8, background: '#fff', overflow: 'hidden', margin: 0 }}>
        {[
          { label: '语言', value: skill.language || '—' },
          { label: '许可证', value: skill.license || '—' },
          { label: '技能规模', value: skill.skillCount > 1 ? `${skill.skillCount} 项` : '单项 / 未标注' },
        ].map((item, i) => (
          <div key={item.label} style={{ padding: 10, borderRight: i < 2 ? '1px solid #E4E5E8' : 'none' }}>
            <dt style={{ fontSize: 8, color: '#6F7078', margin: 0 }}>{item.label}</dt>
            <dd style={{ fontSize: 10, fontWeight: 750, color: '#111114', margin: 0 }}>{item.value}</dd>
          </div>
        ))}
      </dl>

      {/* 作者原始描述 */}
      <section style={{ padding: '17px 0', borderBottom: '1px solid #E4E5E8' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111114', marginBottom: 10, marginTop: 0 }}>作者原始描述</h3>
        <p style={{ fontSize: 11, color: '#6F7078', lineHeight: '18.15px', margin: 0 }}>
          {skill.description || skill.summary}
        </p>
        {skill.categoryConfidence && (
          <div style={{ display: 'grid', gap: 4, marginTop: 12 }}>
            <span style={{ fontSize: 9, padding: '4px 7px', borderRadius: 5, background: '#FAFAFA', color: '#111114', border: '1px solid #E4E5E8', justifySelf: 'start' }}>
              分类置信度 · {skill.categoryConfidence === 'high' ? '高' : skill.categoryConfidence === 'medium' ? '中' : '低'}
            </span>
            <small style={{ fontSize: 8, color: '#96979F' }}>依据仓库名称、作者描述与 GitHub Topics 综合判断</small>
          </div>
        )}
      </section>

      {/* 兼容平台 */}
      {skill.platforms.length > 0 && (
        <section style={{ padding: '17px 0', borderBottom: '1px solid #E4E5E8' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111114', marginBottom: 10, marginTop: 0 }}>兼容平台</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {skill.platforms.map(p => (
              <span key={p} style={{ fontSize: 9, padding: '5px 7px', borderRadius: 6, background: '#fff', color: '#111114', border: '1px solid #E4E5E8' }}>{p}</span>
            ))}
          </div>
        </section>
      )}

      {/* 适用场景 */}
      {skill.scenarios.length > 0 && (
        <section style={{ padding: '17px 0', borderBottom: '1px solid #E4E5E8' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111114', marginBottom: 10, marginTop: 0 }}>适用场景</h3>
          <ul style={{ display: 'grid', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
            {skill.scenarios.map(s => (
              <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#4F5057' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 安装与使用 */}
      <section style={{ padding: '17px 0', borderBottom: '1px solid #E4E5E8' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111114', marginBottom: 10, marginTop: 0 }}>安装与使用</h3>
        <p style={{ fontSize: 11, color: '#6F7078', lineHeight: '18.15px', margin: 0 }}>
          {skill.howToUse || '阅读仓库 README 的安装要求，将 Skill、插件或工具接入对应环境，再按文档触发工作流。'}
        </p>
        {skill.installCommand && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, background: '#fff', border: '1px solid #E4E5E8', borderRadius: 7, padding: 9, marginTop: 10, alignItems: 'center' }}>
            <code style={{ fontSize: 9, fontFamily: 'monospace', color: '#111114', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.installCommand}</code>
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6F7078', padding: 0 }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </section>

      {/* 媒体 */}
      <section style={{ padding: '17px 0', borderBottom: '1px solid #E4E5E8' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111114', marginBottom: 10, marginTop: 0 }}>媒体</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 9, color: '#6F7078' }}>
          <a
            href={skill.media.socialPreview || skill.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6F7078', textDecoration: 'none' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            预览图
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>
            {skill.media.videoUrl ? <a href={skill.media.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6F7078' }}>视频</a> : '暂无视频'}
          </span>
        </div>
      </section>

      {/* GitHub Topics */}
      {skill.repoTopics.length > 0 && (
        <section style={{ padding: '17px 0', borderBottom: '1px solid #E4E5E8' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111114', marginBottom: 10, marginTop: 0 }}>GitHub Topics</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {skill.repoTopics.map(t => (
              <span key={t} style={{ fontSize: 9, padding: '5px 7px', borderRadius: 6, background: '#fff', color: '#111114', border: '1px solid #E4E5E8' }}>{t}</span>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'grid', gap: 7, paddingTop: 18 }}>
        <a
          href={skill.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            height: 42, fontSize: 10, fontWeight: 800,
            color: '#fff', background: '#111114', border: '1px solid #111114', borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={14} />
          在 GitHub 打开
        </a>
        {skill.installCommand && (
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              height: 42, fontSize: 10, fontWeight: 800,
              color: '#111114', background: '#fff', border: '1px solid #111114', borderRadius: 8, cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制安装命令'}
          </button>
        )}
      </div>
    </div>
  )
}
