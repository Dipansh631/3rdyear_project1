import React from 'react';
import { 
  ZoomIn, ZoomOut, Minus,
  Play, Pause, RotateCcw,
  Plus, AlertTriangle, Package, Zap,
  Users, Trash2, Cpu, Flame, ShieldAlert,
  Activity, BatteryCharging, CheckCircle2, Sparkles
} from 'lucide-react';
import { useLogiMindStore } from '../store/useLogiMindStore';
import './Simulation.css';

const ALGORITHMS = [
  { id: 'MAPPO', name: 'MAPPO', badge: 'Trained', desc: 'Centralized Critic MARL' },
  { id: 'PPO', name: 'PPO', badge: 'Trained', desc: 'Independent Single-Agent' },
  { id: 'A*', name: 'A* Search', badge: 'Classical', desc: 'Optimal Pathfinding' },
  { id: 'Rule-Based', name: 'Rule-Based', badge: 'Baseline', desc: 'Priority FIFO Dispatch' },
  { id: 'Q-MIX', name: 'Q-MIX', badge: 'Co-op', desc: 'Value Factorization' },
];

const SCENARIOS = [
  { id: 'Normal Operations', name: 'Normal Operations', icon: Activity, desc: 'Balanced baseline logistics workflow' },
  { id: 'Peak Demand Surge', name: 'Peak Demand Surge', icon: Flame, desc: '5 express priority rush orders injected' },
  { id: 'Obstacle Surge', name: 'Obstacle Surge', icon: AlertTriangle, desc: 'Dynamic corridor debris and spills' },
  { id: 'Fleet Failure Recovery', name: 'Fleet Failure Recovery', icon: ShieldAlert, desc: 'AMR fault & peer re-allocation' },
  { id: 'Aisle Bottleneck & Congestion', name: 'Aisle Bottleneck', icon: Users, desc: 'Chokepoint near packing bay' },
  { id: 'Battery Depletion & Docking', name: 'Battery Depletion', icon: BatteryCharging, desc: 'Emergency dock recharge protocol' },
];

