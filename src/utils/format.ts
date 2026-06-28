export function formatStars(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  return String(n)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天更新'
  if (days === 1) return '1 天前更新'
  if (days < 7) return `${days} 天前更新`
  if (days < 30) return `${Math.floor(days / 7)} 周前更新`
  if (days < 365) return `${Math.floor(days / 30)} 个月前更新`
  return `${Math.floor(days / 365)} 年前更新`
}

export function getActivityColor(activity: string): string {
  if (activity.includes('本周')) return 'text-emerald-700 bg-emerald-50'
  if (activity.includes('本月') || activity.includes('近期')) return 'text-sky-700 bg-sky-50'
  return 'text-gray-500 bg-gray-100'
}

export function getCategoryIcon(name: string): string {
  const map: Record<string, string> = {
    'UI设计': '🎨',
    '编程开发': '💻',
    '办公效率': '📋',
    '内容创作': '✏️',
    '数据分析': '📊',
    '研究学习': '🔬',
    '自动化': '⚙️',
    '安全': '🔒',
    '记忆与上下文': '🧠',
    'Agent工具与平台': '🤖',
    '产品与商业': '💼',
    '技能开发': '🔧',
    '技能合集': '📦',
    '其他': '📌',
  }
  return map[name] || '📌'
}
