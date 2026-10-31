import { useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { STATUSES, statusLabel } from '../utils/status.js';
import { bookSwatches } from '../utils/palette.js';

function matches(book, query) {
  const haystack = [
    book.title,
    ...(book.author || []),
    ...(book.tags || []),
    ...(book.keyTerms || []),
    book.thesis,
    book.notes,
    book.annotation,
    book.citation,
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

  // Each tab's count is what you'd see after clicking it, keeping the other
  // filter as it is: status counts are within the chosen section, and
  // section counts are within the chosen status.
  const inSection = useMemo(
    () => (section === 'all' ? list.books : list.books.filter((book) => book.section === section)),
    [list.books, section],
  );
  const inFolder = useMemo(
    () => (folder === 'all' ? list.books : list.books.filter((book) => book.status === folder)),
    [list.books, folder],
  );

  const statusCounts = useMemo(() => {
    const byStatus = { all: inSection.length };
    STATUSES.forEach((status) => {
      byStatus[status.id] = inSection.filter((book) => book.status === status.id).length;
    });
    return byStatus;
  }, [inSection]);

  const sectionCounts = useMemo(() => {
    if (!hasSections) return {};
    const bySection = { all: inFolder.length };
    list.sections.forEach((sec) => {
      bySection[sec.id] = inFolder.filter((book) => book.section === sec.id).length;
    });
    return bySection;
  }, [inFolder, list.sections, hasSections]);

  const filtered = useMemo(
    () => (folder === 'all' ? inSection : inSection.filter((book) => book.status === folder)),
    [inSection, folder],
  );

  const results = useMemo(
    () => (query.trim() ? filtered.filter((book) => matches(book, query)) : filtered),
    [filtered, query],
  );

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

      {(() => {
        const description = list.sections?.find((sec) => sec.id === section)?.description;
        return description ? <p className="section-description">{description}</p> : null;
      })()}

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
          {results.length} of {filtered.length}
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
                    {book.mode ? ` · ${book.mode}` : ''}
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
