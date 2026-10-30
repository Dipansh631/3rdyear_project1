import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  MapPin, 
  Play, 
  Layers, 
  ChevronRight
} from 'lucide-react';
import { useLogiMindStore } from '../store/useLogiMindStore';
import type { Order } from '../store/useLogiMindStore';
import './Orders.css';

export const Orders: React.FC = () => {
  const { orders, robots, generateOrder, updateOrderStatus, assignTask } = useLogiMindStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  const pendingCount = orders.filter(o => o.status === 'Queued').length;
  const activeCount = orders.filter(o => o.status === 'Picking' || o.status === 'Transport').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const failedCount = orders.filter(o => o.status === 'Failed').length;

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || o.priority.toUpperCase() === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="orders-page">
      {/* Top Stat Cards */}
      <div className="orders-stats-row">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-blue-light text-blue">
              <Package size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Pending / Queued</div>
              <div className="stat-val-row">
                <span className="stat-val">{pendingCount}</span>
                <span className="stat-change text-secondary text-sm">Demand buffer</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-blue" style={{ width: `${Math.min(100, pendingCount * 15)}%` }}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-orange-light text-orange">
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">In Processing</div>
              <div className="stat-val-row">
                <span className="stat-val">{activeCount}</span>
                <span className="stat-change text-orange text-sm font-semibold">Live in transit</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-orange" style={{ width: `${Math.min(100, activeCount * 25)}%` }}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-green-light text-green">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Completed Orders</div>
              <div className="stat-val-row">
                <span className="stat-val">{completedCount}</span>
                <span className="stat-change text-green text-sm flex items-center"><ArrowUpRight size={14}/> 98.2% SLA</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-green" style={{ width: '100%' }}></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="stat-icon bg-red-light text-red">
              <AlertCircle size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">Exceptions / Failed</div>
              <div className="stat-val-row">
                <span className="stat-val">{failedCount}</span>
                <span className="stat-change text-secondary text-sm font-semibold">Auto-recovering</span>
              </div>
            </div>
          </div>
          <div className="stat-progress bg-red" style={{ width: `${failedCount * 20}%` }}></div>
        </div>
      </div>

      <div className="orders-content-grid">
        {/* Left Column: Order Table */}
        <div className="orders-main-col">
          <div className="card">
            <div className="card-header px-4 pt-4 pb-2 border-b flex-wrap gap-3">
              <div>
                <h3 className="card-title">Order Dispatch & Queue</h3>
                <p className="card-subtitle">Real-time demand fulfillment and MARL multi-agent allocation</p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="search-box">
                  <Search size={16} className="text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search SKU or order ID..." 
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
                  <option value="QUEUED">Queued</option>
                  <option value="PICKING">Picking</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <select 
                  className="filter-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Low</option>
                </select>
                <button className="btn-primary" onClick={() => generateOrder()}>
                  <Plus size={16}/> Inject Order
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product / SKU</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned AMR</th>
                    <th>Pick Location</th>
                    <th>Destination</th>
                    <th>Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.id} 
                      className={selectedOrder?.id === order.id ? 'row-selected' : ''}
                      onClick={() => setSelectedOrder(order)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="font-semibold text-blue">{order.id}</td>
                      <td>
                        <div className="font-semibold">{order.productName}</div>
                        <div className="text-xs text-secondary">{order.sku} · {order.itemsCount} units</div>
                      </td>
                      <td>
                        <span className={`badge ${order.priority.toLowerCase()}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.assignedRobot ? (
                          <span className="font-semibold text-blue flex items-center gap-1">
                            <Bot size={14} /> {order.assignedRobot}
                          </span>
                        ) : (
                          <span className="text-secondary italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="text-sm">{order.sourceShelf}</td>
                      <td className="text-sm">{order.destination}</td>
                      <td className="text-sm text-secondary font-mono">{order.deadline}</td>
                      <td>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {order.status === 'Queued' && (
                            <button 
                              className="action-icon-btn text-blue" 
                              title="Start Picking"
                              onClick={() => {
                                const idleBot = robots.find(r => r.status === 'Waiting') || robots[0];
                                assignTask(idleBot.id, order.id);
                              }}
                            >
                              <Play size={14} />
                            </button>
                          )}
                          {order.status === 'Transport' && (
                            <button 
                              className="action-icon-btn text-green" 
                              title="Mark Completed"
                              onClick={() => updateOrderStatus(order.id, 'Completed')}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Under Table: Task Queue Workflow */}
          <div className="card p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="card-title">Automated MARL Dispatch Pipeline</h3>
                <p className="card-subtitle">Active order processing stages across warehouse zones</p>
              </div>
              <button className="text-blue text-sm hover:underline flex items-center gap-1" onClick={generateOrder}>
                <Plus size={14} /> Batch Add (5 Orders)
              </button>
            </div>

            <div className="pipeline-steps">
              <div className="step-card">
                <div className="step-header">
                  <span className="step-title font-semibold">1. Order Ingestion</span>
                  <span className="badge normal">{pendingCount} Waiting</span>
                </div>
                <p className="text-xs text-secondary mt-1">High-throughput ERP demand listener</p>
                <div className="step-items mt-3">
                  {orders.filter(o => o.status === 'Queued').slice(0, 3).map(o => (
                    <div key={o.id} className="pipeline-item">
                      <span className="font-semibold text-xs">{o.id}</span>
                      <span className="text-xs text-secondary">{o.sku}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="step-arrow"><ChevronRight size={20} className="text-secondary" /></div>

              <div className="step-card">
                <div className="step-header">
                  <span className="step-title font-semibold">2. MARL Allocation</span>
                  <span className="badge picking">{robots.filter(r => r.status === 'Active').length} Active</span>
                </div>
                <p className="text-xs text-secondary mt-1">Decentralized actor policy assignment</p>
                <div className="step-items mt-3">
                  {robots.filter(r => r.status === 'Active').map(r => (
                    <div key={r.id} className="pipeline-item flex justify-between">
                      <span className="font-semibold text-xs text-blue">{r.id}</span>
                      <span className="text-xs">{r.currentTask}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="step-arrow"><ChevronRight size={20} className="text-secondary" /></div>

              <div className="step-card">
                <div className="step-header">
                  <span className="step-title font-semibold">3. Packing & Dispatch</span>
                  <span className="badge completed">{completedCount} Ready</span>
                </div>
                <p className="text-xs text-secondary mt-1">Sorting, consolidation, dock transfer</p>
                <div className="step-items mt-3">
                  <div className="pipeline-item success-item">
                    <span className="font-semibold text-xs">Dock Bay 1</span>
                    <span className="text-xs text-green font-semibold">Operational (99%)</span>
                  </div>
                  <div className="pipeline-item success-item">
                    <span className="font-semibold text-xs">Dock Bay 2</span>
                    <span className="text-xs text-green font-semibold">Operational (96%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Details & Assignment */}
        <div className="orders-right-col">
          <div className="card h-full flex flex-col">
            <div className="card-header p-4 border-b">
              <h3 className="card-title">Order Details</h3>
              <span className={`badge ${selectedOrder?.status.toLowerCase() || 'normal'}`}>
                {selectedOrder?.status || 'Select an order'}
              </span>
            </div>

            {selectedOrder ? (
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="order-profile mb-4">
                    <div className="order-icon-large bg-blue-light text-blue mb-3">
                      <Package size={36} />
                    </div>
                    <h3 className="text-xl font-bold">{selectedOrder.id}</h3>
                    <p className="text-secondary text-sm">{selectedOrder.productName}</p>
                  </div>

                  <div className="details-list mb-6">
                    <div className="detail-row">
                      <span className="text-secondary">SKU Code</span>
                      <span className="font-semibold">{selectedOrder.sku}</span>
                    </div>
                    <div className="detail-row">
                      <span className="text-secondary">Quantity</span>
                      <span className="font-semibold">{selectedOrder.itemsCount} units</span>
                    </div>
                    <div className="detail-row">
                      <span className="text-secondary">Priority</span>
                      <span className={`badge ${selectedOrder.priority.toLowerCase()}`}>
                        {selectedOrder.priority}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="text-secondary">Source Shelf</span>
                      <span className="font-semibold flex items-center gap-1">
                        <MapPin size={14} className="text-orange" /> {selectedOrder.sourceShelf}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="text-secondary">Destination</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Layers size={14} className="text-purple" /> {selectedOrder.destination}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="text-secondary">Created At</span>
                      <span className="font-mono text-sm">{selectedOrder.createdAt}</span>
                    </div>
                    <div className="detail-row">
                      <span className="text-secondary">SLA Deadline</span>
                      <span className="font-mono text-sm text-red font-semibold">{selectedOrder.deadline}</span>
                    </div>
                  </div>

                  {/* Robot Assignment Panel */}
                  <div className="assign-box p-3 rounded-lg bg-gray-50 border border-border mb-4">
                    <h4 className="text-xs font-semibold uppercase text-secondary mb-2">AMR Fleet Assignment</h4>
                    <div className="flex gap-2">
                      <select 
                        className="filter-select flex-1"
                        value={selectedOrder.assignedRobot || ''}
                        onChange={(e) => assignTask(e.target.value, selectedOrder.id)}
                      >
                        <option value="">Choose Robot...</option>
                        {robots.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.id} - {r.status} ({r.battery}%)
                          </option>
                        ))}
                      </select>
                      <button 
                        className="btn-primary text-xs px-3"
                        onClick={() => {
                          const idleBot = robots.find(r => r.status === 'Waiting') || robots[0];
                          assignTask(idleBot.id, selectedOrder.id);
                        }}
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="quick-actions-grid mt-4">
                  <button 
                    className="action-btn-large bg-blue text-white"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Transport')}
                  >
                    <Play size={16} /> Fast-Track
                  </button>
                  <button 
                    className="action-btn-large bg-green-light text-green"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Completed')}
                  >
                    <CheckCircle2 size={16} /> Complete
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-secondary">
                <Package size={48} className="mx-auto mb-2 opacity-40" />
                <p>Select any order from the table to view details and dispatch actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
