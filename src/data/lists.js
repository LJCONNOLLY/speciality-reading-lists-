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
    title: 'Classification and Datafication of Queer Bodies',
    tagline: 'Queer theory in conversation with critical approaches to data, algorithms, and infrastructure.',
    accent: '#6d4aa0',
    intro:
      "These texts built the foundation the rest of this list stands on. Foucault established that sex is produced by the discourses and institutions claiming to describe it, and that knowledge and power are one formation rather than two, which is the move that makes any counting of queer people a question of governance rather than accuracy. Butler extended this to sex itself, showing that the category presumed to precede gender is its effect, so there is no pre-classificatory body waiting to be recorded correctly. Keller, Longino, Collins, and Harding dismantled the other half of the problem, the assumption that measurement is a neutral vantage point, and replaced it with an account of objectivity as socially produced and strongest when it begins from marginalized lives. MacKinnon and Crenshaw supplied the structural argument: that sex is a question of power rather than difference, and that any single-axis category will fail the people standing at the intersections. Together they make the field's core claim available, that classification systems constitute what they claim to find, and that queer lives are where this becomes impossible to ignore.",
    sections: [{ id: 'theoretical-foundations', title: 'Theoretical Foundations' }],
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
