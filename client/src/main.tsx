// This file is for: React DOM render — app entry point
// Module: Frontend Configuration (Module 8)
// Owner: Developer 2 (Web Frontend Engineer)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App';
import store from './store/store';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1A1D26',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-sans)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
