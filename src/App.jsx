import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Home from './components/Home.jsx';
import ListLayout from './components/ListLayout.jsx';
import ListPage from './components/ListPage.jsx';
import BookProfile from './components/BookProfile.jsx';
import { getList } from './data/lists.js';

function LegacyRedirect() {
  const { listId, bookId } = useParams();
  const slug = getList(listId)?.slug || listId;
  return <Navigate to={bookId ? `/${slug}/book/${bookId}` : `/${slug}`} replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list/:listId" element={<LegacyRedirect />} />
        <Route path="/list/:listId/book/:bookId" element={<LegacyRedirect />} />
        <Route path="/:listId" element={<ListLayout />}>
          <Route index element={<ListPage />} />
          <Route path="book/:bookId" element={<BookProfile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
