import React, { useState } from 'react';
import { 
  Bot,
  Search,
  Plus,
  Eye,
  Trash2,
  Battery,
  Zap,
  Navigation,
  ArrowUpRight,
  BatteryCharging,
  Package,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { useLogiMindStore } from '../store/useLogiMindStore';
import type { Robot } from '../store/useLogiMindStore';
import './RobotFleet.css';

const fleetUtilizationData = Array.from({ length: 30 }, (_, i) => ({
  time: `04:${i < 10 ? '0'+i : i}`,
  value: 70 + Math.random() * 25
}));

export const RobotFleet: React.FC = () => {
  const { robots, addRobot, removeRobot, simulateFailure, recoverRobot, assignTask, orders } = useLogiMindStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(robots[0] || null);

  const activeBot = selectedRobot ? (robots.find(r => r.id === selectedRobot.id) || selectedRobot) : (robots[0] || null);

  const activeCount = robots.filter(r => r.status === 'Active').length;
  const waitingCount = robots.filter(r => r.status === 'Waiting').length;
  const failedCount = robots.filter(r => r.status === 'Failed').length;
  const chargingCount = robots.filter(r => r.status === 'Charging').length;
  const maintCount = robots.filter(r => r.status === 'Maintenance').length;

  const filteredRobots = robots.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const taskDistData = [
    { name: 'Picking', value: robots.filter(r => r.taskType === 'Picking').length || 1, color: '#3b82f6' },
    { name: 'Transport', value: robots.filter(r => r.taskType === 'Transport').length || 2, color: '#f59e0b' },
    { name: 'Charging', value: chargingCount || 1, color: '#8b5cf6' },
    { name: 'Idle', value: waitingCount || 1, color: '#94a3b8' }
  ];

  return (
    <div className="robot-fleet-page">
      {/* Top Stat Cards */}
      <div className="fleet-stats-row">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-blue-light text-blue"><Bot size={24} /></div>
            <div className="stat-info">
              <div className="stat-label">Total Robots</div>
              <div className="stat-val-row">
                <span className="stat-val">{robots.length}</span>
                <span className="stat-change text-green"><ArrowUpRight size={14}/> Fleet</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-blue" style={{width: '100%'}}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-green-light text-green"><div className="status-dot active"></div></div>
            <div className="stat-info">
              <div className="stat-label">Active</div>
              <div className="stat-val-row">
                <span className="stat-val">{activeCount}</span>
                <span className="text-secondary text-sm font-semibold">{robots.length ? Math.round((activeCount/robots.length)*100) : 0}%</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-green" style={{width: `${robots.length ? (activeCount/robots.length)*100 : 0}%`}}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-orange-light text-orange"><div className="status-dot waiting"></div></div>
            <div className="stat-info">
              <div className="stat-label">Waiting</div>
              <div className="stat-val-row">
                <span className="stat-val">{waitingCount}</span>
                <span className="text-secondary text-sm font-semibold">{robots.length ? Math.round((waitingCount/robots.length)*100) : 0}%</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-orange" style={{width: `${robots.length ? (waitingCount/robots.length)*100 : 0}%`}}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-red-light text-red"><div className="status-dot failed"></div></div>
            <div className="stat-info">
              <div className="stat-label">Failed</div>
              <div className="stat-val-row">
                <span className="stat-val">{failedCount}</span>
                <span className="text-secondary text-sm font-semibold">{robots.length ? Math.round((failedCount/robots.length)*100) : 0}%</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-red" style={{width: `${robots.length ? (failedCount/robots.length)*100 : 0}%`}}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-blue-light text-blue"><div className="status-dot bg-blue"></div></div>
            <div className="stat-info">
              <div className="stat-label">Charging</div>
              <div className="stat-val-row">
                <span className="stat-val">{chargingCount}</span>
                <span className="text-secondary text-sm font-semibold">{robots.length ? Math.round((chargingCount/robots.length)*100) : 0}%</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-blue" style={{width: `${robots.length ? (chargingCount/robots.length)*100 : 0}%`}}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-purple-light text-purple"><div className="status-dot" style={{backgroundColor: '#8b5cf6'}}></div></div>
            <div className="stat-info">
              <div className="stat-label">Maintenance</div>
              <div className="stat-val-row">
                <span className="stat-val">{maintCount}</span>
                <span className="text-secondary text-sm font-semibold">Standby</span>
              </div>
            </div>
          </div>
          <div className="stat-progress" style={{backgroundColor: '#8b5cf6', width: `${maintCount ? 20 : 0}%`}}></div>
        </div>
      </div>

      <div className="fleet-main-grid">
        {/* Left Column (Main) */}
        <div className="fleet-main-col">
          {/* Robot Fleet Overview Table */}
          <div className="card">
            <div className="card-header px-4 pt-4 pb-2 border-b flex-wrap gap-2">
              <div>
                <h3 className="card-title">Robot Fleet Swarm Overview</h3>
                <p className="card-subtitle">Live multi-agent states and positions</p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="search-box">
                  <Search size={16} className="text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search robot ID..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="WAITING">Waiting</option>
                  <option value="FAILED">Failed</option>
                  <option value="CHARGING">Charging</option>
                </select>
                <button className="btn-primary" onClick={addRobot}>
                  <Plus size={16}/> Add Robot
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table fleet-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Robot</th>
                    <th>Status</th>
                    <th>Battery</th>
                    <th>Current Task</th>
                    <th>Position</th>
                    <th>Speed</th>
                    <th>Load</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRobots.map(r => (
                    <tr 
                      key={r.id} 
                      className={activeBot?.id === r.id ? 'row-selected' : ''}
                      onClick={() => setSelectedRobot(r)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="font-semibold" style={{ color: r.color }}>{r.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="robot-icon-small" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                            <Bot size={18} />
                          </div>
                          <span className="font-semibold text-xs">{r.name}</span>
                        </div>
                      </td>
                      <td><span className={`status-dot ${r.status.toLowerCase()} mr-2`}></span>{r.status}</td>
                      <td>
                        <div className="flex items-center gap-2 font-semibold">
                          {Math.round(r.battery)}% 
                          <div className="mini-progress">
                            <div className={`fill ${r.battery < 30 ? 'bg-red' : r.battery < 70 ? 'bg-orange' : 'bg-green'}`} style={{width: `${r.battery}%`}}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-blue">{r.currentTask || 'None'}</div>
                        <div className="text-xs text-secondary">{r.taskType}</div>
                      </td>
                      <td className="font-mono">({r.position[0]}, {r.position[1]})</td>
                      <td>{r.speed} m/s</td>
                      <td className="text-secondary">{r.load} / {r.maxLoad}</td>
                      <td>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="action-icon-btn" 
                            title="View Robot"
                            onClick={() => setSelectedRobot(r)}
                          >
                            <Eye size={15}/>
                          </button>
                          {r.status === 'Failed' ? (
                            <button 
                              className="action-icon-btn text-green" 
                              title="Recover Robot"
                              onClick={() => recoverRobot(r.id)}
                            >
                              <RotateCcw size={15}/>
                            </button>
                          ) : (
                            <button 
                              className="action-icon-btn text-red" 
                              title="Simulate Failure"
                              onClick={() => simulateFailure(r.id)}
                            >
                              <Zap size={15}/>
                            </button>
                          )}
                          <button 
                            className="action-icon-btn text-danger" 
                            title="Decommission Robot"
                            onClick={() => removeRobot(r.id)}
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Under Table Grid */}
          <div className="under-table-grid">
            {/* Map */}
            <div className="card p-4">
              <h3 className="card-title mb-4 font-semibold">Live Swarm Radar</h3>
              <div className="fleet-map-container">
                <div className="mock-warehouse-map" style={{ position: 'relative' }}>
                  <div className="mock-station pickup" style={{top: '15%', left: '5%'}}>S</div>
                  <div className="mock-station packing" style={{top: '75%', left: '85%'}}>P</div>
                  {robots.map((r) => (
                    <div 
                      key={r.id} 
                      className={`mock-robot ${r.status.toLowerCase()}`} 
                      style={{
                        top: `${(r.position[0] / 20) * 100}%`, 
                        left: `${(r.position[1] / 20) * 100}%`,
                        transition: 'top 0.5s linear, left 0.5s linear'
                      }}
                      onClick={() => setSelectedRobot(r)}
                    >
                      <span className="robot-badge" style={{ backgroundColor: r.color, color: '#fff' }}>{r.id}</span>
                    </div>
                  ))}
                  <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 15 30 C 15 50, 30 60, 40 60" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1.5 1.5" fill="none" />
                  </svg>
                </div>
                <div className="map-legend">
                  <div className="legend-item"><div className="legend-icon mock-robot active"></div> Robot (Active)</div>
                  <div className="legend-item"><div className="legend-icon mock-robot waiting"></div> Robot (Waiting)</div>
                  <div className="legend-item"><div className="legend-icon mock-robot failed"></div> Robot (Failed)</div>
                </div>
              </div>
            </div>

            {/* Charts Col */}
            <div className="flex flex-col gap-4">
              <div className="card p-4 flex-1">
                <div className="flex justify-between mb-4">
                  <h3 className="card-title font-semibold">Live Battery Telemetry</h3>
                </div>
                <div className="battery-bars">
                  {robots.map((r) => (
                    <div className="batt-row" key={r.id}>
                      <span className="w-6 font-semibold" style={{ color: r.color }}>{r.id}</span>
                      <div className="mini-progress flex-1">
                        <div 
                          className={`fill ${r.battery < 30 ? 'bg-red' : r.battery < 70 ? 'bg-orange' : 'bg-green'}`} 
                          style={{width: `${r.battery}%`}}
                        />
                      </div>
                      <span className="text-sm font-semibold ml-2 w-10 text-right">{Math.round(r.battery)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="card-title font-semibold">Task Distribution</h3>
                </div>
                <div className="flex items-center h-full">
                  <div className="pie-container" style={{width: 90, height: 90}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={taskDistData} innerRadius={30} outerRadius={42} paddingAngle={2} dataKey="value">
                          {taskDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pie-legend" style={{gap: '0.2rem'}}>
                    {taskDistData.map(item => (
                      <div className="pie-legend-item" key={item.name}>
                        <div className="flex items-center gap-1.5">
                          <span className="status-dot" style={{backgroundColor: item.color}}></span>
                          <span className="text-xs">{item.name}</span>
                        </div>
                        <span className="font-semibold text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row spanning under map & charts */}
          <div className="bottom-timeline-grid">
            <div className="card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title font-semibold">Fleet Utilization <span className="text-secondary font-normal">(Last 30m)</span></h3>
              </div>
              <div className="chart-container" style={{height: 120}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fleetUtilizationData}>
                    <XAxis dataKey="time" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 50, 100]} tickFormatter={v => `${v}%`}/>
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} fill="#ecfdf5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title font-semibold">Robot Swarm Gantt Allocation</h3>
              </div>
              <div className="timeline-chart">
                {robots.slice(0, 5).map((r, idx) => (
                  <div className="timeline-row" key={r.id}>
                    <div className="timeline-lbl" style={{ color: r.color }}>{r.id}</div>
                    <div className="timeline-bar-track">
                      <div 
                        className={`t-bar ${r.status === 'Failed' ? 'bg-red' : r.status === 'Active' ? 'bg-green' : 'bg-orange'}`} 
                        style={{left: `${idx * 15}%`, width: '45%'}}
                      />
                    </div>
                  </div>
                ))}
                <div className="timeline-axis">
                  <span>04:00</span><span>04:10</span><span>04:20</span><span>04:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="fleet-right-col">
          <div className="card flex flex-col h-full">
            <div className="card-header p-4 border-b">
              <h3 className="card-title font-semibold">Robot Details</h3>
            </div>
            
            {activeBot ? (
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="robot-profile mb-6">
                  <div 
                    className="robot-img-large flex items-center justify-center rounded-lg mb-4" 
                    style={{ height: 100, backgroundColor: `${activeBot.color}20`, color: activeBot.color }}
                  >
                    <Bot size={54} />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: activeBot.color }}>{activeBot.id}</h2>
                      <p className="text-secondary">{activeBot.name}</p>
                    </div>
                    <span className={`badge ${activeBot.status.toLowerCase()}`}>
                      <span className={`status-dot ${activeBot.status.toLowerCase()} mr-1`}></span>
                      {activeBot.status}
                    </span>
                  </div>
                </div>

                <div className="details-list mb-6">
                  <div className="detail-row"><span className="flex items-center gap-2 text-secondary"><Bot size={15}/> Type</span><span className="font-semibold">Autonomous AMR</span></div>
                  <div className="detail-row"><span className="flex items-center gap-2 text-secondary"><Zap size={15}/> Speed</span><span className="font-semibold">{activeBot.speed} m/s</span></div>
                  <div className="detail-row"><span className="flex items-center gap-2 text-secondary"><Package size={15}/> Load</span><span className="font-semibold">{activeBot.load} / {activeBot.maxLoad}</span></div>
                  <div className="detail-row"><span className="flex items-center gap-2 text-secondary"><Battery size={15}/> Battery</span><span className="font-semibold">{Math.round(activeBot.battery)}%</span></div>
                  <div className="detail-row"><span className="flex items-center gap-2 text-secondary"><Navigation size={15}/> Position</span><span className="font-mono font-semibold">({activeBot.position[0]}, {activeBot.position[1]})</span></div>
                  <div className="detail-row"><span className="flex items-center gap-2 text-secondary"><Navigation size={15}/> Current Task</span><span className="font-semibold text-blue">{activeBot.currentTask || 'Idle'}</span></div>
                </div>

                <h4 className="font-semibold mb-3 text-sm">Swarm Actions</h4>
                <div className="quick-actions-grid">
                  <button 
                    className="action-btn-large bg-blue text-white"
                    onClick={() => {
                      const queued = orders.find(o => o.status === 'Queued');
                      if (queued) {
                        assignTask(activeBot.id, queued.id);
                      }
                    }}
                  >
                    <Navigation size={15}/> Assign Next Task
                  </button>
                  <button 
                    className="action-btn-large bg-gray-100"
                    onClick={() => recoverRobot(activeBot.id)}
                  >
                    <BatteryCharging size={15}/> Recover / Charge
                  </button>
                  <button 
                    className="action-btn-large bg-red-light text-red"
                    onClick={() => simulateFailure(activeBot.id)}
                  >
                    <AlertTriangle size={15}/> Simulate Fault
                  </button>
                  <button 
                    className="action-btn-large bg-purple-light text-purple"
                    onClick={() => removeRobot(activeBot.id)}
                  >
                    <Trash2 size={15}/> Decommission
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-secondary">
                Select a robot to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
