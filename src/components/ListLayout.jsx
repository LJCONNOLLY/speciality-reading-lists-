import { Link, Outlet, useParams } from 'react-router-dom';
import { getList } from '../data/lists.js';

export default function ListLayout() {
  const { listId } = useParams();
  const list = getList(listId);

  if (!list) {
    return (
      <div className="list-site">
        <p>No list found for &ldquo;{listId}&rdquo;.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  return (
    <div className="list-site" style={{ '--accent': list.accent }}>
      <header className="list-header">
        <Link to="/" className="list-home-link">
          &larr; All lists
        </Link>
        <h1>
          <Link to={`/list/${list.id}`}>{list.title}</Link>
        </h1>
        <p>{list.tagline}</p>
      </header>
      <main>
        <Outlet context={{ list }} />
      </main>
    </div>
  );
}
