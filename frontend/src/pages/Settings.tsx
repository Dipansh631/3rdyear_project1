import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Sliders, 
  Grid, 
  Cpu, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { useLogiMindStore } from '../store/useLogiMindStore';
import './Settings.css';

export const Settings: React.FC = () => {
  const { settings, updateSettings, addEvent } = useLogiMindStore();
  
  const [formData, setFormData] = useState({ ...settings });
  const [saveToast, setSaveToast] = useState(false);

  const handleChange = (key: keyof typeof settings, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    addEvent({
      type: 'success',
      title: 'Configuration Updated',
      details: 'Simulation grid bounds and MARL hyperparameters synchronized successfully.'
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults = {
      gridWidth: 20,
      gridHeight: 20,
      shelfCount: 32,
      stationCount: 3,
      robotCount: 5,
      algorithm: 'MAPPO' as const,
      speed: 1.0,
      showPaths: true,
      showZones: false,
      showHeatmap: false,
      dynamicObstacles: true,
      robotFailures: true,
      congestionControl: true,
      learningRate: 0.0003,
      discountFactor: 0.99,
      batchSize: 64,
    };
    setFormData(defaults);
    updateSettings(defaults);
  };

  return (
    <div className="settings-page">
      <div className="card p-6 settings-banner">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <SettingsIcon className="text-blue" size={26} /> Simulation & Environment Configuration
            </h2>
            <p className="card-subtitle">
              Adjust spatial dimensions, multi-robot swarm constraints, dynamic disturbance generators, and MARL model settings.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="action-btn-large bg-gray-100" onClick={handleResetDefaults}>
              <RotateCcw size={16} /> Reset Defaults
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>

        {saveToast && (
          <div className="toast-notice mt-4 p-3 bg-green-light text-green rounded-lg flex items-center gap-2 border border-green-200">
            <CheckCircle2 size={16} /> Configuration saved and applied to running simulation instance.
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="settings-grid">
        {/* Warehouse Physical Layout */}
        <div className="card p-5">
          <h3 className="card-title font-semibold mb-3 flex items-center gap-2">
            <Grid size={18} className="text-blue" /> Physical Warehouse Spatial Layout
          </h3>
          <p className="text-secondary text-xs mb-4">Discrete cell grid coordinates and static fixture counts</p>

          <div className="flex flex-col gap-4">
            <div className="grid-2-col">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Grid Width (Cells)</label>
                <input 
                  type="number" 
                  min="10" 
                  max="50" 
                  className="search-input w-full"
                  value={formData.gridWidth}
                  onChange={(e) => handleChange('gridWidth', parseInt(e.target.value) || 20)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Grid Height (Cells)</label>
                <input 
                  type="number" 
                  min="10" 
                  max="50" 
                  className="search-input w-full"
                  value={formData.gridHeight}
                  onChange={(e) => handleChange('gridHeight', parseInt(e.target.value) || 20)}
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Total Storage Shelves</label>
                <input 
                  type="number" 
                  min="5" 
                  max="100" 
                  className="search-input w-full"
                  value={formData.shelfCount}
                  onChange={(e) => handleChange('shelfCount', parseInt(e.target.value) || 32)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Packing / Dock Bays</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="search-input w-full"
                  value={formData.stationCount}
                  onChange={(e) => handleChange('stationCount', parseInt(e.target.value) || 3)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Disturbance Toggles */}
        <div className="card p-5">
          <h3 className="card-title font-semibold mb-3 flex items-center gap-2">
            <Zap size={18} className="text-orange" /> Environmental Uncertainty & Disturbances
          </h3>
          <p className="text-secondary text-xs mb-4">Toggle stochastic events during active policy evaluation</p>

          <div className="flex flex-col gap-3">
            <label className="checkbox-setting-row">
              <input 
                type="checkbox" 
                checked={formData.dynamicObstacles} 
                onChange={(e) => handleChange('dynamicObstacles', e.target.checked)} 
              />
              <div className="setting-desc">
                <span className="font-semibold text-sm">Dynamic Obstacles & Debris</span>
                <span className="text-xs text-secondary block">Spawns temporary transit blocks in aisles</span>
              </div>
            </label>

            <label className="checkbox-setting-row">
              <input 
                type="checkbox" 
                checked={formData.robotFailures} 
                onChange={(e) => handleChange('robotFailures', e.target.checked)} 
              />
              <div className="setting-desc">
                <span className="font-semibold text-sm">Hardware Stalls & Battery Drains</span>
                <span className="text-xs text-secondary block">Simulates AMR mid-mission breakdown</span>
              </div>
            </label>

            <label className="checkbox-setting-row">
              <input 
                type="checkbox" 
                checked={formData.congestionControl} 
                onChange={(e) => handleChange('congestionControl', e.target.checked)} 
              />
              <div className="setting-desc">
                <span className="font-semibold text-sm">Centralized Congestion Penalties</span>
                <span className="text-xs text-secondary block">Active MARL reward shaping for bottleneck avoidance</span>
              </div>
            </label>
          </div>
        </div>

        {/* AI & MARL Hyperparameters */}
        <div className="card p-5">
          <h3 className="card-title font-semibold mb-3 flex items-center gap-2">
            <Cpu size={18} className="text-purple" /> Algorithm & Policy Optimization
          </h3>
          <p className="text-secondary text-xs mb-4">Neural policy architecture and reinforcement learning settings</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-secondary block mb-1">Execution Policy</label>
              <select 
                className="filter-select w-full"
                value={formData.algorithm}
                onChange={(e) => handleChange('algorithm', e.target.value as any)}
              >
                <option value="MAPPO">MAPPO (Multi-Agent PPO - Proposed CTDE)</option>
                <option value="PPO">PPO (Independent Single-Agent)</option>
                <option value="A*">A* Global Heuristic Search</option>
                <option value="Rule-Based">Rule-Based Priority Heuristic</option>
              </select>
            </div>

            <div className="grid-2-col">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Learning Rate (α)</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  className="search-input w-full"
                  value={formData.learningRate}
                  onChange={(e) => handleChange('learningRate', parseFloat(e.target.value) || 0.0003)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Discount Factor (γ)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="search-input w-full"
                  value={formData.discountFactor}
                  onChange={(e) => handleChange('discountFactor', parseFloat(e.target.value) || 0.99)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualization & Display Options */}
        <div className="card p-5">
          <h3 className="card-title font-semibold mb-3 flex items-center gap-2">
            <Sliders size={18} className="text-green" /> Viewport & HUD Overlays
          </h3>
          <p className="text-secondary text-xs mb-4">Simulation canvas visual rendering configurations</p>

          <div className="flex flex-col gap-3">
            <label className="checkbox-setting-row">
              <input 
                type="checkbox" 
                checked={formData.showPaths} 
                onChange={(e) => handleChange('showPaths', e.target.checked)} 
              />
              <div className="setting-desc">
                <span className="font-semibold text-sm">Draw AMR Projected Paths</span>
                <span className="text-xs text-secondary block">Renders colored vector routes and waypoints</span>
              </div>
            </label>

            <label className="checkbox-setting-row">
              <input 
                type="checkbox" 
                checked={formData.showZones} 
                onChange={(e) => handleChange('showZones', e.target.checked)} 
              />
              <div className="setting-desc">
                <span className="font-semibold text-sm">Highlight Sector Hazard Zones</span>
                <span className="text-xs text-secondary block">Displays pickup, packing, and high-traffic borders</span>
              </div>
            </label>

            <label className="checkbox-setting-row">
              <input 
                type="checkbox" 
                checked={formData.showHeatmap} 
                onChange={(e) => handleChange('showHeatmap', e.target.checked)} 
              />
              <div className="setting-desc">
                <span className="font-semibold text-sm">Real-time Traffic Density Heatmap</span>
                <span className="text-xs text-secondary block">Color-coded congestion intensity overlay</span>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
