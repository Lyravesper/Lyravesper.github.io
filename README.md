# Lyravesper.github.io

Personal portfolio site for Aurélie Chu, cultural mediator and heritage assistant (*Médiatrice Culturelle & Adjointe du Patrimoine*). Single-page site presenting a profile, project history, career timeline, and personal interests. Built with Next.js and exported as a static site for GitHub Pages.

## Stack

- Next.js 16 (App Router), configured for static export (`output: 'export'`)
- React 19, TypeScript
- Tailwind CSS 4
- shadcn/ui component set (Radix UI primitives)
- Deployed via GitHub Actions to GitHub Pages

## Requirements

- Node.js 20.9.0 or later
- npm (ships with Node)

No other system dependencies are required. All packages install into a local `node_modules/` directory inside the project; nothing is installed globally or touches the OS. Deleting `node_modules/` and `.next/` (or `out/`) removes every trace of the install.

## Installation

```
git clone https://github.com/Lyravesper/Lyravesper.github.io.git
cd Lyravesper.github.io
npm install
```

## Getting Started

Run the development server:

```
npm run dev
```

The site is served at `http://localhost:3000` with hot reload on file changes.


### Optional (build)
Build the production static export:

```
npm run build
```

Output is written to `out/`. To preview the exact static build that ships to production:

```
npx serve out
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies, runs `npm run build`, and publishes the `out/` directory to GitHub Pages. The repository's GitHub Pages source (Settings > Pages) must be set to "GitHub Actions" for this to take effect; this is a one-time setting, not something the workflow configures itself.

Go to https://github.com/Lyravesper/Lyravesper.github.io/settings/pages

Under Build and deployment → Source, change the dropdown from "Deploy from a branch" (or whatever it's on) to "GitHub Actions"

## Credits

Code written by @GitGudShu.
