import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/vazirmatn/arabic-700.css';
import '@fontsource/vazirmatn/arabic-800.css';
import '@fontsource/vazirmatn/arabic-900.css';
import '@fontsource/vazirmatn/latin-700.css';
import '@fontsource/vazirmatn/latin-900.css';
import './styles/app.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
