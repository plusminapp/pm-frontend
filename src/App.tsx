import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';

import Profiel from './pages/Profiel';
import Stand from './pages/Stand';
import Home from './pages/Home';
import Kasboek from './pages/Kasboek';
import Aflossing from './pages/Aflossing';
import Header from './components/Header';
import Budget from './pages/Budget';
import LoginPagina from './pages/Login';

import Container from '@mui/material/Container';
import NotFound from './pages/NotFound';
import Periode from './pages/Periode';
import BankAppAfbeelding from './pages/BankAppAfbeelding';

const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { state } = useAuthContext();
  return state.isAuthenticated ? element : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <>
      <Container maxWidth="xl" sx={{ p: { xs: 2, sm: 3, md: 4 }, mx: { xs: 0, sm: 2, md: 'auto' } }}>
      <Router>
        <Header />
          <Routes>
            <Route path="/" element={<LoginPagina />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginPagina />} />
            <Route path="/ocr" element={<BankAppAfbeelding />} />

            {/* Beschermde routes */}
            <Route path="/stand" element={<ProtectedRoute element={<Stand />} />} />
            <Route path="/kasboek" element={<ProtectedRoute element={<Kasboek />} />} />
            <Route path="/schuld-aflossingen" element={<ProtectedRoute element={<Aflossing />} />} />
            <Route path="/budget" element={<ProtectedRoute element={<Budget />} />} />
            <Route path="/profiel" element={<ProtectedRoute element={<Profiel />} />} />
            <Route path="/periode" element={<ProtectedRoute element={<Periode />} />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Container>
    </>
  );
};

export default App;
