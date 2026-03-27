import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Header } from './components/Header';
import { Notification } from './components/Notification';
import { FarmPage } from './pages/FarmPage';
import { ShopPage } from './pages/ShopPage';
import { HarvestListPage } from './pages/HarvestListPage';
import { EventMenuPage } from './pages/EventMenuPage';

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-dvh bg-farm-bg">
          <Header />
          <Notification />
          <Routes>
            <Route path="/" element={<FarmPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/harvest" element={<HarvestListPage />} />
            <Route path="/events" element={<EventMenuPage />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  );
}
