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
import LoginPagina from './pages/Login';

import NotFound from './pages/NotFound';
import BankAppAfbeelding from './pages/BankAppAfbeelding';
import './App.css';
import './i18n';
import GebruikersProfiel from './pages/GebruikersProfiel';
import Potjes from './pages/Potjes';
import PotjesDemoWrapper from './pages/PotjesDemoWrapper';

import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { useState } from 'react';
import BeslisboomWrapper from './pages/BeslisboomWrapper';

const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { state } = useAuthContext();
  return state.isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <AppHeader
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
              <Route
                path="/gebruikersprofiel"
                element={<ProtectedRoute element={<GebruikersProfiel />} />}
              />
              <Route
                path="/potjes"
                element={<ProtectedRoute element={<Potjes />} />}
              />
              <Route path="/potjesdemo" element={<PotjesDemoWrapper />} />
              <Route path="/beslisboom" element={<BeslisboomWrapper />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
