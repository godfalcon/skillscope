import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { DetailPanel } from './components/DetailPanel'
import { FeedbackDialog } from './components/FeedbackDialog'
import { DiscoverPage } from './pages/DiscoverPage'
import { RankingPage } from './pages/RankingPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { TopicsPage } from './pages/TopicsPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { useSkillData } from './hooks/useSkillData'
import { useBookmarks } from './hooks/useBookmarks'
import { useAuth } from './auth/AuthContext'
import { authConfigured } from './lib/supabase'
import type { Page, Skill } from './types'

export type DetailViewMode = 'side' | 'half' | 'full'

const validPages: Page[] = ['discover', 'ranking', 'categories', 'topics', 'auth', 'profile']

function getPageFromHash(): Page {
  const hash = location.hash.slice(1) as Page
  return validPages.includes(hash) ? hash : 'discover'
}

function App() {
  const { data, loading, error } = useSkillData()
  const { user, loading: authLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [detailViewMode, setDetailViewMode] = useState<DetailViewMode>('side')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const lastSkillRef = useRef<Skill | null>(null)
  const bookmarks = useBookmarks(user)

  if (selectedSkill) lastSkillRef.current = selectedSkill

  const favoriteSkills = useMemo(
    () => (data?.skills ?? []).filter(s => bookmarks.has(s.fullName)),
    [data?.skills, bookmarks.names],
  )

  useEffect(() => {
    const handler = () => setCurrentPage(getPageFromHash())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const navigate = useCallback((page: Page) => {
    location.hash = page === 'discover' ? '' : page
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (user && currentPage === 'auth') navigate('profile')
  }, [user, currentPage, navigate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
      }
      if (e.key === 'Escape' && selectedSkill) {
        setSelectedSkill(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedSkill])

  const handleRestore = useCallback(() => {
    if (lastSkillRef.current) setSelectedSkill(lastSkillRef.current)
  }, [])

  const handleToggleFavorite = useCallback((skill: Skill) => {
    if (!user && authConfigured) {
      navigate('auth')
      return
    }
    bookmarks.toggle(skill.fullName)
  }, [user, bookmarks, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#fff' }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-3" style={{ border: '2px solid #E4E5E8', borderTopColor: '#111114' }} />
          <p style={{ fontSize: 13, color: '#999' }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#fff' }}>
        <div className="text-center">
          <p style={{ color: '#EF4444', marginBottom: 8 }}>加载失败</p>
          <p style={{ fontSize: 13, color: '#999' }}>{error}</p>
        </div>
      </div>
    )
  }

  const isAuthPage = currentPage === 'auth' || currentPage === 'profile'
  const sidebarW = sidebarCollapsed ? 48 : 244

  let detailW: string
  if (!selectedSkill || isAuthPage) {
    detailW = '44px'
  } else if (detailViewMode === 'full') {
    detailW = 'calc(100vw - ' + sidebarW + 'px)'
  } else if (detailViewMode === 'half') {
    detailW = 'calc(50vw - ' + (sidebarW / 2) + 'px)'
  } else {
    detailW = '366px'
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onSearchFocus={() => {}}
        userEmail={user?.email}
        authConfigured={authConfigured}
        authLoading={authLoading}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isAuthPage ? '1fr' : `${sidebarW}px 1fr ${detailW}`,
          transition: 'grid-template-columns 0.2s ease',
        }}
      >
        {!isAuthPage && (
          <Sidebar
            categories={data.categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalCount={data.meta.repositories}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
            currentPage={currentPage}
            onNavigate={navigate}
          />
        )}

        <main style={{ minWidth: 0, display: detailViewMode === 'full' && selectedSkill && !isAuthPage ? 'none' : undefined }}>
          {currentPage === 'auth' && (
            <AuthPage
              onContinue={() => navigate('discover')}
              onSuccess={() => navigate('profile')}
            />
          )}
          {currentPage === 'profile' && (
            <ProfilePage
              favorites={favoriteSkills}
              onSelect={setSelectedSkill}
              onToggleFavorite={skill => bookmarks.toggle(skill.fullName)}
              onSignOut={() => navigate('discover')}
            />
          )}

          {!isAuthPage && (
            <div style={{ padding: '42px 52px 0' }}>
              {currentPage === 'discover' && (
                <DiscoverPage
                  data={data}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  onSelectSkill={setSelectedSkill}
                />
              )}
              {currentPage === 'ranking' && (
                <RankingPage
                  data={data}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  onSelectSkill={setSelectedSkill}
                />
              )}
              {currentPage === 'categories' && (
                <CategoriesPage
                  data={data}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  onSelectSkill={setSelectedSkill}
                  onSelectCategory={setSelectedCategory}
                />
              )}
              {currentPage === 'topics' && (
                <TopicsPage
                  data={data}
                  searchQuery={searchQuery}
                  onSelectSkill={setSelectedSkill}
                />
              )}
            </div>
          )}

          <footer className="py-6 px-6 text-center" style={{ fontSize: 13, color: '#999', borderTop: '1px solid #E4E5E8' }}>
            SkillScope · 每日更新的 Agent Skills 与开源工具索引
            <span style={{ margin: '0 12px', color: '#E4E5E8' }}>|</span>
            <a href="#" style={{ color: '#666' }}>关于</a>
            <span style={{ margin: '0 12px', color: '#E4E5E8' }}>|</span>
            <button onClick={() => setFeedbackOpen(true)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>反馈</button>
            <span style={{ margin: '0 12px', color: '#E4E5E8' }}>|</span>
            <a href="https://github.com" style={{ color: '#666' }}>GitHub</a>
          </footer>
        </main>

        {!isAuthPage && (
          <DetailPanel
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onRestore={handleRestore}
            hasLastSkill={!!lastSkillRef.current}
            viewMode={detailViewMode}
            onViewModeChange={setDetailViewMode}
            isBookmarked={selectedSkill ? bookmarks.has(selectedSkill.fullName) : false}
            onToggleBookmark={() => {
              if (selectedSkill) handleToggleFavorite(selectedSkill)
            }}
          />
        )}
      </div>

      {feedbackOpen && authConfigured && (
        <FeedbackDialog onClose={() => setFeedbackOpen(false)} />
      )}
    </div>
  )
}

export default App
