import { useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { STATUSES, statusLabel } from '../utils/status.js';
import { bookSwatches } from '../utils/palette.js';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') || 'all';
  const setSection = (id) =>
    setSearchParams(id === 'all' ? { view: 'readings' } : { view: 'readings', section: id }, { replace: true });

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

  const swatchByBookId = useMemo(() => bookSwatches(list), [list]);

  return (
    <div className="library">
      {hasSections ? (
        <>
          <div className="tab-group-label">Section</div>
          <div className="folder-tabs" role="tablist" aria-label="Filter by section">
            {[{ id: 'all', title: 'All sections' }, ...list.sections].map((sec) => (
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
        <div className="reading-list">
          {results.map((book, i) => {
            const swatch = swatchByBookId[book.id];
            return (
              <Link
                key={book.id}
                to={`book/${book.id}`}
                className="reading-item"
                style={{ background: swatch.bg, color: swatch.text }}
              >
                <span className="reading-item-index">{i + 1}</span>
                <span className="reading-item-body">
                  <span className="reading-item-title">{book.title}</span>
                  <span className="reading-item-meta">
                    {(book.author || []).join(', ')}
                    {book.year ? ` · ${book.year}` : ''}
                  </span>
                </span>
                <span className="reading-item-status">{statusLabel(book.status)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
