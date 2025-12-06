import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import faviconUrl from './assets/image.png'

// Set favicon dynamically
const link = document.querySelector("link[rel~='icon']");
if (link) {
  link.href = faviconUrl;
} else {
  const newLink = document.createElement('link');
  newLink.rel = 'icon';
  newLink.type = 'image/png';
  newLink.href = faviconUrl;
  document.head.appendChild(newLink);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkspaceProvider>
      <App />
    </WorkspaceProvider>
  </StrictMode>,
)
