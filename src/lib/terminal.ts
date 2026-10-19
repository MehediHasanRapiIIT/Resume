import type { AppId } from './apps';
import { formatMonth, github } from './github.svelte';
import { contacts, education, experience, moreProjects, profile, projects, skills } from './resume';
import type { AppMeta } from './wm.svelte';

/** What a command prints, plus any side effect the terminal window should carry out. */
export interface CommandResult {
  lines: string[];
  open?: AppId;
  clear?: boolean;
  download?: boolean;
}

export interface RunOptions {
  /** True when the terminal is too narrow for side-by-side neofetch output. */
  narrow?: boolean;
}

const HELP = [
  'Available commands:',
  '  whoami        who this is',
  '  neofetch      system summary',
  '  experience    work history',
  '  projects      project list',
  '  skills        skills by group',
  '  education     degrees',
  '  contact       how to reach me',
  '  github        live GitHub numbers',
  '  play          open the lab (Connect-4, BST)',
  '  ls            list files on the desktop',
  '  open <file>   open a window, e.g. open projects',
  '  cat <file>    print a file, e.g. cat skills.cfg',
  '  download      get the resume',
  '  date          current date and time',
  '  clear         clear the screen',
];

/** Each printable section, keyed by the app id it mirrors. */
const sections: Partial<Record<AppId, () => string[]>> = {
  about: () => [
    `${profile.name} — ${profile.title}`,
    profile.location,
    '',
    profile.tagline,
    '',
    `Stack: ${profile.stack.join(', ')}`,
  ],
  experience: () =>
    experience.flatMap((job) => [
      `${job.role} @ ${job.company}`,
      `  ${job.period} · ${job.tech.join(', ')}`,
    ]),
  projects: () => [
    'Featured',
    ...projects.flatMap((p, i) => [`${i + 1}. ${p.name}`, `   ${p.href.replace('https://', '')}`]),
    '',
    'More',
    ...moreProjects.map((p, i) => `${projects.length + i + 1}. ${p.name}`),
    '',
    "Type 'open projects' for the details.",
  ],
  skills: () => skills.map((group) => `${group.label}: ${group.items.join(', ')}`),
  education: () =>
    [education, ...education.earlier].map(
      (s) => `${s.degree}, ${s.school} (${s.period}) · ${s.result}`,
    ),
  contact: () => [
    ...contacts.map((c) => `${c.label.padEnd(9)} ${c.value}`),
    `${'LOCATION'.padEnd(9)} ${profile.location}`,
  ],
};

function githubLines(): string[] {
  if (github.status === 'loading' || github.status === 'idle') return ['Still fetching from GitHub…'];
  if (github.status === 'error') return ['GitHub data is unavailable right now.'];
  const lines = [`${profile.github}: ${github.repoCount} public repositories`, ''];
  for (const project of projects) {
    const repo = github.repoFor(project.href);
    if (!repo) continue;
    const parts = [repo.stars > 0 ? `★ ${repo.stars}` : '', repo.language, `updated ${formatMonth(repo.pushedAt)}`];
    lines.push(`${project.name}`, `  ${parts.filter(Boolean).join(' · ')}`);
  }
  return lines;
}

const LOGO = [
  '█▄     ▄█',
  '██▄   ▄██',
  '██ ▀▄▀ ██',
  '██     ██',
  '██     ██',
  '▀▀     ▀▀',
];

/** When this page was opened, for the "Uptime" line. */
const bootedAt = Date.now();

function uptime(): string {
  const minutes = Math.floor((Date.now() - bootedAt) / 60000);
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function neofetchLines(narrow: boolean): string[] {
  const title = `${profile.handle}@os`;
  const info = [
    title,
    '-'.repeat(title.length),
    `OS: ${profile.handle.toUpperCase()}-OS (Svelte 5)`,
    `Role: ${profile.title}`,
    `Host: ${experience[0].company}`,
    `Location: ${profile.location}`,
    `Stack: ${profile.stack.join(', ')}`,
    `Projects: ${projects.length + moreProjects.length}`,
  ];
  if (github.status === 'ready') {
    info.push(`Repos: ${github.repoCount} public`);
    const top = github.languages
      .filter((l) => l.name !== 'Other')
      .slice(0, 3)
      .map((l) => `${l.name} ${l.count}`);
    if (top.length) info.push(`Languages: ${top.join(', ')}`);
    if (github.user) info.push(`On GitHub since: ${formatMonth(github.user.createdAt)}`);
  }
  info.push(`Uptime: ${uptime()}`);

  // Narrow screens get the logo above the details; wide ones get the classic side-by-side.
  if (narrow) return [...LOGO, '', ...info];
  const width = Math.max(...LOGO.map((l) => l.length)) + 3;
  return Array.from({ length: Math.max(LOGO.length, info.length) }, (_, i) =>
    `${(LOGO[i] ?? '').padEnd(width)}${info[i] ?? ''}`.trimEnd(),
  );
}

/** Matches "projects", "Projects" or "projects.dir" to an installed app. */
function findApp(name: string, catalog: AppMeta[]): AppMeta | undefined {
  const wanted = name.toLowerCase();
  return catalog.find(
    (a) => a.id === wanted || a.file.toLowerCase() === wanted || a.title.toLowerCase() === wanted,
  );
}

export function run(input: string, catalog: AppMeta[], options: RunOptions = {}): CommandResult {
  const [command = '', ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(' ');

  switch (command.toLowerCase()) {
    case 'help':
    case '?':
      return { lines: HELP };
    case 'whoami':
      return { lines: sections.about!() };
    case 'github':
      return { lines: githubLines() };
    case 'neofetch':
      return { lines: neofetchLines(options.narrow ?? false) };
    case 'play':
    case 'lab':
      return { lines: ['Opening lab.dir…'], open: 'lab' };
    case 'ls':
    case 'dir':
      return { lines: catalog.map((a) => a.file) };
    case 'date':
      return { lines: [new Date().toLocaleString()] };
    case 'clear':
    case 'cls':
      return { lines: [], clear: true };
    case 'download':
    case 'resume':
      return { lines: ['Preparing resume…'], download: true };
    case 'open': {
      if (!arg) return { lines: ['Usage: open <file>   (try: ls)'] };
      const app = findApp(arg, catalog);
      return app
        ? { lines: [`Opening ${app.file}…`], open: app.id }
        : { lines: [`open: ${arg}: no such file. Type 'ls' to list files.`] };
    }
    case 'cat': {
      if (!arg) return { lines: ['Usage: cat <file>   (try: ls)'] };
      const app = findApp(arg, catalog);
      const print = app && sections[app.id];
      if (print) return { lines: print() };
      return { lines: [app ? `cat: ${app.file}: is a program` : `cat: ${arg}: no such file`] };
    }
    default: {
      // Bare section names work too: "skills" is the same as "cat skills.cfg".
      const app = findApp(command, catalog);
      const print = app && sections[app.id];
      if (print) return { lines: print() };
      return { lines: [`${command}: command not found. Type 'help' for the list.`] };
    }
  }
}
