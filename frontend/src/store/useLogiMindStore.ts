import { create } from 'zustand';

export interface Robot {
  id: string;
  name: string;
  status: 'Active' | 'Waiting' | 'Charging' | 'Failed' | 'Maintenance';
  battery: number;
  currentTask: string;
  taskType: 'Picking' | 'Transport' | 'Charging' | 'Idle';
  position: [number, number];
  targetPosition?: [number, number];
  path?: [number, number][];
  speed: number;
  load: number;
  maxLoad: number;
  color: string;
}

export interface Order {
  id: string;
  sku: string;
  productName: string;
  priority: 'High' | 'Normal' | 'Low';
  status: 'Queued' | 'Picking' | 'Transport' | 'Completed' | 'Failed';
  assignedRobot?: string;
  sourceShelf: string;
  destination: string;
  itemsCount: number;
  createdAt: string;
  deadline: string;
}

export interface WarehouseEvent {
  id: string;
  time: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  details: string;
  entityId?: string;
}

export interface TrainingMetric {
  episode: number;
  reward: number;
  loss: number;
  successRate: number;
  collisionRate: number;
}

export interface ModelCheckpoint {
  id: string;
  name: string;
  algorithm: 'MAPPO' | 'PPO' | 'Q-MIX';
  episodes: number;
  reward: number;
  date: string;
  size: string;
  active: boolean;
}

export interface SimulationSettings {
  gridWidth: number;
  gridHeight: number;
  shelfCount: number;
  stationCount: number;
  robotCount: number;
  algorithm: 'MAPPO' | 'PPO' | 'A*' | 'Rule-Based' | 'Q-MIX';
  speed: number;
  showPaths: boolean;
  showZones: boolean;
  showHeatmap: boolean;
  dynamicObstacles: boolean;
  robotFailures: boolean;
  congestionControl: boolean;
  learningRate: number;
  discountFactor: number;
  batchSize: number;
}

interface LogiMindStore {
  // Sim state
  isRunning: boolean;
  simTime: string;
  activeScenario: string;
  obstacles: [number, number][];
  shelves: [number, number][];
  stations: Record<string, [number, number]>;
  isConnected: boolean;
  
  // Data
  robots: Robot[];
  orders: Order[];
  events: WarehouseEvent[];
  checkpoints: ModelCheckpoint[];
  trainingMetrics: TrainingMetric[];
  isTraining: boolean;
  trainingProgress: number;
  currentEpisode: number;
  settings: SimulationSettings;

  // Actions
  initWebSocket: () => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: number) => void;
  addRobot: () => void;
  removeRobot: (id: string) => void;
  simulateFailure: (robotId?: string) => void;
  recoverRobot: (robotId: string) => void;
  addObstacle: (pos?: [number, number]) => void;
  generateOrder: () => void;
  createCongestion: () => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignTask: (robotId: string, orderId: string) => void;
  addEvent: (event: Omit<WarehouseEvent, 'id' | 'time'>) => void;
  startTraining: () => void;
  pauseTraining: () => void;
  stopTraining: () => void;
  loadCheckpoint: (id: string) => void;
  updateSettings: (newSettings: Partial<SimulationSettings>) => void;
  setAlgorithm: (algorithm: string) => void;
  setScenario: (scenario: string) => void;
}

const API_BASE = 'http://localhost:8000';
let socket: WebSocket | null = null;

