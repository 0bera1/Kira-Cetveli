import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Soon from './pages/Soon'
import ToolsHub from './pages/ToolsHub'
import DepozitoIadesi from './pages/tools/DepozitoIadesi'
import GecikmeFaizi from './pages/tools/GecikmeFaizi'
import GecmisDonemFarki from './pages/tools/GecmisDonemFarki'
import ArtisIhtarnamesi from './pages/tools/ArtisIhtarnamesi'
import SozlesmeKontrolListesi from './pages/tools/SozlesmeKontrolListesi'
import SozlesmeTakvimi from './pages/tools/SozlesmeTakvimi'
import TahliyeVeDepozitoYazisi from './pages/tools/TahliyeVeDepozitoYazisi'
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
      { path: 'araclar/artis-ihtarnamesi', element: <ArtisIhtarnamesi /> },
      { path: 'araclar/tahliye-ve-depozito-yazisi', element: <TahliyeVeDepozitoYazisi /> },
      { path: 'araclar/sozlesme-kontrol-listesi', element: <SozlesmeKontrolListesi /> },
      { path: 'araclar/sozlesme-takvimi', element: <SozlesmeTakvimi /> },
      {
        path: 'veri-kaynaklari',
        element: <Soon title="Veri kaynakları" path="/veri-kaynaklari" />,
      },
      { path: 'gizlilik', element: <Soon title="Gizlilik" path="/gizlilik" /> },
      { path: 'hakkinda', element: <Soon title="Hakkında" path="/hakkinda" /> },
    ],
  },
]
