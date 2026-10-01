import { Link, NavLink, Outlet, useParams, useSearchParams } from 'react-router-dom';
import { getList } from '../data/lists.js';

export const VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'readings', label: 'Readings' },
  { id: 'progress', label: 'Progress' },
];

export default function ListLayout() {
  const { listId, bookId } = useParams();
  const [searchParams] = useSearchParams();
  const list = getList(listId);

  if (!list) {
    return (
      <div className="list-site">
        <p>No list found for &ldquo;{listId}&rdquo;.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  const activeView = bookId ? 'readings' : searchParams.get('view') || 'overview';

  return (
    <div className="list-site" style={{ '--accent': list.accent }}>
      <div className="list-site-inner">
        <header className="list-header">
          <Link to="/" className="list-home-link">
            &larr; All lists
          </Link>
          <h1>
            <Link to={`/${list.slug}`}>{list.title}</Link>
          </h1>
          <p>{list.tagline}</p>
          <nav className="view-tabs" aria-label={`${list.title} pages`}>
            {VIEWS.map((view) => (
              <NavLink
                key={view.id}
                to={`/${list.slug}?view=${view.id}`}
                className={() => `view-tab${activeView === view.id ? ' active' : ''}`}
                aria-current={activeView === view.id ? 'page' : undefined}
              >
                {view.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main>
          <Outlet context={{ list }} />
        </main>
      </div>
    </div>
  );
}
