// SVG path data for the 16x16 line icons rendered by Icon.svelte.
export const icons = {
  doc: 'M3 1h7l3 3v11H3z M10 1v3h3 M5 7h6 M5 9h6 M5 11h4',
  folder: 'M1 3h5l2 2h7v9H1z',
  chip: 'M4 4h8v8H4z M6 1v3 M10 1v3 M6 12v3 M10 12v3 M1 6h3 M1 10h3 M12 6h3 M12 10h3',
  disk: 'M2 2h10l2 2v10H2z M5 2v4h6V2 M4 14V9h8v5',
  star: 'M8 1l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z',
  case: 'M1 5h14v9H1z M5 5V2h6v3 M1 9h14',
  branch: 'M4 1v14 M12 1v3.5 M12 4.5c0 4-8 3-8 7.5 M2.5 13.5h3 M10.5 3h3',
  grid: 'M1 2h14v12H1z M1 6h14 M1 10h14 M5.7 2v12 M10.3 2v12',
  term: 'M1 2h14v12H1z M4 6l2 2-2 2 M8 10h4',
  save: 'M8 1v9 M4 6l4 4 4-4 M2 13h12',
  power: 'M8 1v7 M4.5 3.5a6 6 0 1 0 7 0',
} as const;

export type IconName = keyof typeof icons;
