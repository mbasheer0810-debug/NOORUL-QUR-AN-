import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker immediately for offline caching and installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Noorul Quran updated, ready to refresh.');
  },
  onOfflineReady() {
    console.log('Noorul Quran is fully cached and ready to run offline!');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
