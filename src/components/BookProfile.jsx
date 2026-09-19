import { Link, useOutletContext, useParams } from 'react-router-dom';
import { statusLabel } from '../utils/status.js';
import { bookSwatches } from '../utils/palette.js';

export default function BookProfile() {
  const { list } = useOutletContext();
  const { bookId } = useParams();
  const book = list.books.find((entry) => entry.id === bookId);

  if (!book) {
    return (
      <div className="book-profile">
        <p>No entry found for &ldquo;{bookId}&rdquo; in {list.title}.</p>
        <Link to={`/list/${list.id}`}>&larr; Back to {list.title}</Link>
      </div>
    );
  }

  const swatch = bookSwatches(list)[book.id];

  return (
    <div className="book-profile">
      <div className="book-profile-band" style={{ background: swatch.bg }} aria-hidden="true" />
      <Link to={`/list/${list.id}`} className="back-link">
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
      {book.tags?.length ? (
        <div className="tag-row">
          {book.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {book.notes ? <p className="book-notes">{book.notes}</p> : null}
    </div>
  );
}
