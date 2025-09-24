import React, { JSX } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';

import Profiel from './pages/Profiel';
import Stand from './pages/Stand';
import Home from './pages/Home';
import Kasboek from './pages/Kasboek';
import Aflossen from './pages/Aflossen';
import Sparen from './pages/Sparen';
import Header from './components/Header/Header';
import LoginPagina from './pages/Login';

import Container from '@mui/material/Container';
import NotFound from './pages/NotFound';
import BankAppAfbeelding from './pages/BankAppAfbeelding';
import { GridExample } from './pages/Experiment';
import './App.css';

const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { state } = useAuthContext();
  return state.isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <>
      <Container
        maxWidth="xl"
        sx={{ p: { xs: 2, sm: 3, md: 4 }, mx: { xs: 0, sm: 2, md: 'auto' } }}
      >
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPagina />} />

            {/* Beschermde routes */}
            <Route
              path="/stand"
              element={<ProtectedRoute element={<Stand />} />}
            />
            <Route path="/kasboek/ocr" element={<BankAppAfbeelding />} />
            <Route
              path="/kasboek"
              element={<ProtectedRoute element={<Kasboek />} />}
            />
            <Route
              path="/aflossen"
              element={<ProtectedRoute element={<Aflossen />} />}
            />
            <Route
              path="/sparen"
              element={<ProtectedRoute element={<Sparen />} />}
            />
            <Route
              path="/profiel"
              element={<ProtectedRoute element={<Profiel />} />}
            />
            <Route path="/experiment" element={<GridExample />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Container>
    </>
  );
};

export default App;
