// Sorts readings by title the way Zotero's Title column does: ignoring
// case and any leading quotes or brackets (so "Raw Data" files under R),
// with numbers compared by value. Leading articles like "The" are kept,
// as in Zotero.
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function sortKey(title = '') {
  return title.replace(/^[^\p{L}\p{N}]+/u, '');
}

export function sortByTitle(books) {
  return [...books].sort((a, b) => collator.compare(sortKey(a.title), sortKey(b.title)));
}
