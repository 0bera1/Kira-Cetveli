import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { ViteReactSSG } from 'vite-react-ssg'
import './styles/global.css'
import { routes } from './routes'

/**
 * vite-react-ssg adds a loader to every route that fetches build-hashed JSON files on each
 * client-side navigation. The hashes change with every deploy, so a tab opened before a deploy gets
 * a 404 on its next navigation and shows an error screen until it is reloaded. No route here uses
 * loader data, so the loaders are removed before the router is created.
 */
function withoutLoaders(list: RouteObject[]): RouteObject[] {
  return list.map((route) => ({
    ...route,
    loader: undefined,
    children: route.children ? withoutLoaders(route.children) : undefined,
  })) as RouteObject[]
}

export const createRoot = ViteReactSSG(
  {
    routes,
    basename: import.meta.env.BASE_URL,
    customCreateRouter: (routeList, options) =>
      createBrowserRouter(withoutLoaders(routeList as RouteObject[]), options),
  },
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
