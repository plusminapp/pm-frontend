import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { AsgardeoProvider } from '@asgardeo/react';
import { CustomProvider } from './context/CustomContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AsgardeoProvider
      clientId={
        import.meta.env.VITE_ASGARDEO_CLIENT_ID ||
        'ahVUPaBf3D1mE5xrZIM2aAmIRVYa'
      }
      baseUrl={
        import.meta.env.VITE_ASGARDEO_BASE_URL ||
        'https://api.eu.asgardeo.io/t/plusmin'
      }
      scopes={['openid', 'profile']}
    >
      <CustomProvider>
        <App />
      </CustomProvider>
    </AsgardeoProvider>
  </StrictMode>,
);
