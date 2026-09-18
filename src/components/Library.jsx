import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { STATUSES, statusLabel } from '../utils/status.js';

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
  const [folder, setFolder] = useState('all');

  const counts = useMemo(() => {
    const byStatus = { all: list.books.length };
    STATUSES.forEach((status) => {
      byStatus[status.id] = list.books.filter((book) => book.status === status.id).length;
    });
    return byStatus;
  }, [list.books]);

  const results = useMemo(() => {
    let books = list.books;
    if (folder !== 'all') {
      books = books.filter((book) => book.status === folder);
    }
    if (query.trim()) {
      books = books.filter((book) => matches(book, query));
    }
    return books;
  }, [list.books, query, folder]);

  return (
    <div className="library">
      <div className="folder-tabs" role="tablist" aria-label="Filter by reading status">
        <button
          type="button"
          role="tab"
          aria-selected={folder === 'all'}
          className={`folder-tab${folder === 'all' ? ' active' : ''}`}
          onClick={() => setFolder('all')}
        >
          All <span className="folder-count">{counts.all}</span>
        </button>
        {STATUSES.map((status) => (
          <button
            key={status.id}
            type="button"
            role="tab"
            aria-selected={folder === status.id}
            className={`folder-tab folder-tab-${status.id}${folder === status.id ? ' active' : ''}`}
            onClick={() => setFolder(status.id)}
          >
            {status.label} <span className="folder-count">{counts[status.id] || 0}</span>
          </button>
        ))}
      </div>

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
        <p className="empty-state">
          {query.trim()
            ? `No texts match “${query}”.`
            : 'No texts in this folder yet.'}
        </p>
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
              <span className={`status status-${book.status}`}>{statusLabel(book.status)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
