import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, LangProvider } from './shared';
import './shared/styles.css';
import { Dashboard } from './Dashboard';
import { PlayerGate } from './PlayerGate';

// Only this portal is localized — every other app has no LangProvider in
// its tree, so their useLang() calls (inherited from shared components)
// just get the English passthrough and behave exactly as before.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <PlayerGate>
            <Dashboard />
          </PlayerGate>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Offline app shell + installability (see public/sw.js). Production only: a
// service worker caching assets under the dev server just gets in the way.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
