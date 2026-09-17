import rhetoricTechComm from './books/rhetoric-tech-comm.json';
import queerCriticalDataStudies from './books/queer-critical-data-studies.json';

// Registry of independent reading lists. Each list is browsed on its own —
// its own library grid, its own search, no cross-list results.
// To add a list: create src/data/books/<id>.json (array of book objects,
// see the two existing files for the shape) and add an entry here.
export const lists = [
  {
    id: 'rhetoric-tech-comm',
    title: 'Rhetoric in/of Technical Communication',
    tagline: 'How rhetoric shapes, and is shaped by, technical and professional communication.',
    accent: '#2f6f5e',
    books: rhetoricTechComm,
  },
  {
    id: 'queer-critical-data-studies',
    title: 'Queer & Critical Data Studies',
    tagline: 'Queer theory in conversation with critical approaches to data, algorithms, and infrastructure.',
    accent: '#6d4aa0',
    books: queerCriticalDataStudies,
  },
];

export function getList(listId) {
  return lists.find((list) => list.id === listId);
}

export function getBook(listId, bookId) {
  const list = getList(listId);
  return list?.books.find((book) => book.id === bookId);
}
