import { Search, LogIn, UserRound } from 'lucide-react'
import type { Page } from '../types'

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: 'discover', label: '发现' },
  { key: 'ranking', label: '榜单' },
  { key: 'categories', label: '分类' },
  { key: 'topics', label: '话题' },
]

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
  searchQuery: string
  onSearch: (q: string) => void
  onSearchFocus: () => void
  userEmail?: string
  authConfigured: boolean
  authLoading: boolean
}

export function Header({ currentPage, onNavigate, searchQuery, onSearch, onSearchFocus, userEmail, authConfigured, authLoading }: Props) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-6"
      style={{ height: 72, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid #E4E5E8', padding: '0 28px' }}
    >
      <button
        className="shrink-0"
        style={{ fontWeight: 900, fontSize: 18, color: '#111114', letterSpacing: '-0.02em' }}
        onClick={() => onNavigate('discover')}
      >
        SkillScope
      </button>

      <nav className="hidden md:flex items-center gap-0 ml-4">
        {NAV_ITEMS.map(item => (
          <a
            key={item.key}
            href={`#${item.key === 'discover' ? '' : item.key}`}
            onClick={e => { e.preventDefault(); onNavigate(item.key) }}
            className="relative"
            style={{
              padding: '0 14px',
              fontSize: 14,
              fontWeight: currentPage === item.key ? 650 : 400,
              color: '#111114',
              lineHeight: '72px',
              textDecoration: 'none',
            }}
          >
            {item.label}
            {currentPage === item.key && (
              <span style={{ position: 'absolute', bottom: 0, left: 14, right: 14, height: 2, background: '#111114', borderRadius: 1 }} />
            )}
          </a>
        ))}
      </nav>

      <div className="flex-1 max-w-lg ml-auto">
        <label
          className="flex items-center gap-2 px-3 cursor-text"
          style={{ height: 38, background: '#fff', border: '1px solid #D8D9DD', borderRadius: 9 }}
          onClick={onSearchFocus}
        >
          <Search size={15} style={{ color: '#999' }} className="shrink-0" />
          <input
            type="text"
            placeholder="搜索 Skills、仓库、场景或平台"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#111114', fontSize: 13 }}
          />
          <kbd className="hidden sm:flex items-center gap-0.5" style={{ fontSize: 11, color: '#999', border: '1px solid #D8D9DD', borderRadius: 4, padding: '1px 5px' }}>
            ⌘ K
          </kbd>
        </label>
      </div>

      <div className="flex items-center gap-3 ml-3 shrink-0">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5"
          style={{ fontSize: 13, fontWeight: 750, color: '#111114', border: '1px solid #E4E5E8', borderRadius: 9, padding: '6px 14px', textDecoration: 'none' }}
        >
          <GithubIcon size={15} />
          GitHub
        </a>
        <button
          onClick={() => onNavigate(userEmail ? 'profile' : 'auth')}
          className={`flex items-center gap-1.5 ${currentPage === 'profile' || currentPage === 'auth' ? 'ring-2 ring-offset-1' : ''}`}
          style={{
            fontSize: 12, fontWeight: 750, color: '#111114',
            border: '1px solid #E4E5E8', borderRadius: 9, padding: '6px 14px',
          }}
          title={userEmail || (authConfigured ? '登录' : '账号功能等待配置')}
        >
          {userEmail ? <UserRound size={15} /> : <LogIn size={15} />}
          <span className="hidden sm:inline" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {authLoading ? '...' : userEmail || '登录'}
          </span>
        </button>
      </div>
    </header>
  )
}
