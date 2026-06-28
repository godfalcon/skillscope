import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, classify, scenariosFor, summaryFor, usageFor } from './classify.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'data')

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
if (!TOKEN) console.warn('⚠ No GITHUB_TOKEN — rate limit is 10 req/min for unauthenticated calls')

const API = 'https://api.github.com'
const MAX_REPOS = 1500
const README_BUDGET = 850

const TRACKED_TOPICS = [
  'agent-skills', 'claude-skills', 'codex-skills', 'openclaw-skills',
  'ai-skills', 'agentic-skills', 'claude-code-skills', 'claude-code-skill',
  'mcp-skills', 'karpathy-skills', 'ai-agent-skills', 'skill', 'skills',
]

const SEARCH_QUERIES = [
  '"SKILL.md" in:readme archived:false fork:false stars:>20',
  '"agent skills" in:name,description,readme archived:false fork:false stars:>20',
  '"claude skills" in:name,description,readme archived:false fork:false stars:>20',
  '"codex skills" in:name,description,readme archived:false fork:false stars:>10',
  '"AI skills" in:name,description archived:false fork:false stars:>20',
]

const PINNED = [
  'anthropics/skills', 'obra/superpowers', 'addyosmani/agent-skills',
  'thedotmack/claude-mem', 'VoltAgent/awesome-agent-skills',
  'sickn33/antigravity-awesome-skills', 'nvidia/skills', 'dotnet/skills',
  'garrytan/gstack', 'mattpocock/skills', 'googleworkspace/cli',
  'KKKKhazix/Khazix-Skills', 'alchaincyf/karpathy-skill',
  'VoltAgent/awesome-openclaw-skills', 'ComposioHQ/awesome-codex-skills',
]

const PINNED_META = {
  'anthropics/skills': { summary: 'Agent Skills 公共仓库、规范示例与参考实现', category: '技能合集' },
  'obra/superpowers': { summary: '一套面向智能体的软件开发方法与技能框架', category: '编程开发' },
  'thedotmack/claude-mem': { summary: '为多种 Agent 提供跨会话持久上下文与相关记忆检索', category: '记忆与上下文' },
  'garrytan/gstack': { summary: '覆盖产品、设计、工程、发布与质量保障的完整 Claude Code 工作栈', category: '产品与商业' },
  'nvidia/skills': { summary: 'NVIDIA 官方维护并验证的 Agent Skills 目录', category: '技能合集' },
  'dotnet/skills': { summary: '.NET 团队为 C# 与 .NET 编程智能体维护的官方技能', category: '编程开发' },
  'googleworkspace/cli': { summary: '统一操作 Drive、Gmail、Calendar、Sheets 与 Docs，并提供 Agent Skills', category: '办公效率' },
}

const ACTIVE_CUTOFF = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10)
const STAR_RANGES = ['500..999', '1000..1999', '2000..4999', '5000..9999', '>=10000']

// --- GitHub API helpers ---

let lastSearchTs = 0
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function gh(pathname, isSearch = false) {
  if (isSearch) {
    const gap = 2200 - (Date.now() - lastSearchTs)
    if (gap > 0) await sleep(gap)
    lastSearchTs = Date.now()
  }
  const res = await fetch(`${API}${pathname}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'skillscope-indexer',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  })
  if (res.status === 403 && res.headers.get('x-ratelimit-reset')) {
    const wait = Math.max(1000, Number(res.headers.get('x-ratelimit-reset')) * 1000 - Date.now() + 1500)
    console.log(`Rate limited — waiting ${Math.ceil(wait / 1000)}s`)
    await sleep(wait)
    return gh(pathname, isSearch)
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${pathname}`)
  return res.json()
}

// --- Repo collection ---

function isRelevant(repo, topics, channels) {
  if (channels.has('pinned')) return true
  const blob = [repo.name, repo.full_name, repo.description, ...(repo.topics || [])].join(' ')
  if (/skill/i.test(repo.name)) return true
  if ((repo.topics || []).some(t => /(?:^|-)skills?(?:-|$)/i.test(t))) return true
  if (/(?:agent|claude|codex|copilot|gemini|openclaw).{0,60}skills?/i.test(blob)) return true
  if (/skills?.{0,60}(?:agent|claude|codex|copilot|gemini|openclaw)/i.test(blob)) return true
  if (channels.has('high-star') && /agent|ai|llm|claude|codex|copilot|gemini|mcp|prompt/i.test(blob)) return true
  const hasTrusted = [...topics].some(t => !['skill', 'skills'].includes(t))
  return hasTrusted && /agent|claude|codex|skill/i.test(blob)
}

// --- README extraction ---

function decodeReadme(payload) {
  if (!payload?.content || payload.encoding !== 'base64') return ''
  return Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8')
}

function extractInstall(md, fallback) {
  const blocks = [...md.matchAll(/```(?:bash|sh|shell|zsh|console)?\s*\n([\s\S]{1,1200}?)```/gi)]
  const hit = blocks.map(m => m[1].trim()).find(b =>
    /(?:git clone|npx |bunx |pnpm |npm |pip install|brew install|skills? add|claude plugin)/i.test(b)
  )
  if (!hit) return fallback
  return hit.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).slice(0, 3).join('\n').slice(0, 360) || fallback
}

