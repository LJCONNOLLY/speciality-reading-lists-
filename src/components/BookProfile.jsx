import { Link, useOutletContext, useParams } from 'react-router-dom';

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

  return (
    <div className="book-profile">
      <Link to={`/list/${list.id}`} className="back-link">
        &larr; Back to {list.title}
      </Link>
      <h2>{book.title}</h2>
      <p className="book-card-author">{(book.author || []).join(', ')}</p>
      <p className="book-card-meta">
        {book.year} {book.publisher ? `· ${book.publisher}` : ''}
      </p>
      <span className={`status status-${book.status}`}>{book.status}</span>
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
