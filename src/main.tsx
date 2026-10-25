import { ViteReactSSG } from 'vite-react-ssg'
import './styles/global.css'
import { routes } from './routes'

export const createRoot = ViteReactSSG(
  { routes, basename: import.meta.env.BASE_URL },
  ({ isClient }) => {
    if (isClient && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
          .catch(() => {
            // offline support is optional; the site works without it
          })
      })
    }
  },
)
