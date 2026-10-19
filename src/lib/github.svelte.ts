import { profile } from './resume';

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  language: string | null;
  fork: boolean;
  pushedAt: string;
  createdAt: string;
}

export interface GitHubUser {
  publicRepos: number;
  followers: number;
  createdAt: string;
}

/** One line of the activity log; consecutive same-day pushes to a repo are merged. */
export interface Activity {
  key: string;
  repo: string;
  repoUrl: string;
  label: string;
  detail: string;
  at: string;
}

export interface LanguageCount {
  name: string;
  count: number;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

const API = 'https://api.github.com';
const PAGE_SIZE = 100;
/** GitHub allows 60 unauthenticated requests per hour per visitor IP, so everything is cached. */
const PROFILE_CACHE = { key: `${profile.handle}-os:github:v2`, maxAge: 60 * 60 * 1000 };
const ACTIVITY_CACHE = { key: `${profile.handle}-os:activity:v1`, maxAge: 10 * 60 * 1000 };

/**
 * Live public data for the profile's GitHub user. Purely additive: when a request fails
 * (offline, rate limit, blocked), the status becomes 'error' and the site shows nothing extra.
 */
class GitHub {
  status = $state<Status>('idle');
  repos = $state.raw<Repo[]>([]);
  user = $state.raw<GitHubUser | null>(null);

  activityStatus = $state<Status>('idle');
  activity = $state.raw<Activity[]>([]);

  /** Exact count from the profile when available, else from the repo list. */
  repoCount = $derived(
    this.user
      ? String(this.user.publicRepos)
      : this.repos.length >= PAGE_SIZE
        ? `${PAGE_SIZE}+`
        : String(this.repos.length),
  );

  /** Repositories per language, most used first. Forks are not the owner's work, so they're skipped. */
  languages = $derived.by((): LanguageCount[] => {
    const counts = new Map<string, number>();
    for (const repo of this.repos) {
      if (repo.fork) continue;
      const name = repo.language ?? 'Other';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts]
      .map(([name, count]) => ({ name, count }))
      // "Other" (no detected language) always goes last, whatever its count.
      .sort(
        (a, b) =>
          Number(a.name === 'Other') - Number(b.name === 'Other') ||
          b.count - a.count ||
          a.name.localeCompare(b.name),
      );
  });

  async load(): Promise<void> {
    if (this.status !== 'idle' || !profile.github) return;

    const cached = readCache<{ repos: Repo[]; user: GitHubUser | null }>(PROFILE_CACHE);
    if (cached) {
      this.repos = cached.repos;
      this.user = cached.user;
      this.status = 'ready';
      return;
    }

    this.status = 'loading';
    const [repos, user] = await Promise.allSettled([
      getJson(`${API}/users/${profile.github}/repos?per_page=${PAGE_SIZE}&sort=pushed`),
      getJson(`${API}/users/${profile.github}`),
    ]);

    // The repo list is what the windows need; the profile only refines the counts.
    if (repos.status === 'rejected' || !Array.isArray(repos.value)) {
      console.warn('GitHub data unavailable:', repos.status === 'rejected' ? repos.reason : repos.value);
      this.status = 'error';
      return;
    }

    this.repos = repos.value.map(toRepo);
    this.user = user.status === 'fulfilled' ? toUser(user.value) : null;
    this.status = 'ready';
    writeCache(PROFILE_CACHE, { repos: this.repos, user: this.user });
  }

  async loadActivity(): Promise<void> {
    if (this.activityStatus !== 'idle' || !profile.github) return;

    const cached = readCache<Activity[]>(ACTIVITY_CACHE);
    if (cached) {
      this.activity = cached;
      this.activityStatus = 'ready';
      return;
    }

    this.activityStatus = 'loading';
    try {
      const events = await getJson(`${API}/users/${profile.github}/events/public?per_page=100`);
      if (!Array.isArray(events)) throw new Error('Unexpected GitHub response');
      this.activity = toActivity(events);
      this.activityStatus = 'ready';
      writeCache(ACTIVITY_CACHE, this.activity);
    } catch (err) {
      console.warn('GitHub activity unavailable:', err);
      this.activityStatus = 'error';
    }
  }