export const useLogiMindStore = create<LogiMindStore>((set, get) => ({
  isRunning: true,
  simTime: '04:32',
  activeScenario: 'Peak Demand',
  obstacles: [[11, 7], [15, 13]],
  shelves: [],
  stations: {},
  isConnected: false,

  robots: [
    { id: 'R1', name: 'AMR-01', status: 'Active', battery: 87, currentTask: 'ORD-102', taskType: 'Transport', position: [12, 8], speed: 1.2, load: 2, maxLoad: 5, color: '#3b82f6' },
    { id: 'R2', name: 'AMR-02', status: 'Active', battery: 92, currentTask: 'ORD-103', taskType: 'Picking', position: [8, 5], speed: 1.0, load: 3, maxLoad: 5, color: '#f59e0b' },
    { id: 'R3', name: 'AMR-03', status: 'Waiting', battery: 76, currentTask: 'None', taskType: 'Idle', position: [4, 9], speed: 0.0, load: 0, maxLoad: 5, color: '#10b981' },
    { id: 'R4', name: 'AMR-04', status: 'Active', battery: 85, currentTask: 'ORD-105', taskType: 'Transport', position: [14, 3], speed: 1.1, load: 1, maxLoad: 5, color: '#ef4444' },
    { id: 'R5', name: 'AMR-05', status: 'Charging', battery: 42, currentTask: 'None', taskType: 'Charging', position: [10, 11], speed: 0.0, load: 0, maxLoad: 5, color: '#8b5cf6' },
  ],

  orders: [
    { id: 'ORD-101', sku: 'SKU-32', productName: 'Microcontroller Units', priority: 'High', status: 'Picking', assignedRobot: 'R3', sourceShelf: 'Shelf A-12', destination: 'Packing Bay 1', itemsCount: 4, createdAt: '04:12', deadline: '04:45' },
    { id: 'ORD-102', sku: 'SKU-18', productName: 'Optical Sensor Array', priority: 'Normal', status: 'Transport', assignedRobot: 'R1', sourceShelf: 'Shelf B-08', destination: 'Packing Bay 2', itemsCount: 2, createdAt: '04:18', deadline: '05:00' },
    { id: 'ORD-103', sku: 'SKU-91', productName: 'Lithium Cell Packs', priority: 'High', status: 'Transport', assignedRobot: 'R2', sourceShelf: 'Shelf C-03', destination: 'Packing Bay 1', itemsCount: 6, createdAt: '04:22', deadline: '04:40' },
    { id: 'ORD-104', sku: 'SKU-47', productName: 'Servo Motor Assemblies', priority: 'Normal', status: 'Queued', sourceShelf: 'Shelf A-05', destination: 'Packing Bay 3', itemsCount: 3, createdAt: '04:28', deadline: '05:15' },
    { id: 'ORD-105', sku: 'SKU-25', productName: 'High-Torque Actuators', priority: 'High', status: 'Transport', assignedRobot: 'R4', sourceShelf: 'Shelf D-14', destination: 'Packing Bay 2', itemsCount: 1, createdAt: '04:30', deadline: '04:55' },
    { id: 'ORD-106', sku: 'SKU-63', productName: 'Precision CNC Bits', priority: 'Low', status: 'Queued', sourceShelf: 'Shelf B-19', destination: 'Packing Bay 1', itemsCount: 8, createdAt: '04:31', deadline: '05:30' },
    { id: 'ORD-107', sku: 'SKU-84', productName: 'Thermal Insulator Pads', priority: 'Normal', status: 'Completed', assignedRobot: 'R1', sourceShelf: 'Shelf C-11', destination: 'Packing Bay 2', itemsCount: 5, createdAt: '04:02', deadline: '04:30' },
    { id: 'ORD-108', sku: 'SKU-12', productName: 'Pneumatic Valves', priority: 'Low', status: 'Completed', assignedRobot: 'R2', sourceShelf: 'Shelf D-02', destination: 'Packing Bay 1', itemsCount: 2, createdAt: '03:55', deadline: '04:25' }
  ],

  events: [
    { id: 'EV-1', time: '04:32', type: 'info', title: 'Robot R1 Moved', details: 'R1 reached corridor segment [12, 8]', entityId: 'R1' },
    { id: 'EV-2', time: '04:31', type: 'success', title: 'Task Updated', details: 'ORD-103 transitioned to in-transit by R2', entityId: 'ORD-103' },
    { id: 'EV-3', time: '04:30', type: 'warning', title: 'Dynamic Obstacle Added', details: 'Unplanned spill detected near Aisle 3 (grid 12, 8)' },
    { id: 'EV-4', time: '04:28', type: 'warning', title: 'Robot R5 Low Battery', details: 'Charge dropped below 45% (42%). Re-routed to dock.', entityId: 'R5' },
    { id: 'EV-5', time: '04:27', type: 'info', title: 'High Priority Order Ingested', details: 'ORD-105 registered with high priority SLA', entityId: 'ORD-105' },
    { id: 'EV-6', time: '04:24', type: 'error', title: 'Congestion Alert', details: 'Aisle 2 bottlenecks exceeded 4.2s delay threshold' },
    { id: 'EV-7', time: '04:20', type: 'info', title: 'MARL Policy Re-weight', details: 'Shared critic updated decentralized actors with 98.4% convergence' },
  ],

  checkpoints: [
    { id: 'chk-1', name: 'MAPPO-v3-WarehousePro', algorithm: 'MAPPO', episodes: 12500, reward: 284.6, date: '2026-10-28', size: '48.2 MB', active: true },
    { id: 'chk-2', name: 'MAPPO-v2-Baseline', algorithm: 'MAPPO', episodes: 8000, reward: 221.4, date: '2026-10-25', size: '48.0 MB', active: false },
    { id: 'chk-3', name: 'PPO-SingleAgent-Ref', algorithm: 'PPO', episodes: 10000, reward: 168.9, date: '2026-10-22', size: '24.5 MB', active: false },
    { id: 'chk-4', name: 'QMIX-Cooperative-Exp', algorithm: 'Q-MIX', episodes: 6500, reward: 195.1, date: '2026-10-18', size: '36.8 MB', active: false },
  ],

  trainingMetrics: Array.from({ length: 25 }, (_, i) => {
    const ep = (i + 1) * 500;
    return {
      episode: ep,
      reward: Math.min(300, Math.round(50 + 10 * Math.sqrt(ep) - Math.random() * 15)),
      loss: Math.max(0.01, +(0.85 * Math.exp(-ep / 3000) + Math.random() * 0.04).toFixed(3)),
      successRate: Math.min(99.2, +(40 + 55 * (1 - Math.exp(-ep / 3500)) + (Math.random() * 2 - 1)).toFixed(1)),
      collisionRate: Math.max(0.1, +(12 * Math.exp(-ep / 2500) + Math.random() * 0.3).toFixed(2))
    };
  }),

  isTraining: false,
  trainingProgress: 68,
  currentEpisode: 8500,

  settings: {
    gridWidth: 20,
    gridHeight: 20,
    shelfCount: 32,
    stationCount: 3,
    robotCount: 5,
    algorithm: 'MAPPO',
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
  },

  initWebSocket: () => {
    if (socket) return;
    try {
      socket = new WebSocket('ws://localhost:8000/ws/simulation');
      
      socket.onopen = () => {
        set({ isConnected: true });
        console.log('[LogiMind] Connected to backend WebSocket');
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'simulation_state' && msg.data) {
            const d = msg.data;
            set({
              isRunning: d.isRunning,
              simTime: d.simTime,
              activeScenario: d.activeScenario,
              robots: d.robots,
              orders: d.orders,
              events: d.events,
              obstacles: d.obstacles,
              shelves: d.shelves,
              stations: d.stations,
              settings: {
                ...get().settings,
                algorithm: d.algorithm,
                speed: d.speed,
                gridWidth: d.width,
                gridHeight: d.height,
              }
            });
          }
        } catch (e) {
          console.error('[LogiMind] Failed to parse WebSocket message:', e);
        }
      };

      socket.onclose = () => {
        set({ isConnected: false });
        socket = null;
        // Auto-reconnect after 2 seconds
        setTimeout(() => get().initWebSocket(), 2000);
      };

      socket.onerror = () => {
        set({ isConnected: false });
      };
    } catch (e) {
      console.warn('[LogiMind] WebSocket connection error:', e);
    }
  },

  toggleSimulation: () => {
    const next = !get().isRunning;
    fetch(`${API_BASE}/api/simulation/${next ? 'start' : 'pause'}`, { method: 'POST' }).catch(() => {});
    set({ isRunning: next });
  },

  resetSimulation: () => {
    fetch(`${API_BASE}/api/simulation/reset`, { method: 'POST' }).catch(() => {});
    set({ simTime: '00:00' });
  },

  setSpeed: (speed) => {
    fetch(`${API_BASE}/api/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    }).catch(() => {});
    set((state) => ({ settings: { ...state.settings, speed } }));
  },

  addRobot: () => {
    fetch(`${API_BASE}/api/robots`, { method: 'POST' }).catch(() => {});
  },

  removeRobot: (id) => {
    fetch(`${API_BASE}/api/robots/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  simulateFailure: (robotId) => {
    let target = robotId;
    if (!target) {
      const activeBot = get().robots.find(r => r.status !== 'Failed');
      target = activeBot ? activeBot.id : get().robots[0]?.id;
    }
    if (target) {
      fetch(`${API_BASE}/api/robots/${target}/failure`, { method: 'POST' }).catch(() => {});
    }
  },

  recoverRobot: (robotId) => {
    fetch(`${API_BASE}/api/robots/${robotId}/recover`, { method: 'POST' }).catch(() => {});
  },

  addObstacle: (pos) => {
    const payload = pos ? { x: pos[0], y: pos[1] } : {};
    fetch(`${API_BASE}/api/events/obstacle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  },

  generateOrder: () => {
    fetch(`${API_BASE}/api/orders`, { method: 'POST' }).catch(() => {});
  },

  createCongestion: () => {
    fetch(`${API_BASE}/api/events/congestion`, { method: 'POST' }).catch(() => {});
  },

  updateOrderStatus: (orderId, status) => {
    if (status === 'Completed') {
      fetch(`${API_BASE}/api/orders/${orderId}/complete`, { method: 'POST' }).catch(() => {});
    }
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o))
    }));
  },

  assignTask: (robotId, orderId) => {
    fetch(`${API_BASE}/api/orders/${orderId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ robot_id: robotId })
    }).catch(() => {});
  },

  addEvent: (event) => {
    fetch(`${API_BASE}/api/events/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {});
  },

  startTraining: () => set({ isTraining: true }),
  pauseTraining: () => set({ isTraining: false }),
  stopTraining: () => set({ isTraining: false, trainingProgress: 0 }),

  loadCheckpoint: (id) => {
    fetch(`${API_BASE}/api/models/${id}/load`, { method: 'POST' }).catch(() => {});
    set((state) => ({
      checkpoints: state.checkpoints.map((c) => ({ ...c, active: c.id === id }))
    }));
  },

  updateSettings: (newSettings) => {
    const merged = { ...get().settings, ...newSettings };
    fetch(`${API_BASE}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged)
    }).catch(() => {});
    set({ settings: merged });
  },

  setAlgorithm: (algorithm: string) => {
    fetch(`${API_BASE}/api/simulation/algorithm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm })
    }).catch(() => {});
    set((state) => ({ settings: { ...state.settings, algorithm: algorithm as SimulationSettings['algorithm'] } }));
  },

  setScenario: (scenario: string) => {
    fetch(`${API_BASE}/api/simulation/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    }).catch(() => {});
    set({ activeScenario: scenario });
  }
}));
