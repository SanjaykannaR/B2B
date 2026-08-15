import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Reclaim this origin from any stale service worker left behind by a previous app
// (e.g. a different site that previously ran on this port). Otherwise the browser
// keeps serving the old cached app and this project's UI/errors never appear.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if (caches) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
