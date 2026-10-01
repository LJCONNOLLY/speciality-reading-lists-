import { Link, useOutletContext, useParams } from 'react-router-dom';
import { statusLabel } from '../utils/status.js';
import { bookSwatches } from '../utils/palette.js';

export default function BookProfile() {
  const { list } = useOutletContext();
  const { bookId } = useParams();
  const book = list.books.find((entry) => entry.id === bookId);
  const back = `/${list.slug}?view=readings`;

  if (!book) {
    return (
      <div className="book-profile">
        <p>No entry found for &ldquo;{bookId}&rdquo; in {list.title}.</p>
        <Link to={back}>&larr; Back to {list.title}</Link>
      </div>
    );
  }

  const swatch = bookSwatches(list)[book.id];

  return (
    <div className="book-profile" style={{ '--swatch': swatch.bg }}>
      <div className="book-profile-band" style={{ background: swatch.bg }} aria-hidden="true" />
      <Link to={back} className="back-link">
        &larr; Back to {list.title}
      </Link>
      {book.section ? (
        <span className="section-badge">
          {list.sections?.find((section) => section.id === book.section)?.title || book.section}
        </span>
      ) : null}
      <h2>{book.title}</h2>
      <p className="book-card-author">{(book.author || []).join(', ')}</p>
      <p className="book-card-meta">
        {book.year} {book.publisher ? `· ${book.publisher}` : ''}
      </p>
      <span className={`status status-${book.status}`}>{statusLabel(book.status)}</span>
      {book.pdf ? (
        <a
          href={`${import.meta.env.BASE_URL}${book.pdf}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-link"
          style={{ background: swatch.bg, color: swatch.text }}
        >
          Read the PDF &rarr;
        </a>
      ) : null}

      {book.thesis ? (
        <section className="bp-section">
          <h3>Thesis</h3>
          <p className="bp-thesis">{book.thesis}</p>
        </section>
      ) : null}

      {book.researchQuestions?.length ? (
        <section className="bp-section">
          <h3>Research questions</h3>
          <ol className="bp-questions">
            {book.researchQuestions.map((item) => (
              <li key={item.q} className={item.page ? 'quoted' : ''}>
                {item.page ? `“${item.q}”` : item.q}
                {item.page ? <cite>PDF p. {item.page}</cite> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {book.keyTerms?.length ? (
        <section className="bp-section">
          <h3>Key terms</h3>
          <div className="bp-terms">
            {book.keyTerms.map((term) => (
              <span key={term} className="bp-term">
                {term}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {book.approach ? (
        <section className="bp-section">
          <h3>Approach</h3>
          <p>{book.approach}</p>
        </section>
      ) : null}

      {book.notes ? (
        <section className="bp-section">
          <h3>Notes</h3>
          <p className="book-notes">{book.notes}</p>
        </section>
      ) : null}

      {book.tags?.length ? (
        <div className="tag-row">
          {book.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {book.summarySource ? <p className="bp-source">{book.summarySource}</p> : null}
    </div>
  );
}
