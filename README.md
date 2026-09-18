# Speciality Reading Lists

A small site that splits into two independent reading lists, each browsed on its own:

- **Rhetoric in/of Technical Communication**
- **Queer & Critical Data Studies**

The home page just links out to each list. Once inside a list, everything
(library grid, search, book pages) is scoped to that list only — search never
crosses into the other list.

## Adding books

Each list's books live in their own JSON file:

- `src/data/books/rhetoric-tech-comm.json`
- `src/data/books/queer-critical-data-studies.json`

Each file is an array of book objects:

```json
{
  "id": "unique-slug",
  "title": "Book Title",
  "author": ["Author Name"],
  "year": 2020,
  "publisher": "Publisher",
  "tags": ["topic-tag"],
  "status": "to-read",
  "notes": "Free-text notes/summary."
}
```

`id` must be unique within its file (used in the book's URL). `status` is
free text but the sample data uses `to-read`, `reading`, `read`.

The two sample entries in each file are placeholders — replace or delete
them once you add your real lists.

## Adding a third list

1. Create `src/data/books/<new-id>.json` with the same array-of-books shape.
2. Add an entry to the `lists` array in `src/data/lists.js` (id, title,
   tagline, accent color, and the imported books).

No other code changes are needed — routing, search, and the home page all
read from that registry.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `dist/`, configured for GitHub Pages under `/speciality-reading-lists-/`.

## Deploying

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub
Pages on every push to `main` (or manually via the Actions tab).

One-time setup, in the repo's GitHub settings: **Settings → Pages → Build
and deployment → Source: GitHub Actions**. After that, merging this branch
into `main` will publish the site automatically.
