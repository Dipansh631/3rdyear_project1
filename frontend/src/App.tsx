import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Simulation } from './pages/Simulation';
import { RobotFleet } from './pages/RobotFleet';
import { Orders } from './pages/Orders';
import { Events } from './pages/Events';
import { Training } from './pages/Training';
import { Evaluation } from './pages/Evaluation';
import { Settings } from './pages/Settings';
import { useLogiMindStore } from './store/useLogiMindStore';

function App() {
  const initWebSocket = useLogiMindStore((state) => state.initWebSocket);

  useEffect(() => {
    initWebSocket();
  }, [initWebSocket]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="robots" element={<RobotFleet />} />
          <Route path="orders" element={<Orders />} />
          <Route path="events" element={<Events />} />
          <Route path="training" element={<Training />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
