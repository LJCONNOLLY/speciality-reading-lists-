# Speciality Reading Lists

A small site that splits into two independent reading lists, each browsed on its own:

- **Rhetoric in/of Technical Communication**
- **Classification and Datafication of Queer Bodies**

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
  "status": "unread-unprinted",
  "notes": "Free-text notes/summary."
}
```

`id` must be unique within its file (used in the book's URL). `status`
must be one of the three folders defined in `src/utils/status.js`:

- `unread-unprinted`
- `printed-ready`
- `read`

Each list page shows these as filterable folder tabs (All / Unread,
Unprinted / Printed & Ready / Read) above the search bar, with a count
per folder. To rename a folder or add a new one, edit the `STATUSES`
array in `src/utils/status.js` — the tabs, book cards, and book pages
all read from that one list.

The three sample entries in each file are placeholders — replace or
delete them once you add your real lists.

## Sections (subfolders) and list intros

A list can optionally be split into named sections — a second,
independent filter alongside the status folders (e.g. grouping by
theme rather than read-status). To add one:

1. Give the list a `sections` array in `src/data/lists.js`, e.g.
   `sections: [{ id: 'theoretical-foundations', title: 'Theoretical Foundations' }]`.
2. Tag any book that belongs to it with `"section": "theoretical-foundations"`
   in its JSON entry.

The list page then shows a "Filter by section" tab row above the
existing "Filter by status" row, and book cards/pages show a small
section label. A list with no `sections` array (like Rhetoric in/of
Technical Communication) shows no section row at all.

A list can also carry an `intro` string in `src/data/lists.js`, shown
as a highlighted block at the top of that list's page — useful for
explaining why a section exists or what ties a list together.

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
Pages on every push to `claude/bold-cerf-7vfe33` (or manually via the
Actions tab). There's no `main` branch yet, so the workflow targets this
branch directly — update it to `main` (or another branch) once you adopt
one as the repo's actual default.

One-time setup, in the repo's GitHub settings: **Settings → Pages → Build
and deployment → Source: GitHub Actions**. After that, pushing to this
branch will publish the site automatically.

Live at: https://ljconnolly.github.io/speciality-reading-lists-/
