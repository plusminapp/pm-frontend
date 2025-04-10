import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { AuthProvider } from "@asgardeo/auth-react";
import { CustomProvider } from './context/CustomContext.tsx';

const config = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID || 'ahVUPaBf3D1mE5xrZIM2aAmIRVYa',
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL || 'https://api.eu.asgardeo.io/t/plusmin',
  signInRedirectURL: import.meta.env.VITE_ASGARDEO_SIGNIN_REDIRECT_URL || 'http://localhost:5173',
  signOutRedirectURL: import.meta.env.VITE_ASGARDEO_SIGNOUT_REDIRECT_URL || 'http://localhost:5173/login',
  scope: ["openid", "profile"],
  periodicTokenRefresh: true,
  endpoints: {
    discovery: import.meta.env.VITE_ASGARDEO_DISCOVERY_URL || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/well-known/openid-configuration',
    issuer: import.meta.env.VITE_ASGARDEO_ISSUER || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/token',
    authorizationEndpoint: import.meta.env.VITE_ASGARDEO_AUTHORIZATION_ENDPOINT || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/authorize',
    tokenEndpoint: import.meta.env.VITE_ASGARDEO_TOKEN_ENDPOINT || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/token',
    userinfoEndpoint: import.meta.env.VITE_ASGARDEO_USERINFO_ENDPOINT || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/userinfo',
    endSessionEndpoint: import.meta.env.VITE_ASGARDEO_END_SESSION_ENDPOINT || 'https://api.eu.asgardeo.io/t/plusmin/oidc/logout',
    jwksUri: import.meta.env.VITE_ASGARDEO_JWKS_URI || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/jwks',
    revocationEndpoint: import.meta.env.VITE_ASGARDEO_REVOCATION_ENDPOINT || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/revoke',
    checkSessionIframe: import.meta.env.VITE_ASGARDEO_CHECK_SESSION_IFRAME || 'https://api.eu.asgardeo.io/t/plusmin/oauth2/checksession',
  }
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