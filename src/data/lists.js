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
    accent: '#8d5235',
    // defaultPalette: the ramp used for any book with no section (or a
    // section with no `hue`) — 'soft-earth' gives muted terracottas,
    // browns, and beiges instead of the bright categorical palette.
    defaultPalette: 'soft-earth',
    intro:
      "These texts built the foundation the rest of this list stands on. Foucault established that sex is produced by the discourses and institutions claiming to describe it, and that knowledge and power are one formation rather than two, which is the move that makes any counting of queer people a question of governance rather than accuracy. Butler extended this to sex itself, showing that the category presumed to precede gender is its effect, so there is no pre-classificatory body waiting to be recorded correctly. Keller, Longino, Collins, and Harding dismantled the other half of the problem, the assumption that measurement is a neutral vantage point, and replaced it with an account of objectivity as socially produced and strongest when it begins from marginalized lives. MacKinnon and Crenshaw supplied the structural argument: that sex is a question of power rather than difference, and that any single-axis category will fail the people standing at the intersections. Together they make the field's core claim available, that classification systems constitute what they claim to find, and that queer lives are where this becomes impossible to ignore.",
    // hue: when a section sets this, its books render in one color family
    // instead of the multicolor categorical cycle. A number (0-360) gives a
    // light-to-dark ramp at that hue; 'soft-green' gives a wider spread of
    // distinct muted greens.
    sections: [
      { id: 'theoretical-foundations', title: 'Theoretical Foundations', hue: 'soft-green' },
      { id: 'classification-critique', title: 'The Classification and Datafication Critique', hue: 212 },
      { id: 'contemporary-applications', title: 'Contemporary Applications', hue: 265 },
    ],
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
