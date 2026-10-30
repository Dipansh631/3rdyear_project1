import React from 'react';
import {
  ZoomIn, ZoomOut, Maximize2,
  Play, Pause, RotateCcw,
  Plus, AlertTriangle, Package, Zap,
  Users, Trash2, Flame, ShieldAlert,
  Activity, BatteryCharging, Bot, Cpu, CheckCircle2,
} from 'lucide-react';
import { useLogiMindStore } from '../store/useLogiMindStore';
import './Simulation.css';

const ALGORITHMS = [
  { id: 'MAPPO',      label: 'MAPPO (Trained)',      color: '#8b5cf6' },
  { id: 'PPO',        label: 'PPO (Trained)',         color: '#3b82f6' },
  { id: 'A*',         label: 'A* Search (Classical)', color: '#10b981' },
  { id: 'Rule-Based', label: 'Rule-Based (Baseline)', color: '#f59e0b' },
  { id: 'Q-MIX',     label: 'Q-MIX (Co-op)',         color: '#ef4444' },
];

const SCENARIOS = [
  { id: 'Normal Operations',             label: 'Normal Operations',        icon: Activity       },
  { id: 'Peak Demand Surge',             label: 'Peak Demand Surge',        icon: Flame          },
  { id: 'Obstacle Surge',                label: 'Obstacle Surge',           icon: AlertTriangle  },
  { id: 'Fleet Failure Recovery',        label: 'Fleet Failure Recovery',   icon: ShieldAlert    },
  { id: 'Aisle Bottleneck & Congestion', label: 'Aisle Bottleneck',         icon: Users          },
  { id: 'Battery Depletion & Docking',   label: 'Battery Depletion',        icon: BatteryCharging},
];

