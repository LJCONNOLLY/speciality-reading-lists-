import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import ListLayout from './components/ListLayout.jsx';
import Library from './components/Library.jsx';
import BookProfile from './components/BookProfile.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list/:listId" element={<ListLayout />}>
          <Route index element={<Library />} />
          <Route path="book/:bookId" element={<BookProfile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
