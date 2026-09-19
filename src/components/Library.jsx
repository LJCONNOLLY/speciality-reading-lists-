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

function sectionTitle(list, sectionId) {
  return list.sections?.find((section) => section.id === sectionId)?.title || sectionId;
}

export default function Library() {
  const { list } = useOutletContext();
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('all');
  const [section, setSection] = useState('all');

  const hasSections = list.sections?.length > 0;

  const statusCounts = useMemo(() => {
    const byStatus = { all: list.books.length };
    STATUSES.forEach((status) => {
      byStatus[status.id] = list.books.filter((book) => book.status === status.id).length;
    });
    return byStatus;
  }, [list.books]);

  const sectionCounts = useMemo(() => {
    if (!hasSections) return {};
    const bySection = { all: list.books.length };
    list.sections.forEach((sec) => {
      bySection[sec.id] = list.books.filter((book) => book.section === sec.id).length;
    });
    return bySection;
  }, [list.books, list.sections, hasSections]);

  const results = useMemo(() => {
    let books = list.books;
    if (section !== 'all') {
      books = books.filter((book) => book.section === section);
    }
    if (folder !== 'all') {
      books = books.filter((book) => book.status === folder);
    }
    if (query.trim()) {
      books = books.filter((book) => matches(book, query));
    }
    return books;
  }, [list.books, query, folder, section]);

  return (
    <div className="library">
      {list.intro ? <p className="list-intro">{list.intro}</p> : null}

      {hasSections ? (
        <>
          <div className="tab-group-label">Filter by section</div>
          <div className="folder-tabs" role="tablist" aria-label="Filter by section">
            <button
              type="button"
              role="tab"
              aria-selected={section === 'all'}
              className={`folder-tab${section === 'all' ? ' active' : ''}`}
              onClick={() => setSection('all')}
            >
              All <span className="folder-count">{sectionCounts.all}</span>
            </button>
            {list.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                role="tab"
                aria-selected={section === sec.id}
                className={`folder-tab${section === sec.id ? ' active' : ''}`}
                onClick={() => setSection(sec.id)}
              >
                {sec.title} <span className="folder-count">{sectionCounts[sec.id] || 0}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="tab-group-label">Filter by status</div>
      <div className="folder-tabs" role="tablist" aria-label="Filter by reading status">
        <button
          type="button"
          role="tab"
          aria-selected={folder === 'all'}
          className={`folder-tab${folder === 'all' ? ' active' : ''}`}
          onClick={() => setFolder('all')}
        >
          All <span className="folder-count">{statusCounts.all}</span>
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
            {status.label} <span className="folder-count">{statusCounts[status.id] || 0}</span>
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
              {book.section ? (
                <span className="section-badge">{sectionTitle(list, book.section)}</span>
              ) : null}
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
