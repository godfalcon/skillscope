export const CATEGORIES = {
  'UI设计': '界面、体验、设计系统与视觉质量工作流',
  '编程开发': '开发、调试、评审、测试、架构与工程交付',
  '办公效率': '文档、表格、邮件、日历、笔记与个人生产力',
  '内容创作': '图片、视频、演示、写作、音频与社交内容生产',
  '数据分析': 'SQL、数据处理、统计、可视化与商业分析',
  '研究学习': '科研、知识检索、文献、教学、学习与推理工作流',
  '自动化': '浏览器、网页抓取、工具集成与重复流程自动化',
  '安全': '安全审计、漏洞研究、威胁分析与合规',
  '记忆与上下文': '长期记忆、RAG、上下文压缩、知识图谱与检索',
  'Agent工具与平台': 'Agent 客户端、模型切换、网关、运行环境与编排平台',
  '产品与商业': '产品管理、营销增长、销售、金融与商业工作流',
  '技能开发': '创建、验证、安装、管理与分发 Skills 的基础设施',
  '技能合集': '官方或社区维护的 Skills、插件与资源目录',
  '其他': '尚未归入主要类别的实用项目',
}

const ALIAS = {
  '官方合集': '技能合集',
  '技能框架': '技能开发',
  '编程工程': '编程开发',
  '研究知识': '研究学习',
  '效率工具': '办公效率',
  '智能体平台': 'Agent工具与平台',
  'Agent平台': 'Agent工具与平台',
}

const RULES = [
  ['技能合集', /awesome|collection|directory|marketplace|registry|catalog|curated list|skill library/i, 20],
  ['UI设计', /\bui\b|\bux\b|ui.?ux|design system|visual design|web design|figma|wireframe/i, 9],
  ['安全', /cybersecurity|security audit|vulnerab|pentest|threat|malware|forensic|owasp|red team/i, 9],
  ['记忆与上下文', /long.?term memory|persistent memory|agent memory|context management|knowledge graph|\brag\b|retrieval/i, 9],
  ['自动化', /browser automation|web automation|scrap|crawl|workflow automation|rpa|web.?pilot|computer use/i, 9],
  ['数据分析', /data analy|analytics|business intelligence|\bbi\b|sql|statistics|visualization|dashboard/i, 8],
  ['内容创作', /image generation|video|slides?|ppt|presentation|writing|copywriting|social media|audio|podcast/i, 8],
  ['产品与商业', /product management|marketing|growth|seo|sales|finance|business|startup/i, 8],
  ['研究学习', /research|scientific|academic|paper|literature|notebooklm|deep research|learning|education/i, 7],
  ['办公效率', /office|productivity|workspace|obsidian|notion|calendar|gmail|email|document|pdf/i, 7],
  ['编程开发', /software development|coding|codebase|developer|engineering|debug|testing|code review|refactor/i, 7],
  ['技能开发', /skill creator|skill generator|skill builder|skill validator|skill installer|skill manager/i, 11],
  ['Agent工具与平台', /agent platform|agent framework|multi.?agent|agent runtime|agent orchestr|model switch|model gateway/i, 9],
]

function textOf(repo) {
  const topics = repo.topics || repo.repoTopics || []
  return `${repo.full_name || repo.fullName || ''} ${repo.name || ''} ${(repo.description || '').trim()} ${topics.join(' ')}`
}

export function classify(repo, override) {
  const text = textOf(repo)

  if (override?.category) {
    const cat = ALIAS[override.category] || override.category
    if (CATEGORIES[cat]) return { category: cat, confidence: '高', reason: '精选项目人工指定' }
  }

  const scores = Object.fromEntries(Object.keys(CATEGORIES).map(k => [k, 0]))
  for (const [cat, pattern, weight] of RULES) {
    if (pattern.test(text)) scores[cat] += weight
  }
  if (/skills?/i.test(text) && scores['Agent工具与平台'] <= 4) scores['Agent工具与平台'] = 0

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [best, bestScore] = sorted[0]
  const runnerUp = sorted[1][1]

  if (bestScore === 0) return { category: '其他', confidence: '低', reason: '无明确分类信号' }
  return {
    category: best,
    confidence: bestScore >= 10 && bestScore - runnerUp >= 3 ? '高' : bestScore >= 6 ? '中' : '低',
    reason: RULES.find(([c]) => c === best)?.[1].source.slice(0, 50) || 'topic 信号',
  }
}

export function scenariosFor(category) {
  const map = {
    'UI设计': ['界面设计', '设计系统', '体验质量检查'],
    '编程开发': ['软件开发', '代码质量', '工程自动化'],
    '办公效率': ['文档与表格', '邮件与日历', '个人生产力'],
    '内容创作': ['内容生产', '视觉创作', '多媒体工作流'],
    '数据分析': ['数据处理', 'SQL 与表格', '分析与可视化'],
    '研究学习': ['资料调研', '知识检索', '学习与推理'],
    '自动化': ['重复任务', '浏览器操作', '跨工具集成'],
    '安全': ['代码审计', '漏洞研究', '安全合规'],
    '技能合集': ['发现新技能', '按领域选型', '构建个人技能库'],
    '技能开发': ['创建技能', '组织工作流', '扩展 Agent 能力'],
    '记忆与上下文': ['长期任务', '跨会话续接', '上下文管理'],
    'Agent工具与平台': ['模型与客户端管理', 'Agent 编排', '多平台协作'],
    '产品与商业': ['产品管理', '营销增长', '商业决策'],
    '其他': ['能力探索', '流程扩展', '开源工具试用'],
  }
  return map[category] || map['其他']
}

export function usageFor(category) {
  if (category === '技能合集') return '先在仓库目录中选择目标 Skill，再按 README 将对应目录复制或安装到你的 Agent Skills 目录。'
  if (category === '技能开发') return '按 README 安装工具或 CLI，使用其命令创建、验证、安装或管理 Skills。'
  if (category === 'Agent工具与平台') return '按 README 安装客户端或服务，配置模型提供商与凭据后，在对应界面或命令行使用。'
  return '阅读仓库 README 的安装要求，将 Skill、插件或工具接入对应环境，再按文档触发工作流。'
}

export function summaryFor(repo, category, override) {
  if (override?.summary) return override.summary
  const desc = ((repo.description || '') + '').trim()
  if (/[㐀-鿿]/.test(desc)) {
    const cleaned = desc.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 120)
    if (/[㐀-鿿]/.test(cleaned)) return cleaned
  }
  const n = repo.name || ''
  const fallback = {
    '技能合集': `${n} 汇总相关 Skills、插件与社区资源，方便集中发现和选型。`,
    '编程开发': `${n} 聚焦软件开发、代码质量与工程交付。`,
    'UI设计': `${n} 帮助改进界面设计、用户体验与视觉质量。`,
    '安全': `${n} 聚焦安全审计、漏洞检查与风险治理。`,
    '研究学习': `${n} 支持资料研究、知识检索或学习任务。`,
    '记忆与上下文': `${n} 提供记忆、上下文管理或知识检索能力。`,
    '自动化': `${n} 用于自动化浏览器、工具集成或重复流程。`,
    'Agent工具与平台': `${n} 是用于运行、管理或编排 AI Agent 的开源工具。`,
    '技能开发': `${n} 用于创建、验证、安装或管理 Agent Skills。`,
  }
  return fallback[category] || `${n}：${CATEGORIES[category] || CATEGORIES['其他']}。`
}
