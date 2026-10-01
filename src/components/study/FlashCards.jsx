import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { bookSwatches } from '../../utils/palette.js';

function shuffled(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Deck({ cards }) {
  const [order, setOrder] = useState(cards);
  const [at, setAt] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(() => new Set());

  const move = useCallback(
    (d) => {
      setFlipped(false);
      setAt((i) => Math.min(order.length - 1, Math.max(0, i + d)));
    },
    [order.length],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const card = order[at];
  if (!card) return <p className="empty-state">No cards in this section.</p>;

  return (
    <>
      <button
        type="button"
        className={`fc-card${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show front' : 'Show answer'}
      >
        <span className="fc-face fc-front" style={{ background: card.swatch.bg, color: card.swatch.text }}>
          <span className="fc-prompt">{card.prompt}</span>
          <span className="fc-big">{card.front}</span>
          <span className="fc-hint">Tap to flip</span>
        </span>
        <span className="fc-face fc-back">
          <span className="fc-big fc-small">{card.back}</span>
          <span className="fc-source" style={{ borderColor: card.swatch.bg }}>
            {card.source}
          </span>
        </span>
      </button>

      <div className="te-controls fc-nav">
        <button type="button" className="te-nav" onClick={() => move(-1)} disabled={at === 0}>
          ← Previous
        </button>
        <span className="te-pos">
          {at + 1} / {order.length} · {known.size} known
        </span>
        <button
          type="button"
          className="te-nav"
          onClick={() => {
            setKnown((k) => new Set(k).add(card.id));
            move(1);
          }}
        >
          Got it ✓
        </button>
        <button type="button" className="te-nav" onClick={() => move(1)} disabled={at >= order.length - 1}>
          Next →
        </button>
        <button
          type="button"
          className="te-nav"
          onClick={() => {
            setOrder(shuffled(cards.filter((c) => !known.has(c.id))));
            setAt(0);
            setFlipped(false);
          }}
        >
          Shuffle{known.size ? ' the rest' : ''}
        </button>
      </div>
    </>
  );
}

export default function FlashCards({ study }) {
  const { list } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const deckId = params.get('deck') === 'concepts' ? 'concepts' : 'readings';
  const section = params.get('section') || 'all';
  const swatches = bookSwatches(list);
  const bookById = Object.fromEntries(list.books.map((b) => [b.id, b]));
  const sectionTitle = (id) => list.sections?.find((s) => s.id === id)?.title || '';
  const inSection = (book) => section === 'all' || book.section === section;

  const cards =
    deckId === 'concepts'
      ? study.gallery
          .filter((c) => inSection(bookById[c.bookId]))
          .map((c) => {
            const book = bookById[c.bookId];
            return {
              id: c.id,
              swatch: swatches[c.bookId],
              prompt: 'What does this concept mean, and where does it come from?',
              front: c.term,
              back: c.definition,
              source: `${book.author.join(', ')}, ${book.title.split(':')[0]} (${book.year})`,
            };
          })
      : list.books.filter(inSection).map((b) => ({
          id: b.id,
          swatch: swatches[b.id],
          prompt: 'Who wrote it, when, and what is its argument?',
          front: b.title,
          back: b.notes?.split(/(?<=\.)\s/)[0],
          source: `${b.author.join(', ')} · ${b.year} · ${sectionTitle(b.section)}`,
        }));

  const setParam = (next) => setParams({ view: 'flashcards', deck: deckId, section, ...next });

  return (
    <div className="fc">
      <h2 className="study-title">Flash cards</h2>
      <p className="study-sub">Click the card or press space to flip. ← → to move.</p>

      <div className="fc-controls">
        <div className="folder-tabs" role="tablist" aria-label="Deck">
          {[
            ['readings', `Readings (${list.books.length})`],
            ['concepts', `Concepts (${study.gallery.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={deckId === id}
              className={`folder-tab${deckId === id ? ' active' : ''}`}
              onClick={() => setParam({ deck: id })}
            >
              {label}
            </button>
          ))}
        </div>
        {list.sections?.length ? (
          <select value={section} onChange={(e) => setParam({ section: e.target.value })} aria-label="Section">
            <option value="all">All sections</option>
            {list.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <Deck key={`${deckId}-${section}`} cards={cards} />
    </div>
  );
}
