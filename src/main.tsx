import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, LangProvider, Portal } from './shared';
import './shared/styles.css';
import { Dashboard } from './Dashboard';

// Only this portal is localized — every other app has no LangProvider in
// its tree, so their useLang() calls (inherited from shared components)
// just get the English passthrough and behave exactly as before.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <Portal accountTypes={['PLAYER']}>
            <Dashboard />
          </Portal>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);