export const Simulation: React.FC = () => {
  const [zoom, setZoom] = React.useState(100);
  const [showPaths, setShowPaths] = React.useState(true);
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
    recoverRobot,
    createCongestion,
  } = useLogiMindStore();

  const failedCount = robots.filter(r => r.status === 'Failed').length;

  const gridW = settings.gridWidth  || 20;
  const gridH = settings.gridHeight || 20;

  const activeAlgo = ALGORITHMS.find(a => a.id === settings.algorithm) || ALGORITHMS[0];

  return (
    <div className="sim-page">

      {/* ── TOP STRIP: algorithm + scenario + status ── */}
      <div className="sim-topbar">
        <div className="sim-topbar-left">
          <div className="sim-brand">
            <Cpu size={18} className="sim-brand-icon" />
            <span>LogiMind Simulation</span>
          </div>

          <div className="sim-select-group">
            <label className="sim-select-label">Algorithm</label>
            <select
              className="sim-select algo"
              value={settings.algorithm || 'MAPPO'}
              onChange={e => setAlgorithm(e.target.value)}
            >
              {ALGORITHMS.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>

          <div className="sim-select-group">
            <label className="sim-select-label">Scenario</label>
            <select
              className="sim-select scenario"
              value={activeScenario || 'Normal Operations'}
              onChange={e => setScenario(e.target.value)}
            >
              {SCENARIOS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sim-topbar-right">
          <div className={`sim-status-pill ${isRunning ? 'running' : 'paused'}`}>
            <span className="sim-status-dot" />
            {isRunning ? 'Running' : 'Paused'}
          </div>
          <span className="sim-algo-tag" style={{ borderColor: activeAlgo.color, color: activeAlgo.color }}>
            {activeAlgo.id}
          </span>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="sim-body">

        {/* LEFT: Map card */}
        <div className="sim-map-card card">

          {/* Map toolbar */}
          <div className="sim-map-toolbar">
            <div className="sim-map-toolbar-left">
              <button className="sim-tool-btn" title="Zoom In"    onClick={() => setZoom(z => Math.min(200, z + 20))}><ZoomIn size={15} /></button>
              <button className="sim-tool-btn" title="Zoom Out"   onClick={() => setZoom(z => Math.max(40,  z - 20))}><ZoomOut size={15} /></button>
              <button className="sim-tool-btn" title="Reset Zoom" onClick={() => setZoom(100)}><Maximize2 size={15} /></button>
              <span className="sim-zoom-badge">{zoom}%</span>
            </div>
            <div className="sim-map-toolbar-right">
              <label className="sim-toggle-label">
                <input type="checkbox" className="sim-toggle-input" checked={showPaths} onChange={e => setShowPaths(e.target.checked)} />
                <span className="sim-toggle-track" />
                Paths
              </label>
              <label className="sim-toggle-label">
                <input type="checkbox" className="sim-toggle-input" checked={showZones} onChange={e => setShowZones(e.target.checked)} />
                <span className="sim-toggle-track" />
                Zones
              </label>
            </div>
          </div>

          {/* Map canvas */}
          <div className="sim-map-canvas-wrap">
            <div
              className="sim-map-canvas"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Grid overlay when showZones */}
              {showZones && (
                <svg className="sim-zone-grid" viewBox={`0 0 ${gridW} ${gridH}`} preserveAspectRatio="none">
                  {Array.from({ length: gridW + 1 }, (_, i) => (
                    <line key={`v${i}`} x1={i} y1={0} x2={i} y2={gridH} stroke="rgba(99,102,241,0.15)" strokeWidth="0.05" />
                  ))}
                  {Array.from({ length: gridH + 1 }, (_, i) => (
                    <line key={`h${i}`} x1={0} y1={i} x2={gridW} y2={i} stroke="rgba(99,102,241,0.15)" strokeWidth="0.05" />
                  ))}
                </svg>
              )}

              {/* Shelves */}
              {(shelves && shelves.length > 0 ? shelves : (
                [[3,3],[3,5],[3,7],[3,9],[3,11],[3,13],
                 [7,3],[7,5],[7,7],[7,9],[7,11],[7,13],
                 [12,3],[12,5],[12,7],[12,9],[12,11],[12,13]] as [number,number][]
              )).map(([r, c], idx) => (
                <div
                  key={`shelf-${idx}`}
                  className="sim-shelf"
                  style={{ top: `${((r + 0.5) / gridH) * 100}%`, left: `${((c + 0.5) / gridW) * 100}%` }}
                />
              ))}

              {/* Stations */}
              {(stations && Object.keys(stations).length > 0
                ? Object.entries(stations).map(([name, [r, c]]) => ({ name, r, c, isPacking: name.includes('packing') }))
                : [
                    { name: 'Pickup-1', r: 1,  c: 1,  isPacking: false },
                    { name: 'Pickup-2', r: 10, c: 18, isPacking: false },
                    { name: 'Packing-1',r: 18, c: 17, isPacking: true  },
                  ]
              ).map(({ name, r, c, isPacking }) => (
                <div
                  key={name}
                  className={`sim-station ${isPacking ? 'packing' : 'pickup'}`}
                  style={{ top: `${((r + 0.5) / gridH) * 100}%`, left: `${((c + 0.5) / gridW) * 100}%` }}
                  title={name}
                >
                  {isPacking ? 'P' : 'S'}
                </div>
              ))}

              {/* Obstacles */}
              {obstacles && obstacles.map(([r, c], idx) => (
                <div
                  key={`obs-${idx}`}
                  className="sim-obstacle"
                  style={{ top: `${((r + 0.5) / gridH) * 100}%`, left: `${((c + 0.5) / gridW) * 100}%` }}
                  title="Dynamic Obstacle"
                >
                  <AlertTriangle size={14} />
                </div>
              ))}

              {/* Robots */}
              {robots.map(bot => (
                <div
                  key={bot.id}
                  className={`sim-robot ${bot.status.toLowerCase()}`}
                  style={{
                    top:  `${((bot.position[0] + 0.5) / gridH) * 100}%`,
                    left: `${((bot.position[1] + 0.5) / gridW) * 100}%`,
                    '--robot-color': bot.color,
                    transition: 'top 0.5s linear, left 0.5s linear',
                  } as React.CSSProperties}
                  title={`${bot.id} · ${bot.status} · ${bot.currentTask || 'Idle'}`}
                >
                  <Bot size={12} />
                  <span className="sim-robot-label">{bot.id}</span>
                  {bot.status === 'Active' && <span className="sim-robot-pulse" />}
                </div>
              ))}

              {/* Paths SVG */}
              {showPaths && (
                <svg
                  className="sim-paths-svg"
                  viewBox={`0 0 ${gridW} ${gridH}`}
                  preserveAspectRatio="none"
                >
                  {robots.map(bot => {
                    if (!bot.path || bot.path.length === 0) return null;
                    const pts = [bot.position, ...bot.path];
                    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[1] + 0.5} ${p[0] + 0.5}`).join(' ');
                    return (
                      <path
                        key={`path-${bot.id}`}
                        d={d}
                        stroke={bot.color}
                        strokeWidth="0.25"
                        strokeDasharray="0.5 0.3"
                        fill="none"
                        opacity={0.75}
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="sim-legend">
            <div className="sim-legend-item"><div className="sim-legend-swatch shelf"   /><span>Shelf</span></div>
            <div className="sim-legend-item"><div className="sim-legend-swatch pickup"  /><span>Pickup</span></div>
            <div className="sim-legend-item"><div className="sim-legend-swatch packing" /><span>Packing</span></div>
            <div className="sim-legend-item"><div className="sim-legend-swatch obstacle"/><span>Obstacle</span></div>
            <div className="sim-legend-item"><div className="sim-legend-swatch robot-active"  /><span>Active Robot</span></div>
            <div className="sim-legend-item"><div className="sim-legend-swatch robot-waiting" /><span>Idle Robot</span></div>
            <div className="sim-legend-item"><div className="sim-legend-swatch robot-failed"  /><span>Failed Robot</span></div>
          </div>
        </div>

        {/* RIGHT: Controls sidebar */}
        <div className="sim-sidebar">

          {/* Playback controls */}
          <div className="card sim-ctrl-card">
            <h3 className="sim-ctrl-title">Simulation Controls</h3>

            <div className="sim-ctrl-row">
              <button
                className={`sim-ctrl-btn primary ${isRunning ? 'pause' : 'play'}`}
                onClick={toggleSimulation}
              >
                {isRunning ? <><Pause size={15}/> Pause</> : <><Play size={15}/> Start</>}
              </button>
              <button className="sim-ctrl-btn secondary" onClick={resetSimulation}>
                <RotateCcw size={15}/> Reset
              </button>
            </div>

            <div className="sim-speed-block">
              <div className="sim-speed-header">
                <span>Speed</span>
                <span className="sim-speed-value">{settings.speed || 1.0}×</span>
              </div>
              <input
                type="range"
                min="0.5" max="5" step="0.5"
                value={settings.speed || 1.0}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="sim-speed-slider"
              />
              <div className="sim-speed-ticks">
                <span>0.5×</span><span>2.5×</span><span>5×</span>
              </div>
            </div>

            <div className="sim-divider" />

            <span className="sim-section-label">Dynamic Actions</span>
            <div className="sim-actions-grid">
              <button className="sim-action-btn blue"   onClick={addRobot}>
                <Plus size={14}/> Add Robot
              </button>
              <button className="sim-action-btn gray"   onClick={() => addObstacle()}>
                <AlertTriangle size={14}/> Add Obstacle
              </button>
              <button className="sim-action-btn orange" onClick={generateOrder}>
                <Package size={14}/> Gen Order
              </button>
              <button className="sim-action-btn red" onClick={() => simulateFailure()} title={failedCount > 0 ? `${failedCount} failed AMR(s). Click to fail next AMR or cycle.` : 'Simulate hardware fault on next AMR'}>
                <Zap size={14}/> Sim Failure {failedCount > 0 ? `(${failedCount})` : ''}
              </button>
              <button className="sim-action-btn purple" onClick={createCongestion} title="Spawn dynamic aisle bottleneck & recalculate routes">
                <Users size={14}/> Congestion
              </button>
              <button className="sim-action-btn gray"   onClick={resetSimulation} title="Reset simulation state">
                <Trash2 size={14}/> Clear All
              </button>
              {failedCount > 0 && (
                <button
                  className="sim-action-btn green"
                  style={{ gridColumn: 'span 2' }}
                  onClick={() => robots.filter(r => r.status === 'Failed').forEach(r => recoverRobot(r.id))}
                  title="Recover all failed robots back to active fleet"
                >
                  <CheckCircle2 size={14}/> Recover Fleet ({failedCount})
                </button>
              )}
            </div>
          </div>

          {/* Telemetry */}
          <div className="card sim-tele-card">
            <h3 className="sim-ctrl-title">Warehouse Telemetry</h3>
            <div className="sim-tele-list">
              {[
                { label: 'Grid',       value: `${gridW} × ${gridH}` },
                { label: 'Algorithm',  value: settings.algorithm || 'MAPPO',         accent: 'purple' },
                { label: 'Scenario',   value: activeScenario || 'Normal Operations', accent: 'orange' },
                { label: 'Shelves',    value: `${shelves?.length || 18}` },
                { label: 'Robots',     value: `${robots.length} AMRs`,               accent: 'blue'   },
                { label: 'Orders',     value: `${orders.length}`,                    accent: 'orange' },
                { label: 'Obstacles',  value: `${obstacles?.length || 0}`,           accent: 'red'    },
              ].map(row => (
                <div className="sim-tele-row" key={row.label}>
                  <span className="sim-tele-key">{row.label}</span>
                  <span className={`sim-tele-val ${row.accent || ''}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TABLES ── */}
      <div className="sim-tables-grid">

        {/* Robot table */}
        <div className="card sim-table-card">
          <div className="sim-table-header">
            <h3 className="sim-ctrl-title">Robot Swarm Status</h3>
            <span className="sim-table-count">{robots.length} AMRs</span>
          </div>
          <div className="sim-table-scroll">
            <table className="sim-table">
              <thead>
                <tr>
                  <th>ID</th><th>Status</th><th>Battery</th><th>Task</th><th>Position</th>
                </tr>
              </thead>
              <tbody>
                {robots.map(r => (
                  <tr key={r.id}>
                    <td><span className="sim-robot-id" style={{ color: r.color }}>{r.id}</span></td>
                    <td>
                      <span
                        className={`sim-status-badge ${r.status.toLowerCase()}`}
                        style={r.status === 'Failed' ? { cursor: 'pointer' } : undefined}
                        onClick={() => { if (r.status === 'Failed') recoverRobot(r.id); }}
                        title={r.status === 'Failed' ? 'Click to Recover this AMR' : undefined}
                      >
                        <span className="sim-sdot" />
                        {r.status}
                        {r.status === 'Failed' && <span style={{ marginLeft: 4, textDecoration: 'underline', fontSize: '0.65rem' }}>↺ Fix</span>}
                      </span>
                    </td>
                    <td>
                      <div className="sim-batt-cell">
                        <span>{Math.round(r.battery)}%</span>
                        <div className="sim-batt-bar">
                          <div
                            className={`sim-batt-fill ${r.battery < 30 ? 'red' : r.battery < 70 ? 'orange' : 'green'}`}
                            style={{ width: `${r.battery}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="sim-task-cell">{r.currentTask || '—'}</td>
                    <td className="sim-pos-cell">({r.position[0]}, {r.position[1]})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders table */}
        <div className="card sim-table-card">
          <div className="sim-table-header">
            <h3 className="sim-ctrl-title">Active Orders</h3>
            <span className="sim-table-count">{orders.length} total</span>
          </div>
          <div className="sim-table-scroll">
            <table className="sim-table">
              <thead>
                <tr>
                  <th>Order</th><th>Product</th><th>Priority</th><th>Status</th><th>Robot</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o, idx) => (
                  <tr key={`${o.id}-${idx}`}>
                    <td><span className="sim-order-id">{o.id}</span></td>
                    <td className="sim-product-cell">{o.productName}</td>
                    <td><span className={`sim-badge priority-${o.priority.toLowerCase()}`}>{o.priority}</span></td>
                    <td><span className={`sim-badge status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td className="sim-assigned">{o.assignedRobot || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Events table */}
        <div className="card sim-table-card">
          <div className="sim-table-header">
            <h3 className="sim-ctrl-title">Telemetry Stream</h3>
            <span className="sim-table-count">Live</span>
          </div>
          <div className="sim-table-scroll">
            <table className="sim-table">
              <thead>
                <tr>
                  <th>Time</th><th>Event</th><th>Details</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 8).map((ev, idx) => (
                  <tr key={`${ev.id}-${idx}`}>
                    <td className="sim-time-cell">{ev.time}</td>
                    <td>
                      <div className="sim-event-cell">
                        <span className={`sim-event-dot ${ev.type}`} />
                        <span>{ev.title}</span>
                      </div>
                    </td>
                    <td className="sim-detail-cell">{ev.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
