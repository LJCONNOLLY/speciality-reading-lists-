import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { bookSwatches } from '../../utils/palette.js';

const STANCE = {
  defines: 'Defines it',
  'in passing': 'Uses it in passing',
  critiques: 'Critiques a use of it',
};

const shortTitle = (title) => {
  const t = title.replace(/\s*\(.*\)$/, '').split(/[:,]/)[0].replace(/^The /, '');
  return t.length > 18 ? `${t.slice(0, 17)}…` : t;
};

function BookCard({ entry, book, list, tag }) {
  return (
    <article className="te-card">
      {tag ? <span className="te-card-tag">{tag}</span> : null}
      <Link to={`/${list.slug}/book/${book.id}`} className="te-card-title">
        {book.title}
      </Link>
      <p className="te-card-meta">
        {book.author.join(', ')} · {book.year}
      </p>
      {entry.quote ? (
        <>
          <div className="te-card-row">
            <span className={`te-stance te-stance-${entry.stance.replace(' ', '-')}`}>{STANCE[entry.stance]}</span>
            <span className="te-uses">{entry.uses} uses in the text</span>
          </div>
          <p className="te-def">{entry.definition}</p>
          <blockquote className="te-quote">
            “{entry.quote}”<cite>PDF p. {entry.page}</cite>
          </blockquote>
          <p className="te-changed">
            <strong>What changed here:</strong> {entry.changed}
          </p>
        </>
      ) : (
        <p className="te-def te-muted">
          {entry.uses ? `Mentioned ${entry.uses} times, but never as a working concept.` : 'Not used in this text.'}
        </p>
      )}
    </article>
  );
}

export default function TermEvolution({ study }) {
  const { list } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [comparing, setComparing] = useState(false);
  const swatches = bookSwatches(list);
  const bookById = Object.fromEntries(list.books.map((b) => [b.id, b]));

  const term = study.terms.find((t) => t.id === params.get('term')) || study.terms[0];
  const books = term.books;
  const fallback = books.find((b) => b.quote)?.bookId;
  const at = Math.max(0, books.findIndex((b) => b.bookId === (params.get('book') || fallback)));
  const current = books[at];
  const other = books.find((b) => b.bookId === params.get('compare'));

  const go = (next) => setParams({ view: 'terms', term: term.id, ...next }, { replace: true });
  const select = (id) => {
    if (comparing && id !== current.bookId) {
      go({ book: current.bookId, compare: id });
      setComparing(false);
    } else {
      go(other && other.bookId !== id ? { book: id, compare: other.bookId } : { book: id });
    }
  };
  const step = (d) => {
    const k = at + d;
    if (k >= 0 && k < books.length) select(books[k].bookId);
  };

  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') stepRef.current(1);
      if (e.key === 'ArrowLeft') stepRef.current(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const maxUses = Math.max(1, ...books.map((b) => b.uses || 0));
  const notIndexed = list.books.length - study.indexed.length;

  return (
    <div className="te">
      <h2 className="study-title">How the terms evolved in these readings</h2>
      <p className="study-sub">Pick a term, then walk the texts in the order they came out. Use ← → to step.</p>

      <div className="te-terms" role="tablist" aria-label="Term">
        {study.terms.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === term.id}
            className={`folder-tab${t.id === term.id ? ' active' : ''}`}
            onClick={() => setParams({ view: 'terms', term: t.id })}
          >
            {t.term}
          </button>
        ))}
      </div>
      <p className="te-summary">{term.summary}</p>

      <ol className="te-timeline">
        {books.map((b, i) => {
          const book = bookById[b.bookId];
          const size = 14 + Math.round(22 * Math.sqrt((b.uses || 0) / maxUses));
          const on = b.bookId === current.bookId || b.bookId === other?.bookId;
          return (
            <li key={b.bookId} className={`te-stop${on ? ' on' : ''}${b.quote ? '' : ' faint'}`}>
              <button
                type="button"
                onClick={() => select(b.bookId)}
                aria-pressed={on}
                aria-label={`${book.title}, ${book.year}`}
                title={`${book.title} (${b.uses ?? 0} uses)`}
              >
                <span className="te-dot-box">
                  <span
                    className="te-dot"
                    style={{ width: size, height: size, background: b.quote ? swatches[b.bookId].bg : undefined }}
                  />
                </span>
                <span className="te-stop-year">{book.year}</span>
                <span className="te-stop-name">{book.author[0].split(' ').slice(-1)[0]}</span>
                <span className="te-stop-short">{shortTitle(book.title)}</span>
              </button>
              {i < books.length - 1 ? <span className="te-line" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>

      <div className="te-controls">
        <button type="button" className="te-nav" onClick={() => step(-1)} disabled={at === 0}>
          ← {at > 0 ? bookById[books[at - 1].bookId].year : 'Start'}
        </button>
        <span className="te-pos">
          {at + 1} of {books.length}
        </span>
        <button type="button" className="te-nav" onClick={() => step(1)} disabled={at === books.length - 1}>
          {at < books.length - 1 ? bookById[books[at + 1].bookId].year : 'End'} →
        </button>
        {other ? (
          <button type="button" className="te-nav on" onClick={() => go({ book: current.bookId })}>
            Stop comparing
          </button>
        ) : (
          <button
            type="button"
            className={`te-nav${comparing ? ' on' : ''}`}
            aria-pressed={comparing}
            onClick={() => setComparing((c) => !c)}
          >
            {comparing ? 'Now pick a second text ↑' : 'Compare two texts'}
          </button>
        )}
      </div>

      <div className={other ? 'te-pair' : ''}>
        <BookCard entry={current} book={bookById[current.bookId]} list={list} tag={other ? 'A' : null} />
        {other ? <BookCard entry={other} book={bookById[other.bookId]} list={list} tag="B" /> : null}
      </div>

      <p className="study-note">
        Built from the full text of the {study.indexed.length} readings with PDFs attached. {notIndexed} more texts
        will join these timelines once their PDFs are added.
      </p>
    </div>
  );
}
