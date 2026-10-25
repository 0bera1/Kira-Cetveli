import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Soon from './pages/Soon'

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'araclar', element: <Soon title="Araçlar" path="/araclar" /> },
      {
        path: 'veri-kaynaklari',
        element: <Soon title="Veri kaynakları" path="/veri-kaynaklari" />,
      },
      { path: 'gizlilik', element: <Soon title="Gizlilik" path="/gizlilik" /> },
      { path: 'hakkinda', element: <Soon title="Hakkında" path="/hakkinda" /> },
    ],
  },
]
