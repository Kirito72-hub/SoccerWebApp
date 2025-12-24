
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker with enhanced logging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('🔄 Attempting to register Service Worker...');

    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ SW registered successfully!', registration);
        console.log('  - Scope:', registration.scope);
        console.log('  - Active:', registration.active);
        console.log('  - Installing:', registration.installing);
        console.log('  - Waiting:', registration.waiting);

        // Wait for SW to become active
        if (registration.installing) {
          console.log('⏳ SW is installing...');
          registration.installing.addEventListener('statechange', (e) => {
            console.log('🔄 SW state changed:', (e.target as ServiceWorker).state);
          });
        }

        // Check if SW is ready
        navigator.serviceWorker.ready.then(() => {
          console.log('✅ SW is ready and active!');
          console.log('  - Controller:', navigator.serviceWorker.controller);
        });
      })
      .catch((error) => {
        console.error('❌ SW registration failed:', error);
        console.error('  - Error name:', error.name);
        console.error('  - Error message:', error.message);

        // Try to fetch the SW file to see if it exists
        fetch('/service-worker.js')
          .then(r => {
            if (r.ok) {
              console.log('✅ SW file exists (status:', r.status, ')');
              console.log('⚠️ Registration failed despite file existing - check SW code for errors');
            } else {
              console.error('❌ SW file not found (status:', r.status, ')');
              console.error('⚠️ Make sure service-worker.js is in the public/ folder');
            }
          })
          .catch(e => console.error('❌ Could not fetch SW file:', e));
      });
  });
}