export const Simulation: React.FC = () => {
  const [zoom, setZoom] = React.useState(100);
  const [showPaths, setShowPaths] = React.useState(true);
  const [showTasks, setShowTasks] = React.useState(true);
  const [showZones, setShowZones] = React.useState(false);

  const { 
    isRunning, 
    toggleSimulation, 
    resetSimulation, 
    setSpeed, 
    settings, 
    robots, 
    orders, 
    events, 
    obstacles, 
    shelves, 
    stations,
    activeScenario,
    setAlgorithm,
    setScenario,
    addRobot, 
    addObstacle, 
    generateOrder, 
    simulateFailure, 
    createCongestion 
  } = useLogiMindStore();

  const gridW = settings.gridWidth || 20;
  const gridH = settings.gridHeight || 20;

  return (
    <div className="simulation-page">
      {/* Top Map & Controls Area */}
      <div className="sim-main-grid">
        {/* Left: Map Area */}
        <div className="card map-card">
          <div className="map-toolbar">
            <div className="toolbar-left">
              <button 
                className="tool-btn" 
                title="Zoom In"
                onClick={() => setZoom(z => Math.min(200, z + 20))}
              >
                <ZoomIn size={16} />
              </button>
              <button 
                className="tool-btn" 
                title="Zoom Out"
                onClick={() => setZoom(z => Math.max(60, z - 20))}
              >
                <ZoomOut size={16} />
              </button>
              <button 
                className="tool-btn" 
                title="Reset Zoom"
                onClick={() => setZoom(100)}
              >
                <Minus size={16} />
              </button>
              <span className="zoom-level">{zoom}%</span>
              <select className="view-select">
                <option>20x20 Discrete Grid View</option>
              </select>
            </div>
            <div className="toolbar-right">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showPaths} 
                  onChange={(e) => setShowPaths(e.target.checked)}
                  className="toggle-input" 
                />
                <span className="toggle-slider blue"></span>
                Show Paths
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showTasks} 
                  onChange={(e) => setShowTasks(e.target.checked)}
                  className="toggle-input" 
                />
                <span className="toggle-slider blue"></span>
                Show Tasks
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showZones} 
                  onChange={(e) => setShowZones(e.target.checked)}
                  className="toggle-input" 
                />
                <span className="toggle-slider gray"></span>
                Show Zones
              </label>
            </div>
          </div>
          
          <div className="map-content" style={{ overflow: 'hidden' }}>
            <div 
              className="mock-warehouse-map full-size" 
              style={{ 
                position: 'relative',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Dynamic Shelves */}
              {shelves && shelves.length > 0 ? (
                shelves.map(([r, c], idx) => (
                  <div 
                    key={`shelf-${idx}`} 
                    className="mock-shelf" 
                    style={{ 
                      top: `${(r / gridH) * 100}%`, 
                      left: `${(c / gridW) * 100}%`,
                      width: '3.5%',
                      height: '3.5%'
                    }}
                  />
                ))
              ) : (
                <>
                  <div className="mock-shelf" style={{top: '15%', left: '15%'}}></div>
                  <div className="mock-shelf" style={{top: '15%', left: '25%'}}></div>
                  <div className="mock-shelf" style={{top: '35%', left: '15%'}}></div>
                  <div className="mock-shelf" style={{top: '35%', left: '25%'}}></div>
                  <div className="mock-shelf" style={{top: '60%', left: '15%'}}></div>
                  <div className="mock-shelf" style={{top: '60%', left: '25%'}}></div>
                  <div className="mock-shelf" style={{top: '15%', left: '55%'}}></div>
                  <div className="mock-shelf" style={{top: '35%', left: '55%'}}></div>
                  <div className="mock-shelf" style={{top: '60%', left: '55%'}}></div>
                </>
              )}

              {/* Dynamic Stations */}
              {stations && Object.keys(stations).length > 0 ? (
                Object.entries(stations).map(([stName, [r, c]]) => {
                  const isPacking = stName.includes('packing');
                  return (
                    <div 
                      key={stName} 
                      className={`mock-station ${isPacking ? 'packing' : 'pickup'}`}
                      style={{
                        top: `${(r / gridH) * 100}%`, 
                        left: `${(c / gridW) * 100}%`
                      }}
                      title={stName}
                    >
                      {isPacking ? 'P' : 'S'}
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="mock-station pickup" style={{top: '10%', left: '5%'}}>P</div>
                  <div className="mock-station pickup" style={{top: '40%', left: '90%'}}>P</div>
                  <div className="mock-station packing" style={{top: '80%', left: '85%'}}>P</div>
                </>
              )}
              
              {/* Dynamic Robots */}
              {robots.map((bot) => {
                const topPct = (bot.position[0] / gridH) * 100;
                const leftPct = (bot.position[1] / gridW) * 100;
                return (
                  <div 
                    key={bot.id} 
                    className={`mock-robot ${bot.status.toLowerCase()}`}
                    style={{ 
                      top: `${topPct}%`, 
                      left: `${leftPct}%`,
                      transition: 'top 0.5s linear, left 0.5s linear'
                    }}
                    title={`${bot.id} (${bot.status}) - ${bot.currentTask || 'Idle'}`}
                  >
                    <span 
                      className="robot-badge" 
                      style={{ backgroundColor: bot.color, color: '#fff' }}
                    >
                      {bot.id}
                    </span>
                    {bot.status === 'Active' && <div className="glow-ring green"></div>}
                    {bot.status === 'Failed' && <div className="glow-ring red"></div>}
                  </div>
                );
              })}
              
              {/* Dynamic Obstacles */}
              {obstacles && obstacles.map(([r, c], idx) => (
                <div 
                  key={`obs-${idx}`} 
                  className="mock-obstacle" 
                  style={{ 
                    top: `${(r / gridH) * 100}%`, 
                    left: `${(c / gridW) * 100}%`,
                    width: '32px',
                    height: '32px'
                  }}
                  title="Dynamic Obstacle"
                >
                  <AlertTriangle size={18} color="#ef4444" className="absolute-center" />
                </div>
              ))}
              
              {/* Paths Vector Overlay */}
              {showPaths && (
                <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {robots.map((bot) => {
                    if (!bot.path || bot.path.length === 0) return null;
                  const pts = [[bot.position[0], bot.position[1]], ...bot.path];
                  const dStr = pts
                    .map((p, idx) => {
                      const x = (p[1] / gridW) * 100;
                      const y = (p[0] / gridH) * 100;
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
                    })
                    .join(' ');
                  return (
                    <path 
                      key={`path-${bot.id}`} 
                      d={dStr} 
                      stroke={bot.color} 
                      strokeWidth="0.8" 
                      strokeDasharray="1.5 1.5" 
                      fill="none" 
                    />
                  );
                })}
              </svg>
              )}
            </div>
            
            <div className="map-legend">
              <div className="legend-item"><div className="legend-icon mock-shelf"></div> Shelf</div>
              <div className="legend-item"><div className="legend-icon bg-gray-200"></div> Aisle (Free)</div>
              <div className="legend-item"><div className="legend-icon mock-station pickup">S</div> Pickup Bay</div>
              <div className="legend-item"><div className="legend-icon mock-station packing">P</div> Packing Dock</div>
              <div className="legend-item"><div className="legend-icon mock-obstacle"></div> Dynamic Obstacle</div>
              <div className="legend-item"><div className="legend-icon mock-robot active"></div> Robot (Active)</div>
              <div className="legend-item"><div className="legend-icon mock-robot waiting"></div> Robot (Waiting)</div>
              <div className="legend-item"><div className="legend-icon mock-robot failed"></div> Robot (Failed)</div>
            </div>
          </div>
        </div>

        {/* Right: Controls Area */}
        <div className="sim-sidebar">
          {/* Navigation Algorithm Selector */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="card-title font-semibold flex items-center gap-2">
                <Cpu size={18} className="text-purple" />
                Algorithm Policy
              </h3>
              <span className="badge purple text-xs">{settings.algorithm || 'MAPPO'}</span>
            </div>
            <p className="text-xs text-secondary mb-2">Select the navigation & dispatching algorithm:</p>
            
            <div className="algo-buttons">
              {ALGORITHMS.map((algo) => {
                const isActive = (settings.algorithm || 'MAPPO') === algo.id;
                return (
                  <button
                    key={algo.id}
                    className={`algo-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setAlgorithm(algo.id)}
                    title={`Switch to ${algo.name}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="algo-btn-title">{algo.name}</span>
                      {isActive && <CheckCircle2 size={12} className="text-blue flex-shrink-0" />}
                    </div>
                    <span className="algo-btn-desc">{algo.desc}</span>
                  </button>
                );
              })}
            </div>

            {(settings.algorithm === 'MAPPO' || settings.algorithm === 'PPO' || !settings.algorithm) && (
              <div className="algo-status-pill">
                <Sparkles size={12} />
                <span>PyTorch Trained Model Weights Active</span>
              </div>
            )}
          </div>

          {/* Warehouse Scenarios Selector */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="card-title font-semibold flex items-center gap-2">
                <Activity size={18} className="text-orange" />
                Warehouse Scenarios
              </h3>
              <span className="badge orange text-xs">{activeScenario || 'Normal Operations'}</span>
            </div>
            <p className="text-xs text-secondary mb-2">Trigger real-time operating conditions:</p>

            <div className="scenario-list">
              {SCENARIOS.map((sc) => {
                const IconComponent = sc.icon;
                const isActive = (activeScenario || 'Normal Operations') === sc.id;
                return (
                  <div
                    key={sc.id}
                    className={`scenario-card-item ${isActive ? 'active' : ''}`}
                    onClick={() => setScenario(sc.id)}
                  >
                    <div className="scenario-icon">
                      <IconComponent size={15} className={isActive ? 'text-green' : 'text-secondary'} />
                    </div>
                    <div className="scenario-info">
                      <div className="scenario-title">
                        <span>{sc.name}</span>
                        {isActive && <span className="status-dot green"></span>}
                      </div>
                      <span className="scenario-desc">{sc.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="card p-4">
            <h3 className="card-title font-semibold mb-4">Simulation Controls</h3>
            <div className="control-buttons">
              <button 
                className={`ctrl-btn ${isRunning ? 'bg-green text-white' : 'bg-gray-100'}`}
                onClick={toggleSimulation}
              >
                {isRunning ? <><Pause size={16}/> Pause</> : <><Play size={16}/> Start</>}
              </button>
              <button className="ctrl-btn bg-gray-100" onClick={resetSimulation}>
                <RotateCcw size={16}/> Reset
              </button>
            </div>
            
            <div className="speed-control mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Simulation Speed</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0.5" 
                  max="5" 
                  step="0.5" 
                  value={settings.speed || 1.0} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="speed-slider" 
                />
                <div className="speed-val">{settings.speed || 1.0}x</div>
              </div>
            </div>

            <div className="dynamic-actions mt-6">
              <span className="text-sm font-semibold mb-3 block">Dynamic Actions</span>
              <div className="actions-grid">
                <button className="action-btn text-blue bg-blue-light" onClick={addRobot}>
                  <Plus size={16}/> Add Robot
                </button>
                <button className="action-btn text-gray-700 bg-gray-100" onClick={() => addObstacle()}>
                  <AlertTriangle size={16}/> Add Obstacle
                </button>
                <button className="action-btn text-orange bg-orange-light" onClick={generateOrder}>
                  <Package size={16}/> Generate Orders
                </button>
                <button className="action-btn text-red bg-red-light" onClick={() => simulateFailure()}>
                  <Zap size={16}/> Simulate Failure
                </button>
                <button className="action-btn text-purple bg-purple-light" onClick={createCongestion}>
                  <Users size={16}/> Create Congestion
                </button>
                <button className="action-btn text-gray-700 bg-gray-100" onClick={resetSimulation}>
                  <Trash2 size={16}/> Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Warehouse Info */}
          <div className="card p-4">
            <h3 className="card-title font-semibold mb-4">Warehouse Telemetry</h3>
            <div className="info-list">
              <div className="info-row"><span>Grid Dimensions</span><span className="font-semibold">{gridW} × {gridH}</span></div>
              <div className="info-row"><span>Active Algorithm</span><span className="font-semibold text-purple">{settings.algorithm || 'MAPPO'}</span></div>
              <div className="info-row"><span>Active Scenario</span><span className="font-semibold text-orange">{activeScenario || 'Normal Operations'}</span></div>
              <div className="info-row"><span>Total Storage Shelves</span><span className="font-semibold">{shelves?.length || 32}</span></div>
              <div className="info-row"><span>Active Robot Swarm</span><span className="font-semibold text-blue">{robots.length} AMRs</span></div>
              <div className="info-row"><span>Orders in Pipeline</span><span className="font-semibold text-orange">{orders.length}</span></div>
              <div className="info-row"><span>Dynamic Obstacles</span><span className="font-semibold text-red">{obstacles?.length || 0}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tables Area */}
      <div className="bottom-tables-grid">
        {/* Robot Status */}
        <div className="card">
          <div className="card-header px-4 pt-4 pb-2">
            <h3 className="card-title font-semibold">Robot Swarm Status</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Current Task</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {robots.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold" style={{ color: r.color }}>{r.id}</td>
                  <td>
                    <span className={`status-dot ${r.status.toLowerCase()} mr-2`}></span>
                    {r.status}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {Math.round(r.battery)}% 
                      <div className="mini-progress">
                        <div 
                          className={`fill ${r.battery < 30 ? 'bg-red' : r.battery < 70 ? 'bg-orange' : 'bg-green'}`} 
                          style={{width: `${r.battery}%`}}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{r.currentTask || 'None'}</td>
                  <td>({r.position[0]}, {r.position[1]})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active Orders */}
        <div className="card">
          <div className="card-header px-4 pt-4 pb-2">
            <h3 className="card-title font-semibold">Active Orders & Tasks</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Robot</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td className="font-semibold text-blue">{o.id}</td>
                  <td>{o.productName}</td>
                  <td><span className={`badge ${o.priority.toLowerCase()}`}>{o.priority}</span></td>
                  <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>{o.assignedRobot || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Event Log */}
        <div className="card">
          <div className="card-header px-4 pt-4 pb-2">
            <h3 className="card-title font-semibold">Dynamic Telemetry Stream</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 7).map((ev) => (
                <tr key={ev.id}>
                  <td className="font-mono text-xs">{ev.time}</td>
                  <td>
                    <span className={`status-dot ${ev.type} mr-2`}></span>
                    {ev.title}
                  </td>
                  <td className="text-secondary text-xs">{ev.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
