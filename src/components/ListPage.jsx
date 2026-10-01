import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { STATUSES } from '../utils/status.js';
import SectionMap from './SectionMap.jsx';
import Library from './Library.jsx';

function countBy(books, statusId) {
  return books.filter((book) => book.status === statusId).length;
}

function sectionCounts(list) {
  const counts = { all: list.books.length };
  list.sections?.forEach((sec) => {
    counts[sec.id] = list.books.filter((book) => book.section === sec.id).length;
  });
  return counts;
}

function StatTiles({ books }) {
  return (
    <div className="stat-tiles">
      <div className="stat-tile">
        <span className="stat-value">{books.length}</span>
        <span className="stat-label">Texts</span>
      </div>
      {STATUSES.map((status) => (
        <div key={status.id} className={`stat-tile stat-tile-${status.id}`}>
          <span className="stat-value">{countBy(books, status.id)}</span>
          <span className="stat-label">{status.label}</span>
        </div>
      ))}
    </div>
  );
}

function Overview({ list }) {
  const [, setSearchParams] = useSearchParams();
  const openSection = (sectionId) =>
    setSearchParams(sectionId === 'all' ? { view: 'readings' } : { view: 'readings', section: sectionId });

  return (
    <div className="overview">
      <StatTiles books={list.books} />
      {list.intro ? <p className="list-intro">{list.intro}</p> : null}
      {list.sections?.length ? (
        <>
          <div className="tab-group-label">Sections — click one to open its readings</div>
          <SectionMap list={list} activeSection={null} onSelect={openSection} counts={sectionCounts(list)} />
        </>
      ) : (
        <Link to={`/${list.slug}?view=readings`} className="overview-cta">
          Browse all {list.books.length} readings &rarr;
        </Link>
      )}
    </div>
  );
}

function ProgressBar({ books }) {
  const total = books.length || 1;
  return (
    <div className="progress-bar" role="img" aria-label={STATUSES.map((s) => `${countBy(books, s.id)} ${s.label}`).join(', ')}>
      {[...STATUSES].reverse().map((status) => {
        const n = countBy(books, status.id);
        return n ? (
          <span
            key={status.id}
            className={`progress-seg progress-seg-${status.id}`}
            style={{ width: `${(n / total) * 100}%` }}
          />
        ) : null;
      })}
    </div>
  );
}

function Progress({ list }) {
  const groups = list.sections?.length
    ? list.sections.map((sec) => ({
        id: sec.id,
        title: sec.title,
        books: list.books.filter((book) => book.section === sec.id),
      }))
    : [];
  const readPct = Math.round((countBy(list.books, 'read') / (list.books.length || 1)) * 100);

  return (
    <div className="progress-page">
      <StatTiles books={list.books} />
      <div className="progress-row progress-row-total">
        <div className="progress-row-head">
          <span>Whole list</span>
          <span>{readPct}% read</span>
        </div>
        <ProgressBar books={list.books} />
      </div>
      {groups.map((group) => (
        <Link
          key={group.id}
          to={`/${list.slug}?view=readings&section=${group.id}`}
          className="progress-row"
        >
          <div className="progress-row-head">
            <span>{group.title}</span>
            <span>
              {countBy(group.books, 'read')} of {group.books.length} read
            </span>
          </div>
          <ProgressBar books={group.books} />
        </Link>
      ))}
      <div className="progress-legend">
        {[...STATUSES].reverse().map((status) => (
          <span key={status.id}>
            <i className={`progress-seg-${status.id}`} /> {status.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ListPage() {
  const { list } = useOutletContext();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'overview';

  if (view === 'readings') return <Library />;
  if (view === 'progress') return <Progress list={list} />;
  return <Overview list={list} />;
}
