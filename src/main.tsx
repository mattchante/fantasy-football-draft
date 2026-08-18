import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './lib/theme';
import { ThemeSelector } from './components/ThemeSelector';

if (import.meta.env.DEV) {
  import('./lib/__dev__/validateDataset').then(({ validateDataset }) => {
    validateDataset();
  });
  import('./lib/__dev__/validateProgression').then(({ validateProgression }) => {
    validateProgression();
  });
  import('./lib/__dev__/validateDraftStress').then(({ validateDraftStress }) => {
    validateDraftStress();
  });
  import('./lib/__dev__/validateProgressionMigration').then(({ validateProgressionMigration }) => {
    validateProgressionMigration();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <ThemeSelector />
    </ThemeProvider>
  </StrictMode>,
);
