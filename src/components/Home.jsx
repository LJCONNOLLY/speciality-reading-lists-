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
            <h2>{list.title}</h2>
            <p>{list.tagline}</p>
            <span className="home-card-count">{list.books.length} texts</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
