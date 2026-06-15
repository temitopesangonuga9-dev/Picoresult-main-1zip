import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.addEventListener('focusin', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.tagName === 'INPUT' && el.type === 'number') {
    el.select();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
