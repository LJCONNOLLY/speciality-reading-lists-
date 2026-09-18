import { Link } from 'react-router-dom';
import { lists } from '../data/lists.js';

export default function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Speciality Reading Lists</h1>
        <p>Two independent lists, browsed on their own.</p>
      </header>
      <div className="home-grid">
        {lists.map((list) => (
          <Link
            key={list.id}
            to={`/list/${list.id}`}
            className="home-card"
            style={{ '--accent': list.accent }}
          >
            <span className="home-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
                <path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
              </svg>
            </span>
            <h2>{list.title}</h2>
            <p>{list.tagline}</p>
            <div className="home-card-footer">
              <span className="home-card-count">{list.books.length} texts</span>
              <span className="home-card-cta">Browse list &rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
