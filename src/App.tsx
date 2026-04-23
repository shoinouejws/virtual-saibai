import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Header } from './components/Header';
import { Notification } from './components/Notification';
import { FarmPage } from './pages/FarmPage';
import { ShopPage } from './pages/ShopPage';
import { HarvestListPage } from './pages/HarvestListPage';
import { EventMenuPage } from './pages/EventMenuPage';
import { CellDetailPage } from './pages/CellDetailPage';
import { ToolsPage } from './pages/ToolsPage';
import { ThinningPrototypePage } from './pages/ThinningPrototypePage';
import { StrawberryPartsCalibrationPage } from './pages/StrawberryPartsCalibrationPage';

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-dvh bg-farm-bg text-farm-text">
          <Header />
          <Notification />
          <Routes>
            <Route path="/" element={<FarmPage />} />
            <Route path="/cell/:id" element={<CellDetailPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/harvest" element={<HarvestListPage />} />
            <Route path="/events" element={<EventMenuPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/prototype/thinning" element={<ThinningPrototypePage />} />
            <Route path="/prototype/strawberry-parts" element={<StrawberryPartsCalibrationPage />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  );
}
