import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { bookSwatches } from '../../utils/palette.js';

const MODES = [
  { id: 'links', label: 'Connections in the text' },
  { id: 'essay', label: 'How the foundations use each other' },
];

const lastName = (book) => book.author[0].split(' ').slice(-1)[0];

function Grid({ links, list }) {
  const bookById = Object.fromEntries(list.books.map((b) => [b.id, b]));
  const citers = [...new Set(links.map((l) => l.from))];
  const authors = [...new Set(links.map((l) => l.author))];
  const max = Math.max(...links.map((l) => l.pages));
  return (
    <div className="tt-grid-wrap">
      <table className="tt-grid">
        <caption>Pages where each text names another author on the list</caption>
        <thead>
          <tr>
            <th scope="col">Text ↓ names →</th>
            {authors.map((a) => (
              <th key={a} scope="col">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {citers.map((id) => (
            <tr key={id}>
              <th scope="row">
                {lastName(bookById[id])}, <em>{bookById[id].title.split(':')[0].replace(/\s*\(.*\)$/, '')}</em>
              </th>
              {authors.map((a) => {
                const l = links.find((x) => x.from === id && x.author === a);
                return (
                  <td key={a}>
                    {l ? (
                      <a
                        href={`#tt-${id}-${a}`}
                        className="tt-cell"
                        style={{ '--fill': `${20 + 80 * Math.sqrt(l.pages / max)}%` }}
                      >
                        {l.pages}
                      </a>
                    ) : (
                      <span className="tt-empty">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TalkingToEachOther({ study }) {
  const { list } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'essay' ? 'essay' : 'links';
  const swatches = bookSwatches(list);
  const bookById = Object.fromEntries(list.books.map((b) => [b.id, b]));
  const { links, essay } = study.talking;
  const citers = [...new Set(links.map((l) => l.from))].sort((a, b) => bookById[a].year - bookById[b].year);

  return (
    <div className="tt">
      <h2 className="study-title">Talking to each other</h2>
      <p className="study-sub">Where these readings name, borrow from, and argue with one another.</p>

      <div className="folder-tabs" role="tablist">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`folder-tab${mode === m.id ? ' active' : ''}`}
            onClick={() => setParams(m.id === 'essay' ? { view: 'talking', mode: 'essay' } : { view: 'talking' })}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'essay' ? (
        <article className="tt-essay">
          <h3>{essay.title}</h3>
          {essay.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      ) : (
        <>
          <Grid links={links} list={list} />
          {citers.map((id) => {
            const book = bookById[id];
            return (
              <section key={id} className="tt-group" style={{ '--swatch': swatches[id].bg }}>
                <h3>
                  <Link to={`/${list.slug}/book/${id}`}>{book.title}</Link>
                  <span>
                    {book.author.join(', ')} · {book.year}
                  </span>
                </h3>
                {links
                  .filter((l) => l.from === id)
                  .map((l) => (
                    <div key={l.author} id={`tt-${id}-${l.author}`} className="tt-mention">
                      <div className="tt-mention-head">
                        <span className="tt-arrow">talks to</span>
                        {l.toBooks.map((b) => (
                          <Link key={b} to={`/${list.slug}/book/${b}`} className="tt-target">
                            {l.author}, {bookById[b].title.split(':')[0]}
                          </Link>
                        ))}
                        <span className="tt-pages">named on {l.pages} pages</span>
                      </div>
                      <p className="tt-how">{l.how}</p>
                      <blockquote className="te-quote">
                        “{l.quote}”<cite>PDF p. {l.page}</cite>
                      </blockquote>
                    </div>
                  ))}
              </section>
            );
          })}
        </>
      )}

      <p className="study-note">
        Mapped across the {study.indexed.length} readings with PDFs attached. Foucault&rsquo;s two books and
        MacKinnon cite none of the others; the later critique readings join the map as their PDFs are added.
      </p>
    </div>
  );
}
