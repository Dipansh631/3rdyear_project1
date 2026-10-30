import React from 'react';
import { 
  Bot, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  ArrowUpRight,
  Settings as SettingsIcon,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useLogiMindStore } from '../store/useLogiMindStore';
import './Dashboard.css';

// Mock Data for Charts
const throughputData = Array.from({ length: 30 }, (_, i) => ({
  time: `04:${i < 10 ? '0'+i : i}`,
  orders: 10 + Math.random() * 15
}));

const completionTimeData = Array.from({ length: 30 }, (_, i) => ({
  time: `04:${i < 10 ? '0'+i : i}`,
  timeMs: 50 + Math.random() * 50
}));

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    robots, 
    orders, 
    obstacles, 
    shelves, 
    isRunning, 
    toggleSimulation 
  } = useLogiMindStore();

  const activeRobotsCount = robots.filter(r => r.status === 'Active').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Queued' || o.status === 'Picking').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;
  const failedOrdersCount = orders.filter(o => o.status === 'Failed').length;

  const activePct = robots.length ? Math.round((activeRobotsCount / robots.length) * 100) : 0;
  const waitingPct = robots.length ? Math.round((robots.filter(r => r.status === 'Waiting').length / robots.length) * 100) : 0;
  const chargingPct = robots.length ? Math.round((robots.filter(r => r.status === 'Charging').length / robots.length) * 100) : 0;
  const failedPct = robots.length ? Math.round((robots.filter(r => r.status === 'Failed').length / robots.length) * 100) : 0;

  const dynamicUtilization = [
    { name: 'Active', value: activePct || 80, color: '#10b981' },
    { name: 'Waiting', value: waitingPct || 10, color: '#f59e0b' },
    { name: 'Charging', value: chargingPct || 10, color: '#3b82f6' },
    { name: 'Failed', value: failedPct || 0, color: '#ef4444' }
  ];

  return (
    <div className="dashboard-container">
      {/* Top Stat Cards */}
      <div className="top-stats-grid">
        <div className="stat-card" onClick={() => navigate('/robots')} style={{ cursor: 'pointer' }} title="Click to view Robot Fleet">
          <div className="stat-card-inner">
            <div className="stat-icon bg-blue-light text-blue">
              <Bot size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Active Robots</div>
              <div className="stat-val-row">
                <span className="stat-val">{activeRobotsCount} / {robots.length}</span>
                <span className="stat-change text-green"><ArrowUpRight size={14}/> {activePct}%</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-blue" style={{ width: `${activePct}%` }}></div>
        </div>

        <div className="stat-card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }} title="Click to view Orders">
          <div className="stat-card-inner">
            <div className="stat-icon bg-orange-light text-orange">
              <ClipboardList size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Active Orders</div>
              <div className="stat-val-row">
                <span className="stat-val">{pendingOrdersCount}</span>
                <span className="stat-change text-green"><ArrowUpRight size={14}/> Live</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-orange" style={{ width: `${Math.min(100, pendingOrdersCount * 10)}%` }}></div>
        </div>

        <div className="stat-card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }} title="Click to view Completed Orders">
          <div className="stat-card-inner">
            <div className="stat-icon bg-green-light text-green">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Completed Orders</div>
              <div className="stat-val-row">
                <span className="stat-val">{completedOrdersCount}</span>
                <span className="stat-change text-green"><ArrowUpRight size={14}/> SLA 99%</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-green" style={{ width: '100%' }}></div>
        </div>

        <div className="stat-card" onClick={() => navigate('/robots')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-inner">
            <div className="stat-icon bg-purple-light text-purple">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Fleet Utilization</div>
              <div className="stat-val-row">
                <span className="stat-val">{activePct}%</span>
                <span className="stat-change text-green"><ArrowUpRight size={14}/> Swarm</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-purple" style={{ width: `${activePct}%` }}></div>
        </div>

        <div className="stat-card" onClick={() => navigate('/evaluation')} style={{ cursor: 'pointer' }} title="View Evaluation Metrics">
          <div className="stat-card-inner">
            <div className="stat-icon bg-red-light text-red">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Throughput</div>
              <div className="stat-val-row">
                <span className="stat-val">21.8 <span className="text-sm font-normal">orders/min</span></span>
                <span className="stat-change text-green"><ArrowUpRight size={14}/> MAPPO</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-red" style={{ width: '85%' }}></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-grid">
        {/* Warehouse Overview */}
        <div className="card warehouse-overview">
          <div className="card-header">
            <div>
              <h3 className="card-title">Live Warehouse Overview</h3>
              <p className="card-subtitle">Real-time AMR coordinate view</p>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn-primary text-xs"
                onClick={toggleSimulation}
              >
                {isRunning ? 'Pause Sim' : 'Resume Sim'}
              </button>
              <button 
                className="action-btn text-xs bg-gray-100"
                onClick={() => navigate('/simulation')}
              >
                Full Screen View →
              </button>
            </div>
          </div>
          <div className="warehouse-map-container">
            {/* Live Synchronized Warehouse Map */}
            <div className="mock-warehouse-map" style={{ position: 'relative' }}>
              {shelves?.slice(0, 16).map(([r, c], idx) => (
                <div 
                  key={`sh-${idx}`} 
                  className="mock-shelf" 
                  style={{ top: `${(r / 20) * 100}%`, left: `${(c / 20) * 100}%` }}
                />
              ))}

              <div className="mock-station pickup" style={{top: '10%', left: '10%'}}>S</div>
              <div className="mock-station packing" style={{top: '80%', left: '80%'}}>P</div>
              
              {obstacles?.map(([r, c], idx) => (
                <div 
                  key={`obs-${idx}`} 
                  className="mock-obstacle" 
                  style={{ top: `${(r / 20) * 100}%`, left: `${(c / 20) * 100}%` }}
                />
              ))}

              {robots.map((bot) => (
                <div 
                  key={bot.id} 
                  className={`mock-robot ${bot.status.toLowerCase()}`}
                  style={{ 
                    top: `${(bot.position[0] / 20) * 100}%`, 
                    left: `${(bot.position[1] / 20) * 100}%`,
                    transition: 'top 0.5s linear, left 0.5s linear'
                  }}
                  title={`${bot.id} (${bot.status})`}
                >
                  <span className="robot-badge" style={{ backgroundColor: bot.color, color: '#fff' }}>
                    {bot.id}
                  </span>
                </div>
              ))}
            </div>
            <div className="map-legend">
              <div className="legend-item"><div className="mock-robot active legend-icon"></div> Robot (Active)</div>
              <div className="legend-item"><div className="mock-robot waiting legend-icon"></div> Robot (Waiting)</div>
              <div className="legend-item"><div className="mock-robot failed legend-icon"></div> Robot (Failed)</div>
              <div className="legend-item"><div className="mock-shelf legend-icon"></div> Shelf</div>
              <div className="legend-item"><div className="mock-station pickup legend-icon">S</div> Pickup</div>
              <div className="legend-item"><div className="mock-station packing legend-icon">P</div> Packing</div>
              <div className="legend-item"><div className="mock-obstacle legend-icon"></div> Obstacle</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="right-sidebar">
          {/* Robot Status */}
          <div className="card">
            <div className="card-header" style={{marginBottom: '0.5rem'}}>
              <div>
                <h3 className="card-title">Robot Swarm Status</h3>
                <p className="card-subtitle">Active robot telemetry</p>
              </div>
              <button 
                className="view-all text-blue" 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/robots')}
              >
                View All →
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Robot</th>
                  <th>Status</th>
                  <th>Battery</th>
                  <th>Task</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {robots.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td><strong style={{ color: r.color }}>{r.id}</strong></td>
                    <td><span className={`status-dot ${r.status.toLowerCase()} mr-2`}></span>{r.status}</td>
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

          {/* Order Status */}
          <div className="card">
            <div className="card-header" style={{marginBottom: '0.5rem'}}>
              <div>
                <h3 className="card-title">Order Status</h3>
                <p className="card-subtitle">Current order statistics</p>
              </div>
              <button 
                className="view-all text-blue" 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/orders')}
              >
                View All →
              </button>
            </div>
            
            <div className="order-status-boxes">
              <div className="order-box bg-blue-light border-blue">
                <ClipboardList size={20} className="text-blue" />
                <div className="order-box-val">{pendingOrdersCount}</div>
                <div className="order-box-label">Pending</div>
              </div>
              <div className="order-box bg-orange-light border-orange">
                <SettingsIcon size={20} className="text-orange" />
                <div className="order-box-val">{orders.filter(o => o.status === 'Transport').length}</div>
                <div className="order-box-label">In Transit</div>
              </div>
              <div className="order-box bg-green-light border-green">
                <CheckCircle2 size={20} className="text-green" />
                <div className="order-box-val">{completedOrdersCount}</div>
                <div className="order-box-label">Completed</div>
              </div>
              <div className="order-box bg-red-light border-red">
                <AlertTriangle size={20} className="text-red" />
                <div className="order-box-val">{failedOrdersCount}</div>
                <div className="order-box-label">Failed</div>
              </div>
            </div>

            <h4 className="section-heading mt-4">Recent Orders</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Priority</th>
                  <th>Robot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold text-blue">{o.id}</td>
                    <td>{o.productName}</td>
                    <td><span className={`badge ${o.priority.toLowerCase()}`}>{o.priority}</span></td>
                    <td>{o.assignedRobot || '-'}</td>
                    <td><span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="bottom-charts-grid">
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title font-semibold">Throughput (Orders per Minute)</h3>
            <select className="chart-select"><option>Live Telemetry (30m)</option></select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData}>
                <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 30]}/>
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} fill="#eff6ff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="card-title font-semibold mb-4">Robot Utilization</h3>
          <div className="flex items-center h-full">
            <div className="pie-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicUtilization}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dynamicUtilization.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <span className="val">{activePct}%</span>
                <span className="lbl">Active</span>
              </div>
            </div>
            <div className="pie-legend">
              {dynamicUtilization.map(item => (
                <div className="pie-legend-item" key={item.name}>
                  <div className="flex items-center gap-2">
                    <span className="status-dot" style={{backgroundColor: item.color}}></span>
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title font-semibold">Task Turnaround Time</h3>
            <select className="chart-select"><option>Live Telemetry (30m)</option></select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTimeData}>
                <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={[0, 150]}/>
                <Tooltip />
                <Line type="monotone" dataKey="timeMs" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
