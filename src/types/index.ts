export interface Skill {
  rank: number
  id: number
  name: string
  fullName: string
  owner: string
  avatarUrl: string
  url: string
  homepage: string
  description: string
  summary: string
  category: string
  categoryDescription: string
  categoryConfidence: string
  categoryReason: string
  scenarios: string[]
  howToUse: string
  installCommand: string
  language: string
  license: string
  stars: number
  forks: number
  openIssues: number
  score: number
  activity: string
  pushedAt: string
  updatedAt: string
  createdAt: string
  sourceTopics: string[]
  discoveredBy: string[]
  repoTopics: string[]
  platforms: string[]
  skillCount: number
  isCollection: boolean
  media: {
    socialPreview: string
    videoUrl: string
  }
  readmeUrl: string
}

export interface Category {
  name: string
  description: string
  count: number
}

export interface Topic {
  name: string
  url: string
  repositories: number
  activeRepositories: number
  stars: number
}

export interface SkillData {
  meta: {
    generatedAt: string
    query: string
    topicPages: number
    repositories: number
    sourceTopics: number
    discoveryChannels: number
    activeHighStarCutoff: string
    readmeEnriched: number
    updateMode: string
  }
  categories: Category[]
  topics: Topic[]
  sourceTopics: { name: string; url: string }[]
  topicPages: { page: number; topics: { name: string; displayName: string; description: string; url: string }[] }[]
  skills: Skill[]
}

export type Page = 'discover' | 'ranking' | 'categories' | 'topics' | 'auth' | 'profile'
export type SortBy = 'score' | 'stars' | 'pushedAt'
