import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Upload, 
  Download, 
  Sparkles, 
  Sliders
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { useLogiMindStore } from '../store/useLogiMindStore';
import './Training.css';

export const Training: React.FC = () => {
  const { 
    checkpoints, 
    trainingMetrics, 
    isTraining, 
    currentEpisode, 
    startTraining, 
    pauseTraining, 
    stopTraining, 
    loadCheckpoint,
    addEvent,
    updateSettings 
  } = useLogiMindStore();

  const [selectedAlgo, setSelectedAlgo] = useState<'MAPPO' | 'PPO' | 'Q-MIX'>('MAPPO');
  const [learningRate, setLearningRate] = useState('0.0003');
  const [batchSize, setBatchSize] = useState('64');
  const [gamma, setGamma] = useState('0.99');
  const [entropyCoef, setEntropyCoef] = useState('0.01');
  const [totalEpisodes, setTotalEpisodes] = useState('15000');
  const [activeMetricTab, setActiveMetricTab] = useState<'reward' | 'loss' | 'success'>('reward');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSaveCheckpoint = () => {
    addEvent({
      type: 'success',
      title: 'Checkpoint Saved',
      details: `Model weights for ${selectedAlgo} saved at episode ${currentEpisode}.`
    });
    showNotice(`Model Checkpoint for ${selectedAlgo} successfully saved!`);
  };

  const handleApplyParams = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      learningRate: parseFloat(learningRate) || 0.0003,
      discountFactor: parseFloat(gamma) || 0.99,
      batchSize: parseInt(batchSize) || 64,
      algorithm: selectedAlgo as any
    });
    addEvent({
      type: 'info',
      title: 'Hyperparameters Applied',
      details: `${selectedAlgo} learning rate: ${learningRate}, batch: ${batchSize}, gamma: ${gamma}`
    });
    showNotice('Hyperparameters applied to RL training environment.');
  };

  const handleImportModel = () => {
    showNotice('Neural weights (.pt / .onnx) file loaded and validated.');
    addEvent({
      type: 'info',
      title: 'External Model Imported',
      details: 'Custom neural policy imported into checkpoint registry.'
    });
  };

  const handleExportModel = (modelName: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ model: modelName, weights: "simulated_tensor_weights_binary" }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${modelName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotice(`Weights for ${modelName} exported.`);
  };

  return (
    <div className="training-page">
      {/* Top Banner: Training Status & Actions */}
      <div className="card p-6 training-banner">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`status-dot ${isTraining ? 'active' : 'waiting'}`}></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                {isTraining ? 'Training Active (Accelerated Simulation)' : 'Training Paused'}
              </span>
            </div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="text-purple" size={26} /> Multi-Agent Reinforcement Learning Studio
            </h2>
            <p className="card-subtitle">
              Train cooperative decentralized AMR policies using Centralized Training with Decentralized Execution (CTDE).
            </p>
          </div>

          <div className="training-cta-controls flex gap-2">
            {!isTraining ? (
              <button className="btn-primary bg-green text-white" onClick={startTraining}>
                <Play size={16} /> Resume Training
              </button>
            ) : (
              <button className="btn-primary bg-orange text-white" onClick={pauseTraining}>
                <Pause size={16} /> Pause Training
              </button>
            )}
            <button className="action-btn-large bg-gray-100" onClick={stopTraining}>
              <RotateCcw size={16} /> Reset Buffer
            </button>
            <button className="btn-primary bg-purple text-white" onClick={handleSaveCheckpoint}>
              <Save size={16} /> Save Checkpoint
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className="toast-notice mt-4 p-3 bg-green-light text-green rounded-lg flex items-center gap-2 border border-green-200">
            <CheckCircle2 size={16} /> {statusNotice}
          </div>
        )}

        {/* Training Progress Bar */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-secondary">
              Episode Progress: <span className="text-primary font-mono">{currentEpisode}</span> / {totalEpisodes}
            </span>
            <span className="font-semibold text-primary">
              {Math.round((currentEpisode / parseInt(totalEpisodes)) * 100)}% Complete
            </span>
          </div>
          <div className="training-progress-track">
            <div 
              className="training-progress-fill" 
              style={{ width: `${Math.min(100, (currentEpisode / parseInt(totalEpisodes)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="training-grid">
        {/* Left Col: Hyperparameter Config */}
        <div className="training-config-col">
          <div className="card p-5">
            <h3 className="card-title font-semibold mb-4 flex items-center gap-2">
              <Sliders size={18} className="text-blue" /> MARL Architecture & Parameters
            </h3>

            <form onSubmit={handleApplyParams} className="config-form flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Algorithm Paradigm</label>
                <div className="algo-selector-grid">
                  <button 
                    type="button" 
                    className={`algo-btn ${selectedAlgo === 'MAPPO' ? 'selected' : ''}`}
                    onClick={() => setSelectedAlgo('MAPPO')}
                  >
                    <div className="font-semibold text-sm">MAPPO</div>
                    <div className="text-xs text-secondary">PPO Multi-Agent</div>
                  </button>
                  <button 
                    type="button" 
                    className={`algo-btn ${selectedAlgo === 'PPO' ? 'selected' : ''}`}
                    onClick={() => setSelectedAlgo('PPO')}
                  >
                    <div className="font-semibold text-sm">PPO</div>
                    <div className="text-xs text-secondary">Independent</div>
                  </button>
                  <button 
                    type="button" 
                    className={`algo-btn ${selectedAlgo === 'Q-MIX' ? 'selected' : ''}`}
                    onClick={() => setSelectedAlgo('Q-MIX')}
                  >
                    <div className="font-semibold text-sm">QMIX</div>
                    <div className="text-xs text-secondary">Value Monotonic</div>
                  </button>
                </div>
              </div>

              <div className="grid-2-col">
                <div>
                  <label className="text-xs font-semibold text-secondary block mb-1">Learning Rate (α)</label>
                  <input 
                    type="text" 
                    className="search-input w-full" 
                    value={learningRate} 
                    onChange={(e) => setLearningRate(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary block mb-1">Discount (γ)</label>
                  <input 
                    type="text" 
                    className="search-input w-full" 
                    value={gamma} 
                    onChange={(e) => setGamma(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid-2-col">
                <div>
                  <label className="text-xs font-semibold text-secondary block mb-1">Batch Size</label>
                  <select 
                    className="filter-select w-full"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                  >
                    <option value="32">32 steps</option>
                    <option value="64">64 steps</option>
                    <option value="128">128 steps</option>
                    <option value="256">256 steps</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary block mb-1">Entropy Coef</label>
                  <input 
                    type="text" 
                    className="search-input w-full" 
                    value={entropyCoef} 
                    onChange={(e) => setEntropyCoef(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary block mb-1">Max Episodes Limit</label>
                <input 
                  type="text" 
                  className="search-input w-full" 
                  value={totalEpisodes} 
                  onChange={(e) => setTotalEpisodes(e.target.value)} 
                />
              </div>

              <div className="p-3 bg-purple-light rounded-lg text-xs text-purple border border-purple-200 mt-2">
                <strong>CTDE Policy:</strong> Centralized Critic observes full global warehouse map [20×20] during gradient descent; Decentralized Actors execute with local 5×5 lidar view.
              </div>

              <button type="submit" className="btn-primary w-full justify-center mt-2">
                Apply Hyperparameters
              </button>
            </form>
          </div>
        </div>

        {/* Center/Right Col: Live Curves & Checkpoints */}
        <div className="training-charts-col">
          {/* Real-time Loss / Reward Curves */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div>
                <h3 className="card-title font-semibold">Live Convergence Analytics</h3>
                <p className="card-subtitle">Episodic reward, critic loss, and collision reduction curves</p>
              </div>

              <div className="flex gap-2">
                <button 
                  className={`filter-chip ${activeMetricTab === 'reward' ? 'active' : ''}`}
                  onClick={() => setActiveMetricTab('reward')}
                >
                  Mean Reward
                </button>
                <button 
                  className={`filter-chip ${activeMetricTab === 'loss' ? 'active' : ''}`}
                  onClick={() => setActiveMetricTab('loss')}
                >
                  Actor/Critic Loss
                </button>
                <button 
                  className={`filter-chip ${activeMetricTab === 'success' ? 'active' : ''}`}
                  onClick={() => setActiveMetricTab('success')}
                >
                  Success & Safety
                </button>
              </div>
            </div>

            <div className="training-curve-container" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                {activeMetricTab === 'reward' ? (
                  <LineChart data={trainingMetrics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="episode" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reward" name="Average Episode Reward" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                ) : activeMetricTab === 'loss' ? (
                  <LineChart data={trainingMetrics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="episode" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="loss" name="Policy Value Loss" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : (
                  <LineChart data={trainingMetrics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="episode" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="successRate" name="Delivery Success %" stroke="#10b981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="collisionRate" name="Collision Frequency %" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Checkpoint Management Table */}
          <div className="card mt-4">
            <div className="card-header px-4 pt-4 pb-2 border-b flex justify-between items-center">
              <div>
                <h3 className="card-title font-semibold">Trained Weights & Checkpoint Registry</h3>
                <p className="card-subtitle">Deploy or benchmark pre-trained neural networks directly into simulation</p>
              </div>
              <button className="btn-primary text-xs" onClick={handleImportModel}>
                <Upload size={14} /> Import Model (.pt / .onnx)
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Model Tag</th>
                  <th>Architecture</th>
                  <th>Trained Episodes</th>
                  <th>Avg Reward</th>
                  <th>Date Saved</th>
                  <th>File Size</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {checkpoints.map((chk) => (
                  <tr key={chk.id}>
                    <td className="font-semibold text-blue flex items-center gap-2">
                      <Sparkles size={14} className={chk.active ? 'text-green' : 'text-secondary'} />
                      {chk.name}
                    </td>
                    <td><span className="badge picking">{chk.algorithm}</span></td>
                    <td className="font-mono">{chk.episodes.toLocaleString()}</td>
                    <td className="font-semibold text-green">+{chk.reward}</td>
                    <td className="text-secondary text-xs">{chk.date}</td>
                    <td className="text-secondary text-xs">{chk.size}</td>
                    <td>
                      {chk.active ? (
                        <span className="badge active">
                          <CheckCircle2 size={12} className="mr-1" /> Active Policy
                        </span>
                      ) : (
                        <span className="badge waiting">Standby</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {!chk.active ? (
                          <button 
                            className="btn-primary text-xs py-1 px-2"
                            onClick={() => loadCheckpoint(chk.id)}
                          >
                            Deploy
                          </button>
                        ) : (
                          <button 
                            className="action-icon-btn text-blue" 
                            title="Export Weights"
                            onClick={() => handleExportModel(chk.name)}
                          >
                            <Download size={14} />
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
      </div>
    </div>
  );
};
