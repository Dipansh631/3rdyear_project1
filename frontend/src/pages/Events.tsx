import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Plus, 
  Play, 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  Cpu
} from 'lucide-react';
import { useLogiMindStore } from '../store/useLogiMindStore';
import './Events.css';

export const Events: React.FC = () => {
  const { 
    events, 
    addObstacle, 
    simulateFailure, 
    createCongestion, 
    generateOrder, 
    addRobot,
    addEvent 
  } = useLogiMindStore();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'warning' | 'error' | 'info' | 'success'>('ALL');
  const [customEventTitle, setCustomEventTitle] = useState('');
  const [customEventDetails, setCustomEventDetails] = useState('');
  const [customEventType, setCustomEventType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

  const filteredEvents = events.filter(e => {
    if (selectedCategory === 'ALL') return true;
    return e.type === selectedCategory;
  });

  const handlePostCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEventTitle.trim()) return;
    addEvent({
      type: customEventType,
      title: customEventTitle,
      details: customEventDetails || 'Operator manual environment injection.'
    });
    setCustomEventTitle('');
    setCustomEventDetails('');
  };

  return (
    <div className="events-page">
      {/* Dynamic Controls Header Banner */}
      <div className="card dynamic-triggers-banner p-6">
        <div className="triggers-header mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-orange" size={24} /> Dynamic Environment Triggers
            </h2>
            <p className="card-subtitle">
              Inject real-time disturbances to observe MARL policy adaptation, collision avoidance, and dynamic task re-assignment.
            </p>
          </div>
          <span className="badge normal text-xs px-3 py-1">
            MARL Online Adaptation: ACTIVE
          </span>
        </div>

        <div className="trigger-buttons-grid">
          <button 
            className="trigger-card obstacle-trigger"
            onClick={() => addObstacle()}
          >
            <div className="trigger-icon bg-orange-light text-orange">
              <AlertTriangle size={24} />
            </div>
            <div className="trigger-text">
              <span className="trigger-name font-semibold">+ Add Dynamic Obstacle</span>
              <span className="trigger-desc">Drops aisle obstruction; forces A* / MARL path reroute</span>
            </div>
          </button>

          <button 
            className="trigger-card failure-trigger"
            onClick={() => simulateFailure()}
          >
            <div className="trigger-icon bg-red-light text-red">
              <Flame size={24} />
            </div>
            <div className="trigger-text">
              <span className="trigger-name font-semibold">⚠ Simulate Robot Failure</span>
              <span className="trigger-desc">Stalls random AMR; triggers peer task reassignment</span>
            </div>
          </button>

          <button 
            className="trigger-card congestion-trigger"
            onClick={() => createCongestion()}
          >
            <div className="trigger-icon bg-purple-light text-purple">
              <ShieldAlert size={24} />
            </div>
            <div className="trigger-text">
              <span className="trigger-name font-semibold">🚦 Create Congestion</span>
              <span className="trigger-desc">Simulates aisle deadlock & multi-agent bottleneck</span>
            </div>
          </button>

          <button 
            className="trigger-card demand-trigger"
            onClick={() => {
              generateOrder();
              generateOrder();
              generateOrder();
            }}
          >
            <div className="trigger-icon bg-blue-light text-blue">
              <TrendingUp size={24} />
            </div>
            <div className="trigger-text">
              <span className="trigger-name font-semibold">📦 Peak Demand Surge</span>
              <span className="trigger-desc">Injects 3 high-priority orders into queue</span>
            </div>
          </button>

          <button 
            className="trigger-card robot-trigger"
            onClick={() => addRobot()}
          >
            <div className="trigger-icon bg-green-light text-green">
              <Plus size={24} />
            </div>
            <div className="trigger-text">
              <span className="trigger-name font-semibold">🤖 Spawn AMR into Swarm</span>
              <span className="trigger-desc">Adds new agent sharing MAPPO actor network</span>
            </div>
          </button>
        </div>
      </div>

      <div className="events-content-grid">
        {/* Left Column: Live Event Timeline */}
        <div className="events-main-col">
          <div className="card">
            <div className="card-header px-4 pt-4 pb-2 border-b flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="card-title">Live Environmental Telemetry & Log</h3>
                <p className="card-subtitle">Real-time trace of sensor hits, collisions, and policy replans</p>
              </div>
              <div className="flex gap-2">
                <button 
                  className={`filter-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('ALL')}
                >
                  All ({events.length})
                </button>
                <button 
                  className={`filter-chip text-red ${selectedCategory === 'error' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('error')}
                >
                  Errors
                </button>
                <button 
                  className={`filter-chip text-orange ${selectedCategory === 'warning' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('warning')}
                >
                  Warnings
                </button>
                <button 
                  className={`filter-chip text-blue ${selectedCategory === 'info' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('info')}
                >
                  System Info
                </button>
              </div>
            </div>

            <div className="timeline-container p-4">
              {filteredEvents.map((ev, index) => (
                <div key={`${ev.id}-${index}`} className={`timeline-entry ${ev.type}`}>
                  <div className="timeline-left">
                    <span className="timeline-badge-time font-mono">{ev.time}</span>
                    <div className={`timeline-bullet ${ev.type}`}>
                      {ev.type === 'error' && <AlertTriangle size={14} />}
                      {ev.type === 'warning' && <AlertTriangle size={14} />}
                      {ev.type === 'info' && <Info size={14} />}
                      {ev.type === 'success' && <CheckCircle2 size={14} />}
                    </div>
                    {index < filteredEvents.length - 1 && <div className="timeline-connector"></div>}
                  </div>
                  <div className="timeline-body">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm">{ev.title}</h4>
                      {ev.entityId && (
                        <span className="badge normal text-xs font-mono">{ev.entityId}</span>
                      )}
                    </div>
                    <p className="text-secondary text-xs mt-1">{ev.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Disturbance Injection & Sensor Analytics */}
        <div className="events-sidebar-col">
          {/* Custom Event Creator */}
          <div className="card p-4 mb-4">
            <h3 className="card-title font-semibold mb-2">Custom Anomaly Injection</h3>
            <p className="text-secondary text-xs mb-4">Simulate edge-cases and manual warehouse disruptions</p>

            <form onSubmit={handlePostCustomEvent} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Severity / Event Type</label>
                <select 
                  className="filter-select w-full"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value as any)}
                >
                  <option value="warning">Warning (Obstruction / Delay)</option>
                  <option value="error">Critical (Failure / Deadlock)</option>
                  <option value="info">Informational (Sensory Update)</option>
                  <option value="success">Resolution (Cleared / Ready)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Event Title</label>
                <input 
                  type="text" 
                  className="search-input w-full"
                  placeholder="e.g. Laser Scanner Occluded"
                  value={customEventTitle}
                  onChange={(e) => setCustomEventTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Details & Spatial Coord</label>
                <textarea 
                  className="search-input w-full text-xs" 
                  rows={2} 
                  placeholder="e.g. Shelf C-02 aisle obstructed by fallen pallet."
                  value={customEventDetails}
                  onChange={(e) => setCustomEventDetails(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-1">
                <Play size={14} /> Inject into Simulation
              </button>
            </form>
          </div>

          {/* MARL Resilience Metrics */}
          <div className="card p-4">
            <h3 className="card-title font-semibold mb-3 flex items-center gap-2">
              <Cpu size={18} className="text-blue" /> MARL Swarm Resilience
            </h3>
            <div className="resilience-stats">
              <div className="stat-line">
                <span className="text-secondary text-xs">Dynamic Replanning Speed</span>
                <span className="font-semibold text-sm text-green">14.2 ms</span>
              </div>
              <div className="stat-line">
                <span className="text-secondary text-xs">Autonomous Deadlock Resolution</span>
                <span className="font-semibold text-sm text-blue">99.4%</span>
              </div>
              <div className="stat-line">
                <span className="text-secondary text-xs">Peer Reassignment Overhead</span>
                <span className="font-semibold text-sm text-secondary">0.4 sec</span>
              </div>
              <div className="stat-line">
                <span className="text-secondary text-xs">Active MARL Policy Loss</span>
                <span className="font-semibold text-sm text-purple">0.021</span>
              </div>
            </div>

            <div className="p-3 bg-blue-light rounded-lg mt-4 text-xs text-blue border border-blue-200">
              💡 <strong>System Note:</strong> Multi-Agent PPO (MAPPO) uses centralized training with decentralized execution (CTDE), enabling individual robots to navigate unexpected obstacles using only local lidar observations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