function extractVideo(md) {
  const m = md.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|bilibili\.com\/video\/|vimeo\.com\/|loom\.com\/share\/)\S+/i)
  return m?.[0] || ''
}

function detectPlatforms(repo, md) {
  const blob = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')} ${md.slice(0, 12000)}`
  const hits = [
    ['Claude', /claude/i], ['Codex', /codex/i], ['Cursor', /cursor/i],
    ['Gemini CLI', /gemini/i], ['GitHub Copilot', /copilot/i],
    ['OpenClaw', /openclaw/i], ['OpenCode', /opencode/i],
  ].filter(([, re]) => re.test(blob)).map(([n]) => n)
  return hits.length ? hits.slice(0, 6) : ['Agent Skills']
}

function countSkills(md) {
  const nums = [...md.matchAll(/\b([\d,]{1,6})\+?\s+(?:agent\s+)?skills?/gi)]
    .map(m => Number(m[1].replaceAll(',', '')))
    .filter(v => v > 1 && v < 100000)
  return nums.length ? Math.max(...nums) : 1
}

// --- Scoring ---

function daysSince(iso) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

function activityLabel(pushedAt) {
  const d = daysSince(pushedAt)
  if (d <= 7) return { label: '本周活跃', pts: 30 }
  if (d <= 30) return { label: '本月活跃', pts: 23 }
  if (d <= 90) return { label: '近期活跃', pts: 15 }
  if (d <= 365) return { label: '活跃', pts: 7 }
  return { label: '低活跃', pts: 0 }
}

function computeScore(repo, topicCount) {
  const act = activityLabel(repo.pushed_at).pts
  const star = Math.log10(repo.stargazers_count + 10) * 24
  const topicBonus = Math.min(16, topicCount * 4)
  const nameBonus = /skill/i.test(`${repo.name} ${repo.description || ''}`) ? 8 : 0
  return Math.round((act + star + topicBonus + nameBonus) * 10) / 10
}

// --- Main pipeline ---

