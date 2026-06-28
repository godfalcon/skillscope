import {
  Compass, Bookmark, MessageSquare, PanelLeftClose, PanelLeftOpen,
  Palette, Code2, ClipboardList, PenLine, BarChart3,
  Search, Zap, Shield, Brain, Bot, Briefcase, Wrench, Layers, FolderOpen
} from 'lucide-react'
import type { Category, Page } from '../types'

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  'UI设计': Palette,
  '编程开发': Code2,
  '办公效率': ClipboardList,
  '内容创作': PenLine,
  '数据分析': BarChart3,
  '研究学习': Search,
  '自动化': Zap,
  '安全': Shield,
  '记忆与上下文': Brain,
  'Agent工具与平台': Bot,
  '产品与商业': Briefcase,
  '技能开发': Wrench,
  '技能合集': Layers,
  '其他': FolderOpen,
}

function CategoryIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = CATEGORY_ICONS[name] || FolderOpen
  return <Icon size={size} />
}

interface Props {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (cat: string | null) => void
  totalCount: number
  collapsed: boolean
  onToggle: () => void
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  totalCount,
  collapsed,
  onToggle,
  currentPage,
  onNavigate,
}: Props) {
  if (collapsed) {
    return (
      <aside
        className="flex flex-col items-center pt-3"
        style={{ position: 'sticky', top: 72, height: 'calc(100vh - 72px)', background: '#fff', borderRight: '1px solid #E4E5E8', zIndex: 20 }}
      >
        <button
          onClick={onToggle}
          className="p-2 rounded-md transition-colors"
          style={{ color: '#999' }}
          title="展开侧边栏"
        >
          <PanelLeftOpen size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside
      className="flex flex-col overflow-y-auto"
      style={{ position: 'sticky', top: 72, height: 'calc(100vh - 72px)', background: '#fff', borderRight: '1px solid #E4E5E8', zIndex: 20, padding: '18px 14px 14px' }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#96979F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>浏览</span>
        <button
          onClick={onToggle}
          className="flex items-center transition-colors"
          style={{ color: '#111114', fontSize: 11, padding: '0 10px', height: 34, gap: 6, borderRadius: 8, border: '1px solid #E4E5E8', background: '#fff' }}
          title="收起侧边栏"
        >
          <PanelLeftClose size={14} />
          收起
        </button>
      </div>

      <nav className="space-y-0.5">
        <button
          onClick={() => onNavigate('discover')}
          className="w-full flex items-center transition-all"
          style={{
            padding: '0 10px', height: 40, gap: 9, fontSize: 12, borderRadius: 8,
            background: currentPage === 'discover' ? '#111114' : 'transparent',
            color: currentPage === 'discover' ? '#fff' : '#666',
            fontWeight: currentPage === 'discover' ? 600 : 400,
          }}
        >
          <Compass size={16} />
          发现
        </button>
        <button className="w-full flex items-center transition-colors" style={{ padding: '0 10px', height: 40, gap: 9, fontSize: 12, borderRadius: 8, color: '#999' }}>
          <Bookmark size={16} />
          收藏
        </button>
        <button className="w-full flex items-center transition-colors" style={{ padding: '0 10px', height: 40, gap: 9, fontSize: 12, borderRadius: 8, color: '#999' }}>
          <MessageSquare size={16} />
          反馈
        </button>
      </nav>

      <div className="flex items-center justify-between" style={{ padding: '16px 8px 8px' }}>
        <span style={{ fontSize: 10, color: '#96979F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>分类</span>
        <span style={{ fontSize: 10, color: '#96979F', padding: '1px 6px', borderRadius: 99, background: '#F5F5F5' }}>{categories.length}</span>
      </div>

      <nav className="space-y-0.5 pb-4 flex-1">
        <button
          onClick={() => onSelectCategory(null)}
          className="w-full flex items-center justify-between transition-all"
          style={{
            padding: '0 10px', height: 40, gap: 9, fontSize: 12, borderRadius: 8,
            background: selectedCategory === null ? '#111114' : 'transparent',
            color: selectedCategory === null ? '#fff' : '#666',
            fontWeight: selectedCategory === null ? 600 : 400,
          }}
        >
          <span className="flex items-center" style={{ gap: 9 }}>
            <Layers size={16} />
            全部 Skills
          </span>
          <span style={{ fontSize: 12, color: selectedCategory === null ? 'rgba(255,255,255,0.6)' : '#96979F' }}>{totalCount}</span>
        </button>

        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(selectedCategory === cat.name ? null : cat.name)}
            className="w-full flex items-center justify-between transition-all"
            style={{
              padding: '0 10px', height: 40, gap: 9, fontSize: 12, borderRadius: 8,
              background: selectedCategory === cat.name ? '#111114' : 'transparent',
              color: selectedCategory === cat.name ? '#fff' : '#666',
              fontWeight: selectedCategory === cat.name ? 600 : 400,
            }}
          >
            <span className="flex items-center truncate" style={{ gap: 9 }}>
              <span className="shrink-0"><CategoryIcon name={cat.name} size={16} /></span>
              <span className="truncate">{cat.name}</span>
            </span>
            <span className="shrink-0 ml-1" style={{ fontSize: 12, color: selectedCategory === cat.name ? 'rgba(255,255,255,0.6)' : '#96979F' }}>{cat.count}</span>
          </button>
        ))}

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="w-full text-center text-xs py-2 transition-colors"
            style={{ color: '#111114' }}
          >
            清除筛选
          </button>
        )}
      </nav>
    </aside>
  )
}
