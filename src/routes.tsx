import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Soon from './pages/Soon'
import ToolsHub from './pages/ToolsHub'
import DepozitoIadesi from './pages/tools/DepozitoIadesi'
import GecikmeFaizi from './pages/tools/GecikmeFaizi'
import GecmisDonemFarki from './pages/tools/GecmisDonemFarki'
import KiraArtisHesabi from './pages/tools/KiraArtisHesabi'
import StopajVeVergi from './pages/tools/StopajVeVergi'

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'araclar', element: <ToolsHub /> },
      { path: 'araclar/kira-artis-hesabi', element: <KiraArtisHesabi /> },
      { path: 'araclar/gecikme-faizi', element: <GecikmeFaizi /> },
      { path: 'araclar/gecmis-donem-farki', element: <GecmisDonemFarki /> },
      { path: 'araclar/depozito-iadesi', element: <DepozitoIadesi /> },
      { path: 'araclar/stopaj-ve-vergi', element: <StopajVeVergi /> },
      {
        path: 'veri-kaynaklari',
        element: <Soon title="Veri kaynakları" path="/veri-kaynaklari" />,
      },
      { path: 'gizlilik', element: <Soon title="Gizlilik" path="/gizlilik" /> },
      { path: 'hakkinda', element: <Soon title="Hakkında" path="/hakkinda" /> },
    ],
  },
]
