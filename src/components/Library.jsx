import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

function matches(book, query) {
  const haystack = [
    book.title,
    ...(book.author || []),
    ...(book.tags || []),
    book.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function Library() {
  const { list } = useOutletContext();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return list.books;
    return list.books.filter((book) => matches(book, query));
  }, [list.books, query]);

  return (
    <div className="library">
      <div className="search-bar">
        <input
          type="search"
          placeholder={`Search ${list.title}...`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={`Search within ${list.title}`}
        />
        <span className="search-count">
          {results.length} of {list.books.length}
        </span>
      </div>

      {results.length === 0 ? (
        <p className="empty-state">No texts match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="book-grid">
          {results.map((book) => (
            <Link key={book.id} to={`book/${book.id}`} className="book-card">
              <h3>{book.title}</h3>
              <p className="book-card-author">{(book.author || []).join(', ')}</p>
              <p className="book-card-meta">
                {book.year} {book.publisher ? `· ${book.publisher}` : ''}
              </p>
              {book.tags?.length ? (
                <div className="tag-row">
                  {book.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <span className={`status status-${book.status}`}>{book.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
