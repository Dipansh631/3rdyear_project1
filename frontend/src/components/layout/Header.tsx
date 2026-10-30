import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, BarChart2, BrainCircuit, Box } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  const location = useLocation();
  const isSimulation = location.pathname === '/simulation';
  const isRobots = location.pathname === '/robots';

  let title = 'Dashboard';
  let subtitle = 'AI-powered multi-robot warehouse management and simulation';
  
  if (isSimulation) {
    title = 'Warehouse Simulation';
    subtitle = 'Real-time visualization of multi-robot warehouse environment';
  } else if (isRobots) {
    title = 'Robot Fleet';
    subtitle = 'Manage, monitor, and control your warehouse robot fleet';
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      
      <div className="header-right">
        {isRobots && (
          <div className="header-dropdown">
            <Box size={16} className="text-blue" />
            <div className="hd-content">
              <span className="hd-label">Warehouse:</span>
              <select className="hd-select"><option>Main Warehouse</option></select>
            </div>
          </div>
        )}
        {(isSimulation || isRobots) && (
          <div className="header-dropdown">
            <BarChart2 size={16} className="text-purple" />
            <div className="hd-content">
              <span className="hd-label">Scenario:</span>
              <select className="hd-select"><option>Peak Demand</option></select>
            </div>
          </div>
        )}
        {isSimulation && (
          <div className="header-dropdown">
            <BrainCircuit size={16} className="text-blue" />
            <div className="hd-content">
              <span className="hd-label">Algorithm:</span>
              <select className="hd-select"><option>MAPPO</option></select>
            </div>
          </div>
        )}

        <div className="time-display flex items-center gap-2">
          <span className="text-secondary text-xs">Simulation Time</span>
          <span>04:32</span>
          <span className="text-secondary ml-2">→</span>
        </div>

        <div className="status-badge">
          <span className="status-dot active"></span>
          Running
        </div>
        
        {!isSimulation && (
          <div className="icon-btn notification">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </div>
        )}
        
        {!isSimulation && (
          <div className="user-profile">
            <div className="avatar"></div>
            <span className="username">Admin</span>
            <ChevronDown size={16} color="#64748b" />
          </div>
        )}
      </div>
    </header>
  );
};
