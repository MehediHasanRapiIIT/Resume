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

- `1`–`9` open a window
- `terminal.exe` accepts commands; type `help` (try `neofetch`)

## Windows

| Window | What it shows |
|---|---|
| `about.txt` … `contact.sh` | Resume content from `src/lib/resume.ts` |
| `github.dir` | Live repositories (search, language filter, sort, language chart) and recent public activity |
| `lab.dir` | Playable Connect-4 against a Minimax AI (runs in a Web Worker), and a BST visualizer |
| `terminal.exe` | Command line over the same content |

## GitHub data

Repositories, languages, star counts, last-updated dates and recent activity are fetched live from
GitHub's public API for the user in `profile.github` (`src/lib/resume.ts`). Responses are cached
in the visitor's session (GitHub allows 60 unauthenticated requests per hour per IP). If a
request fails, the extra lines simply don't appear. Set `profile.github` to `''` to switch it off.
- `Esc` closes the focused window
- Drag a title bar to move a window
