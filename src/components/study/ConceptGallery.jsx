import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { bookSwatches } from '../../utils/palette.js';

export default function ConceptGallery({ study }) {
  const { list } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const swatches = bookSwatches(list);
  const bookById = Object.fromEntries(list.books.map((b) => [b.id, b]));
  const termById = Object.fromEntries(study.terms.map((t) => [t.id, t]));
  const selected = study.gallery.find((c) => c.id === params.get('concept'));
  const open = (id) => setParams(id ? { view: 'gallery', concept: id } : { view: 'gallery' }, { replace: true });

  const groups = (list.sections?.length ? list.sections : [{ id: null, title: 'Concepts' }]).map((s) => ({
    ...s,
    items: study.gallery.filter((c) => !s.id || bookById[c.bookId].section === s.id),
  }));

  return (
    <div className="cg">
      <h2 className="study-title">Concept gallery</h2>
      <p className="study-sub">
        {study.gallery.length} key ideas from the readings. Each card takes the color of the text it comes from.
      </p>

      {selected ? (
        <div className="cg-detail" style={{ '--swatch': swatches[selected.bookId].bg }}>
          <button type="button" className="cg-close" onClick={() => open(null)} aria-label="Close">
            ×
          </button>
          <h3>{selected.term}</h3>
          <p className="cg-def">{selected.definition}</p>
          <p className="cg-from">
            From{' '}
            <Link to={`/${list.slug}/book/${selected.bookId}`}>
              {bookById[selected.bookId].author.join(', ')}, <em>{bookById[selected.bookId].title}</em> (
              {bookById[selected.bookId].year})
            </Link>
          </p>
          {selected.termId ? (
            <>
              <Link
                to={`/${list.slug}?view=terms&term=${selected.termId}`}
                className="overview-cta cg-cta"
              >
                See how “{termById[selected.termId].term}” evolved →
              </Link>
              <div className="cg-related">
                <span>Related concepts:</span>
                {study.gallery
                  .filter((c) => c.termId === selected.termId && c.id !== selected.id)
                  .map((c) => (
                    <button key={c.id} type="button" className="tag" onClick={() => open(c.id)}>
                      {c.term}
                    </button>
                  ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {groups.map((g) =>
        g.items.length ? (
          <section key={g.id || 'all'}>
            <div className="tab-group-label">{g.title}</div>
            <div className="cg-grid">
              {g.items.map((c) => {
                const s = swatches[c.bookId];
                const book = bookById[c.bookId];
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`cg-card${selected?.id === c.id ? ' on' : ''}`}
                    style={{ background: s.bg, color: s.text }}
                    onClick={() => open(c.id)}
                  >
                    <span className="cg-term">{c.term}</span>
                    <span className="cg-snippet">{c.definition.split(/(?<=\.)\s/)[0]}</span>
                    <span className="cg-source">
                      {book.author[0].split(' ').slice(-1)[0]} · {book.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
