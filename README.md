# Mehedi Hasan · Retro OS Resume

An interactive resume styled as a CRT-green retro operating system. Built with Svelte 5,
TypeScript and Vite.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run check    # type and Svelte checks
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

`dist/` is a plain static site; host it on GitHub Pages, Netlify, Vercel or any web server.

## Update the content

All resume content is in `src/lib/resume.ts`. Desktop icons and their order are in
`src/lib/apps.ts`.

## Resume download

The download button serves `public/Mehedi_Hasan_Resume.pdf` when that file exists. Without it,
the button opens the print dialog on a plain print layout, which can be saved as a PDF.

## Shortcuts

- `1`–`7` open a window
- `terminal.exe` accepts commands; type `help`

## GitHub data

Star counts, languages and last-updated dates are fetched live from GitHub's public API for the
user in `profile.github` (`src/lib/resume.ts`). If the request fails, those lines simply don't
appear. Set `profile.github` to `''` to switch it off.
- `Esc` closes the focused window
- Drag a title bar to move a window
