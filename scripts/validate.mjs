import { readFile } from 'node:fs/promises'
import { CATEGORIES } from './classify.mjs'

const data = JSON.parse(await readFile(new URL('../public/data/skills.json', import.meta.url), 'utf8'))

let errors = 0
function check(ok, msg) {
  if (!ok) { console.error(`✗ ${msg}`); errors++ }
}

check(Array.isArray(data.skills), 'skills must be an array')
check(data.skills.length >= 500, `expected ≥500 repos, got ${data.skills.length}`)
check(data.meta.repositories === data.skills.length, 'meta.repositories must match skills count')
check(Array.isArray(data.categories) && data.categories.length >= 10, 'need ≥10 categories')
check(Array.isArray(data.topics) && data.topics.length >= 5, 'need ≥5 topics')

const catNames = new Set(data.categories.map(c => c.name))
for (const name of Object.keys(CATEGORIES)) {
  if (name === '其他') continue
  check(catNames.has(name), `missing category: ${name}`)
}

const seen = new Set()
for (const s of data.skills) {
  const key = s.fullName.toLowerCase()
  check(!seen.has(key), `duplicate: ${s.fullName}`)
  seen.add(key)
  check(/^https:\/\/github\.com\//.test(s.url), `bad url: ${s.fullName}`)
  check(typeof s.stars === 'number' && s.stars >= 0, `bad stars: ${s.fullName}`)
  check(catNames.has(s.category), `unknown category "${s.category}" for ${s.fullName}`)
  check(Array.isArray(s.platforms) && s.platforms.length > 0, `no platforms: ${s.fullName}`)
  check(typeof s.installCommand === 'string' && s.installCommand.length > 0, `no install cmd: ${s.fullName}`)
  check(/[㐀-鿿]/.test(s.summary), `summary needs Chinese: ${s.fullName}`)
}

const mustHave = ['anthropics/skills', 'nvidia/skills', 'dotnet/skills']
for (const name of mustHave) {
  check(seen.has(name.toLowerCase()), `missing required repo: ${name}`)
}

if (errors) {
  console.error(`\n${errors} validation error(s)`)
  process.exitCode = 1
} else {
  console.log(`✓ Validated ${data.skills.length} repos, ${data.categories.length} categories, ${data.topics.length} topics`)
}
