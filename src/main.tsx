import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { AuthProvider } from '@asgardeo/auth-react';
import { CustomProvider } from './context/CustomContext.tsx';

const config = {
  clientID:
    import.meta.env.VITE_ASGARDEO_CLIENT_ID || 'ahVUPaBf3D1mE5xrZIM2aAmIRVYa',
  baseUrl:
    import.meta.env.VITE_ASGARDEO_BASE_URL ||
    'https://api.eu.asgardeo.io/t/plusmin',
  signInRedirectURL:
    import.meta.env.VITE_ASGARDEO_SIGNIN_REDIRECT_URL ||
    'http://localhost:5173',
  signOutRedirectURL:
    import.meta.env.VITE_ASGARDEO_SIGNOUT_REDIRECT_URL ||
    'http://localhost:5173/login',
  scope: ['openid', 'profile'],
  periodicTokenRefresh: true,
  resourceServerURLs: ['http://localhost:5173/api/v1'],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider config={config}>
      <CustomProvider>
        <App />
      </CustomProvider>
    </AuthProvider>
  </StrictMode>,
);
