import { UserRound, CheckCircle2, LogOut, Bookmark } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Skill } from '../types'

interface Props {
  favorites: Skill[]
  onSelect: (skill: Skill) => void
  onToggleFavorite: (skill: Skill) => void
  onSignOut: () => void
}

export function ProfilePage({ favorites, onSelect, onToggleFavorite, onSignOut }: Props) {
  const { user, signOut } = useAuth()
  if (!user) return null

  const joinedAt = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(user.created_at))

  const leave = async () => {
    await signOut()
    onSignOut()
  }

  return (
    <div style={{ padding: '42px 52px 0' }}>
      {/* Profile Card */}
      <div style={{ background: '#fff', border: '1px solid #E4E5E8', borderRadius: 14, padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F3F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserRound size={28} style={{ color: '#111114' }} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>个人主页</span>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111114', margin: '2px 0 4px' }}>{user.email}</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', margin: 0 }}>
              <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
              已验证 · 加入于 {joinedAt}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: '我的收藏', value: favorites.length },
            { label: '账号类型', value: '邮箱账号' },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, padding: 14, background: '#FAFAFA', borderRadius: 10, border: '1px solid #E4E5E8' }}>
              <dt style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{item.label}</dt>
              <dd style={{ fontSize: 16, fontWeight: 750, color: '#111114', margin: 0 }}>{item.value}</dd>
            </div>
          ))}
        </div>

        <button
          onClick={leave}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 38, padding: '0 16px', borderRadius: 9,
            background: '#fff', border: '1px solid #E4E5E8',
            fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer',
          }}
        >
          <LogOut size={15} /> 退出登录
        </button>
      </div>

      {/* Favorites Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 750, color: '#111114', margin: '0 0 4px' }}>我的收藏</h2>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>这些条目只对当前登录账号可见。</p>
        </div>
        <strong style={{ fontSize: 20, fontWeight: 800, color: '#111114' }}>{favorites.length}</strong>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <Bookmark size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>还没有收藏任何 Skill</p>
          <p style={{ fontSize: 12 }}>在详情面板点击书签图标即可收藏</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {favorites.map(skill => (
            <button
              key={skill.fullName}
              onClick={() => onSelect(skill)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                padding: 16, background: '#fff', border: '1px solid #E4E5E8', borderRadius: 10,
                textAlign: 'left', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={skill.avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: 6 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111114' }}>{skill.fullName}</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onToggleFavorite(skill) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', padding: 0 }}
                >
                  <Bookmark size={16} fill="#F59E0B" />
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#6F7078', margin: 0, lineHeight: 1.5 }}>
                {skill.summary.slice(0, 80)}
              </p>
              <span style={{ fontSize: 10, color: '#888' }}>
                {skill.category} · ⭐ {skill.stars >= 1000 ? `${(skill.stars / 1000).toFixed(1)}k` : skill.stars}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