async function main() {
  const repos = new Map()
  const add = (repo, topic, channel) => {
    const key = repo.full_name.toLowerCase()
    const cur = repos.get(key)
    if (cur) {
      if (topic) cur.topics.add(topic)
      if (channel) cur.channels.add(channel)
      return
    }
    repos.set(key, { repo, topics: new Set(topic ? [topic] : []), channels: new Set(channel ? [channel] : []) })
  }

  // 1. Discover topic pages
  console.log('Discovering GitHub topic pages…')
  const topicPages = []
  for (let p = 1; p <= 3; p++) {
    const data = await gh(`/search/topics?q=skill&per_page=10&page=${p}`, true)
    topicPages.push({
      page: p,
      topics: data.items.map(t => ({
        name: t.name,
        displayName: t.display_name || t.name,
        description: t.short_description || '',
        url: `https://github.com/topics/${t.name}`,
      })),
    })
  }

  const discoveredTopics = topicPages.flatMap(p => p.topics.map(t => t.name))
  const isRelevantTopic = n => /skill|agent|claude|codex|openclaw|hermes/i.test(n) &&
    !/alexa|portfolio|education|leetcode|advent|sports|interview|publishing/i.test(n)
  const allTopics = [...new Set([...TRACKED_TOPICS, ...discoveredTopics.filter(isRelevantTopic)])]

  // 2. Collect from topics
  console.log(`Collecting from ${allTopics.length} topics…`)
  for (const topic of allTopics) {
    const perPage = TRACKED_TOPICS.includes(topic) ? 100 : 30
    const data = await gh(`/search/repositories?q=topic:${encodeURIComponent(topic)}+archived:false+fork:false&sort=stars&order=desc&per_page=${perPage}`, true)
    for (const r of data.items) add(r, topic, 'topics')
  }

  // 3. Focused searches
  console.log(`Running ${SEARCH_QUERIES.length} focused searches…`)
  for (const q of SEARCH_QUERIES) {
    const data = await gh(`/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=100`, true)
    for (const r of data.items) add(r, '', 'search')
  }

  // 4. High-star active repos
  console.log(`Collecting high-star repos pushed since ${ACTIVE_CUTOFF}…`)
  for (const range of STAR_RANGES) {
    for (let p = 1; p <= 4; p++) {
      const q = `skill in:name,description,readme stars:${range} pushed:>=${ACTIVE_CUTOFF} archived:false fork:false`
      const data = await gh(`/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=100&page=${p}`, true)
      for (const r of data.items) add(r, '', 'high-star')
      if (data.items.length < 100) break
    }
  }

  // 5. Pinned repos
  console.log(`Adding ${PINNED.length} pinned sources…`)
  for (let i = 0; i < PINNED.length; i += 8) {
    const batch = PINNED.slice(i, i + 8)
    const results = await Promise.all(batch.map(async name => {
      try { return await gh(`/repos/${name}`) }
      catch { console.warn(`Skipped pinned: ${name}`); return null }
    }))
    for (const r of results) if (r) add(r, '', 'pinned')
  }

  // 6. Filter, score, rank
  const ranked = [...repos.values()]
    .filter(({ repo, topics, channels }) => isRelevant(repo, topics, channels))
    .map(item => ({ ...item, score: computeScore(item.repo, item.topics.size) }))
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count)

  const deduped = [...new Map([
    ...ranked.slice(0, MAX_REPOS),
    ...ranked.filter(i => i.channels.has('pinned')),
  ].map(i => [i.repo.full_name.toLowerCase(), i])).values()]
    .sort((a, b) => b.score - a.score || b.repo.stargazers_count - a.repo.stargazers_count)

  console.log(`${deduped.length} repos after filtering and dedup`)

  // 7. README enrichment
  const readmeTargets = [...new Map([
    ...deduped.filter(i => i.channels.has('pinned')),
    ...deduped,
  ].map(i => [i.repo.full_name.toLowerCase(), i])).values()].slice(0, README_BUDGET)

  console.log(`Enriching ${readmeTargets.length}/${deduped.length} READMEs…`)
  const readmes = new Map()
  for (let i = 0; i < readmeTargets.length; i += 16) {
    const batch = readmeTargets.slice(i, i + 16)
    const results = await Promise.all(batch.map(async ({ repo }) => {
      try {
        const payload = await gh(`/repos/${repo.full_name}/readme`)
        return [repo.full_name, decodeReadme(payload)]
      } catch { return [repo.full_name, ''] }
    }))
    for (const [name, md] of results) readmes.set(name, md)
  }

  // 8. Build output
  const channelLabel = ch => {
    if (ch === 'topics') return 'GitHub Topics'
    if (ch === 'search') return 'GitHub 搜索'
    if (ch === 'high-star') return 'GitHub 高星活跃搜索'
    if (ch === 'pinned') return '精选来源'
    return ch
  }

  const skills = deduped.map(({ repo, topics, channels, score }, idx) => {
    const override = PINNED_META[repo.full_name] || {}
    const cls = classify(repo, override)
    const cat = cls.category
    const readme = readmes.get(repo.full_name) || ''
    const act = activityLabel(repo.pushed_at)

    return {
      rank: idx + 1,
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
      url: repo.html_url,
      homepage: repo.homepage || '',
      description: repo.description || '',
      summary: summaryFor(repo, cat, override),
      category: cat,
      categoryDescription: CATEGORIES[cat],
      categoryConfidence: cls.confidence,
      categoryReason: cls.reason,
      scenarios: override.scenarios || scenariosFor(cat),
      howToUse: usageFor(cat),
      installCommand: extractInstall(readme, `git clone ${repo.html_url}.git`),
      language: repo.language || '',
      license: repo.license?.spdx_id || '',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      score,
      activity: act.label,
      pushedAt: repo.pushed_at,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      sourceTopics: [...topics],
      discoveredBy: [...channels].map(channelLabel),
      repoTopics: repo.topics || [],
      platforms: detectPlatforms(repo, readme),
      skillCount: countSkills(readme),
      isCollection: cat === '技能合集' || /awesome|collection|library|marketplace|catalog/i.test(`${repo.name} ${repo.description || ''}`),
      media: {
        socialPreview: `https://opengraph.githubassets.com/1/${repo.full_name}`,
        videoUrl: extractVideo(readme),
      },
      readmeUrl: `${repo.html_url}#readme`,
    }
  })

  const categories = Object.entries(CATEGORIES)
    .map(([name, description]) => ({ name, description, count: skills.filter(s => s.category === name).length }))
    .filter(c => c.count > 0)

  const topics = allTopics
    .map(name => {
      const hits = skills.filter(s => s.sourceTopics.includes(name))
      return {
        name,
        url: `https://github.com/topics/${name}`,
        repositories: hits.length,
        activeRepositories: hits.filter(s => daysSince(s.pushedAt) <= 30).length,
        stars: hits.reduce((sum, s) => sum + s.stars, 0),
      }
    })
    .filter(t => t.repositories > 0)
    .sort((a, b) => b.repositories - a.repositories || b.stars - a.stars)

  const now = new Date().toISOString()
  const output = {
    meta: {
      generatedAt: now,
      query: 'skill',
      topicPages: 3,
      repositories: skills.length,
      sourceTopics: allTopics.length,
      discoveryChannels: 4,
      activeHighStarCutoff: ACTIVE_CUTOFF,
      readmeEnriched: readmeTargets.length,
      updateMode: 'GitHub REST API + deterministic classification',
    },
    topicPages,
    sourceTopics: allTopics.map(name => ({ name, url: `https://github.com/topics/${name}` })),
    topics,
    categories,
    skills,
  }

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(path.join(OUT_DIR, 'skills.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(`✓ Wrote ${skills.length} repos, ${categories.length} categories at ${now}`)
}

main().catch(err => { console.error(err); process.exitCode = 1 })
