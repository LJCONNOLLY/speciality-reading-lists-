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

## Attaching a PDF

Add a `"pdf"` field pointing at a file under `public/pdfs/`, e.g.
`"pdf": "pdfs/some-id.pdf"` for a file at `public/pdfs/some-id.pdf`.
The book's page then shows a "Read the PDF" button, colored to match
that book, linking straight to the file. Files must live under
`public/` — anywhere else (like the repo root) is invisible to the
build and won't be served on the live site. There's no field for
books without a PDF; the button just doesn't render.

## Sections (subfolders) and list intros

A list can optionally be split into named sections — a second,
independent filter alongside the status folders (e.g. grouping by
theme rather than read-status). To add one:

1. Give the list a `sections` array in `src/data/lists.js`, e.g.
   `sections: [{ id: 'theoretical-foundations', title: 'Theoretical Foundations' }]`.
2. Tag any book that belongs to it with `"section": "theoretical-foundations"`
   in its JSON entry.

The list page then shows an interactive hub-and-spoke diagram
(`src/components/SectionMap.jsx`) above the existing "Filter by
status" row: the list title sits in a central circle, each section is
a colored spoke box connected by a dashed line, and clicking the hub
or a spoke filters the reading list below. It reflows into a stacked
vertical layout under 640px width. A list with no `sections` array
(like Rhetoric in/of Technical Communication) shows no diagram at all.

A list can also carry an `intro` string in `src/data/lists.js`, shown
as a highlighted block at the top of that list's page — useful for
explaining why a section exists or what ties a list together.

## Reading list styling

Each book renders as a large, colorful "long button" (`.reading-item`
in `src/components/Library.jsx`), not a plain card. Colors cycle
through a fixed, validated categorical palette (`src/utils/palette.js`)
keyed to each book's stable position in its list's JSON file, so a
book keeps the same color regardless of which filter is active. The
same palette drives the section-map spokes. To change the look, edit
`PALETTE` in `src/utils/palette.js` — each entry pairs a background hex
with whichever text color (white or dark ink) gives better contrast
against it; check contrast again if you swap in different hues.

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
