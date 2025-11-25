# Scheduling Seminar Website

This repository contains the source for the **Scheduling Seminar** website, built with [Astro](https://astro.build) and Tailwind CSS. It lists upcoming and past talks, shows the program committee, and links to videos, slides, and other resources.

## Getting started

From the project root:

- Install dependencies: `npm install`
- Start the dev server: `npm run dev` (usually at `http://localhost:4321`)
- Build for production: `npm run build`
- Preview the build: `npm run preview`

## Content and data

- Talks are stored as JSON under `src/content/talks` and loaded via Astro content collections.
- PDF slides live in `public/presentations`.
- Program committee members are defined in `src/data/committee.json`.
- Speaker photos and other images are in `src/assets/photos`.

There is a simple admin UI at `/admin` powered by Decap CMS for editing talks.
