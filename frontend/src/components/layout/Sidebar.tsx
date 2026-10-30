import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Settings,
  ListTodo,
  AlertTriangle,
  BrainCircuit,
  LineChart
} from 'lucide-react';
import './Sidebar.css';

import { useLogiMindStore } from '../../store/useLogiMindStore';

export const Sidebar: React.FC = () => {
  const { isRunning, simTime, activeScenario, settings, toggleSimulation } = useLogiMindStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <Box size={24} color="#fff" />
        </div>
        <div className="logo-text">
          LogiMind <span>RL</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/simulation" className="nav-item">
          <Box size={20} />
          <span>Simulation</span>
        </NavLink>
        <NavLink to="/robots" className="nav-item">
          <BrainCircuit size={20} />
          <span>Robots</span>
        </NavLink>
        <NavLink to="/orders" className="nav-item">
          <ListTodo size={20} />
          <span>Orders & Tasks</span>
        </NavLink>
        <NavLink to="/events" className="nav-item">
          <AlertTriangle size={20} />
          <span>Events</span>
        </NavLink>
        <NavLink to="/training" className="nav-item">
          <BrainCircuit size={20} />
          <span>Training & Models</span>
        </NavLink>
        <NavLink to="/evaluation" className="nav-item">
          <LineChart size={20} />
          <span>Evaluation</span>
        </NavLink>
        <NavLink to="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <div className="scenario-card">
          <div className="scenario-icon">
            <Box size={16} color="#60a5fa" />
          </div>
          <div className="scenario-info">
            <div className="label">Current Scenario</div>
            <div className="value">{activeScenario}</div>
          </div>
          
          <div className="scenario-details">
            <div className="detail-row">
              <span className="label">Algorithm</span>
              <span className="value">{settings.algorithm}</span>
            </div>
            <div className="detail-row">
              <span className="label">Simulation Time</span>
              <span className="value font-mono">{simTime}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status</span>
              <span className="value">
                <span className={`status-dot ${isRunning ? 'active' : 'waiting'}`} style={{marginRight: 6}}></span>
                {isRunning ? 'Running' : 'Paused'}
              </span>
            </div>
          </div>
          
          <button 
            className="stop-btn"
            style={{ 
              background: isRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isRunning ? '#ef4444' : '#10b981'
            }}
            onClick={toggleSimulation}
          >
            {isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          </button>
        </div>
      </div>
    </aside>
  );
};