  /** The repo behind a project link such as https://github.com/user/Repo, if it was loaded. */
  repoFor(href: string): Repo | undefined {
    const name = href.replace(/\/+$/, '').split('/').pop()?.toLowerCase();
    return this.repos.find((r) => r.name.toLowerCase() === name);
  }
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${url}`);
  return res.json();
}

function toRepo(r: any): Repo {
  return {
    name: String(r.name),
    description: typeof r.description === 'string' && r.description ? r.description : null,
    url: String(r.html_url),
    homepage: typeof r.homepage === 'string' && r.homepage ? r.homepage : null,
    stars: Number(r.stargazers_count) || 0,
    language: typeof r.language === 'string' ? r.language : null,
    fork: Boolean(r.fork),
    pushedAt: String(r.pushed_at),
    createdAt: String(r.created_at),
  };
}

function toUser(u: any): GitHubUser | null {
  if (!u || typeof u !== 'object') return null;
  return {
    publicRepos: Number(u.public_repos) || 0,
    followers: Number(u.followers) || 0,
    createdAt: String(u.created_at),
  };
}

/** Turns raw public events into readable lines. Push payloads no longer carry commit counts,
 *  so pushes are counted per repo per day instead. */
function toActivity(events: any[]): Activity[] {
  const sorted = [...events].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const out: Activity[] = [];
  let pushes = 0;

  for (const e of sorted) {
    const fullName = String(e.repo?.name ?? '');
    const repo = fullName.replace(`${profile.github}/`, '');
    const repoUrl = `https://github.com/${fullName}`;
    const at = String(e.created_at);
    const p = e.payload ?? {};
    const base = { key: String(e.id), repo, repoUrl, at };

    if (e.type === 'PushEvent') {
      const branch = String(p.ref ?? '').replace('refs/heads/', '');
      const prev = out.at(-1);
      if (prev && prev.label.endsWith(`to ${repo}`) && sameDay(prev.at, at)) {
        pushes += 1;
        prev.label = `${pushes} pushes to ${repo}`;
        continue;
      }
      pushes = 1;
      out.push({ ...base, label: `pushed to ${repo}`, detail: branch });
      continue;
    }

    pushes = 0;
    const line = describe(e.type, p, repo, fullName);
    if (line) out.push({ ...base, ...line });
  }
  return out.slice(0, 40);
}

function describe(type: string, p: any, repo: string, fullName: string) {
  switch (type) {
    case 'CreateEvent':
      return p.ref_type === 'repository'
        ? { label: `created repository ${repo}`, detail: '' }
        : { label: `created ${p.ref_type} ${p.ref} in ${repo}`, detail: '' };
    case 'PublicEvent':
      return { label: `made ${repo} public`, detail: '' };
    case 'WatchEvent':
      return { label: `starred ${fullName}`, detail: '' };
    case 'ForkEvent':
      return { label: `forked ${fullName}`, detail: '' };
    case 'PullRequestEvent':
      return { label: `${p.action} a pull request in ${repo}`, detail: String(p.pull_request?.title ?? '') };
    case 'IssuesEvent':
      return { label: `${p.action} an issue in ${repo}`, detail: String(p.issue?.title ?? '') };
    case 'ReleaseEvent':
      return { label: `released ${p.release?.tag_name ?? ''} of ${repo}`, detail: '' };
    default:
      return null;
  }
}

function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function readCache<T>({ key, maxAge }: { key: string; maxAge: number }): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: T };
    return Date.now() - at < maxAge ? data : null;
  } catch {
    return null;
  }
}

function writeCache(cache: { key: string }, data: unknown): void {
  try {
    sessionStorage.setItem(cache.key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage can be blocked; the data is simply fetched again next visit.
  }
}

/** "Mar 2026" */
export function formatMonth(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

/** "5 min ago", "3 h ago", "2 days ago", then a plain date. */
export function relativeTime(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(seconds)) return '';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 86400 * 30) {
    const days = Math.floor(seconds / 86400);
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export const github = new GitHub();
