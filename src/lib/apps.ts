import type { Component } from 'svelte';
import type { IconName } from './icons';
import About from './windows/About.svelte';
import Experience from './windows/Experience.svelte';
import Projects from './windows/Projects.svelte';
import Skills from './windows/Skills.svelte';
import Education from './windows/Education.svelte';
import Contact from './windows/Contact.svelte';
import Terminal from './windows/Terminal.svelte';
import GitHub from './windows/GitHub.svelte';
import Lab from './windows/Lab.svelte';

export type AppId =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'contact'
  | 'github'
  | 'lab'
  | 'terminal';

export interface AppDef {
  id: AppId;
  /** Retro file name shown under the desktop icon and in the title bar. */
  file: string;
  title: string;
  icon: IconName;
  component: Component;
  /** Preferred window size in px; clamped to the viewport. */
  w: number;
  h: number;
}

// Order here is the desktop order and the number-key order (1 = first).
export const apps: AppDef[] = [
  { id: 'about', file: 'about.txt', title: 'About', icon: 'doc', component: About, w: 600, h: 470 },
  {
    id: 'experience',
    file: 'experience.log',
    title: 'Experience',
    icon: 'case',
    component: Experience,
    w: 760,
    h: 480,
  },
  {
    id: 'projects',
    file: 'projects.dir',
    title: 'Projects',
    icon: 'folder',
    component: Projects,
    w: 860,
    h: 560,
  },
  { id: 'skills', file: 'skills.cfg', title: 'Skills', icon: 'chip', component: Skills, w: 620, h: 460 },
  {
    id: 'education',
    file: 'education.dat',
    title: 'Education',
    icon: 'disk',
    component: Education,
    w: 560,
    h: 420,
  },
  {
    id: 'contact',
    file: 'contact.sh',
    title: 'Contact',
    icon: 'star',
    component: Contact,
    w: 520,
    h: 400,
  },
  {
    id: 'github',
    file: 'github.dir',
    title: 'GitHub',
    icon: 'branch',
    component: GitHub,
    w: 820,
    h: 580,
  },
  {
    id: 'lab',
    file: 'lab.dir',
    title: 'Lab',
    icon: 'grid',
    component: Lab,
    w: 820,
    h: 640,
  },
  {
    id: 'terminal',
    file: 'terminal.exe',
    title: 'Terminal',
    icon: 'term',
    component: Terminal,
    w: 680,
    h: 460,
  },
];

export function appById(id: AppId): AppDef {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
