/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Matrix from './components/Matrix';
import { generateNetworkSVG } from './lib/exportUtils';
import NetworkMap, { NetworkMapRef } from './components/NetworkMap';
import SNAStats from './components/SNAStats';
import { NetworkState, Actor, Dependency, SNAMetrics, Category, DependencyType } from './types';
import { 
  DEMO_ACTORS, 
  DEMO_DEPENDENCIES, 
  INITIAL_CATEGORIES, 
  INITIAL_DEP_TYPES 
} from './constants';
import { calculateSNAMetrics } from './lib/sna';
import { cn } from './lib/utils';
import { X, Sliders, Info, Zap, LayoutGrid, Network as NetIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'nexus-map-state-v1';

export default function App() {
  const [state, setState] = useState<NetworkState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      actors: DEMO_ACTORS,
      categories: INITIAL_CATEGORIES,
      dependencies: DEMO_DEPENDENCIES,
      dependencyTypes: INITIAL_DEP_TYPES,
    };
  });

  const mapRef = useRef<NetworkMapRef>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'stats' | 'matrix'>('map');
  const [sizingMode, setSizingMode] = useState<'none' | 'in' | 'out' | 'betweenness' | 'closeness' | 'impact'>('none');
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [editingDependency, setEditingDependency] = useState<Dependency | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // SNA Calculation
  const metrics = useMemo(() => {
    return calculateSNAMetrics(state.actors, state.dependencies);
  }, [state.actors, state.dependencies]);

  // Actions
  const handleAddActor = (name: string, categoryId: string, description?: string) => {
    const newActor: Actor = {
      id: `a-${Date.now()}`,
      name,
      categoryId,
      notes: '',
      description,
      size: 10
    };
    setState(prev => ({ ...prev, actors: [...prev.actors, newActor] }));
  };

  const handleDeleteActor = (id: string) => {
    setState(prev => ({
      ...prev,
      actors: prev.actors.filter(a => a.id !== id),
      dependencies: prev.dependencies.filter(d => d.source !== id && d.target !== id)
    }));
    if (selectedActorId === id) setSelectedActorId(null);
  };
  
  const handleUpdateActor = (updated: Actor) => {
    setState(prev => ({
      ...prev,
      actors: prev.actors.map(a => a.id === updated.id ? updated : a)
    }));
  };

  const handleAddCategory = (name: string, color: string, description?: string) => {
      const newCat: Category = { id: `cat-${Date.now()}`, name, color, icon: 'Shield', description };
      setState(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const handleDeleteCategory = (id: string) => {
    if (state.categories.length <= 1) return;
    setState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
  };

  const handleUpdateCategory = (updated: Category) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === updated.id ? updated : c)
    }));
  };

  const handleAddDependencyType = (name: string, color: string, style: 'solid' | 'dashed', description?: string) => {
    const newType: DependencyType = { id: `dt-${Date.now()}`, name, color, style, description };
    setState(prev => ({ ...prev, dependencyTypes: [...prev.dependencyTypes, newType] }));
  };

  const handleDeleteDependencyType = (id: string) => {
    if (state.dependencyTypes.length <= 1) return;
    setState(prev => ({ ...prev, dependencyTypes: prev.dependencyTypes.filter(t => t.id !== id) }));
  };

  const handleUpdateDependencyType = (updated: DependencyType) => {
    setState(prev => ({
      ...prev,
      dependencyTypes: prev.dependencyTypes.map(t => t.id === updated.id ? updated : t)
    }));
  };

  const handleToggleRelation = (source: string, target: string) => {
    // Look for ANY existing dependency between these two of the default type
    const defaultTypeId = state.dependencyTypes[0].id;
    const existing = state.dependencies.find(d => 
        d.typeId === defaultTypeId && 
        ((d.source === source && d.target === target) || (d.source === target && d.target === source))
    );
    
    if (existing) {
        setEditingDependency(existing);
    } else {
        const newDep: Dependency = {
            id: `d-${Date.now()}`,
            source,
            target,
            typeId: defaultTypeId,
            strength: 3,
            bidirectional: false
        };
        setState(prev => ({ ...prev, dependencies: [...prev.dependencies, newDep] }));
        setEditingDependency(newDep);
    }
  };

  const handleUpdateDependency = (updated: Dependency) => {
    setState(prev => {
        // If the updated dependency is bidirectional, remove any "other" dependency 
        // of the same type between these two actors to avoid double counting.
        let nextDeps = prev.dependencies;
        
        if (updated.bidirectional) {
            nextDeps = nextDeps.filter(d => 
                d.id === updated.id || // Keep the one we are updating
                d.typeId !== updated.typeId || // Keep different types
                !((d.source === updated.source && d.target === updated.target) || 
                  (d.source === updated.target && d.target === updated.source))
            );
        } else {
            // Even if one-way, ensure we don't have an EXACT duplicate of the same type and direction
            nextDeps = nextDeps.filter(d => 
                d.id === updated.id || 
                d.typeId !== updated.typeId || 
                d.source !== updated.source || 
                d.target !== updated.target
            );
        }

        return {
            ...prev,
            dependencies: nextDeps.map(d => d.id === updated.id ? updated : d)
        };
    });
    setEditingDependency(null);
  };

  const deleteDependency = (id: string) => {
    setState(prev => ({ ...prev, dependencies: prev.dependencies.filter(d => d.id !== id) }));
    setEditingDependency(null);
  };

  const handleReset = () => {
    if (confirm('Reset board to demo data? All current progress will be lost.')) {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        actors: DEMO_ACTORS,
        categories: INITIAL_CATEGORIES,
        dependencies: DEMO_DEPENDENCIES,
        dependencyTypes: INITIAL_DEP_TYPES,
      });
      setSelectedActorId(null);
      setEditingDependency(null);
    }
  };

  const handleExport = () => {
    const totalEdges = Object.values(metrics).reduce((acc, current) => acc + current.degreeCentrality.rawIn, 0);
    const exportData = {
        actors: state.actors,
        categories: state.categories,
        dependencies: state.dependencies,
        dependencyTypes: state.dependencyTypes,
        analysis: {
            timestamp: new Date().toISOString(),
            metrics: metrics,
            summary: {
                density: (state.actors.length > 1 ? (totalEdges / (state.actors.length * (state.actors.length - 1))).toFixed(4) : '0'),
                totalNodes: state.actors.length,
                totalEdges: totalEdges
            }
        }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sociograph-analysis-${Date.now()}.json`;
    a.click();
  };

  const handleSVGExport = () => {
    if (viewMode !== 'map') {
        alert('Please switch to Network Map view to export SVG');
        return;
    }
    const positions = mapRef.current?.getPositions();
    if (!positions || Object.keys(positions).length === 0) {
        alert('Network map not ready for export');
        return;
    }

    const svgString = generateNetworkSVG(
        state.actors,
        state.dependencies,
        state.categories,
        state.dependencyTypes,
        positions,
        metrics,
        sizingMode
    );

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sociograph-visual-${Date.now()}.svg`;
    a.click();
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Robust check for required properties
      if (imported.actors && imported.categories && imported.dependencies && imported.dependencyTypes) {
        const newState: NetworkState = {
          actors: imported.actors,
          categories: imported.categories,
          dependencies: imported.dependencies,
          dependencyTypes: imported.dependencyTypes
        };
        setState(newState);
        setSelectedActorId(null);
        setEditingDependency(null);
      } else {
        alert('Format Error: The file does not contain a valid Sociograph project structure.');
      }
    } catch (e) {
      console.error('Import error:', e);
      alert('Failed to import file. Make sure it is a valid JSON file.');
    }
  };

  const selectedActor = useMemo(() => 
    state.actors.find(a => a.id === selectedActorId), [state.actors, selectedActorId]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <Header 
        onReset={handleReset} 
        onExport={handleExport} 
        onExportSVG={handleSVGExport} 
        onImport={handleImport}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <AnimatePresence initial={false}>
          {sidebarVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="overflow-hidden border-r border-slate-200 bg-white shrink-0 h-full"
            >
                <Sidebar 
                  actors={state.actors} 
                  categories={state.categories}
                  dependencyTypes={state.dependencyTypes}
                  onAddActor={handleAddActor}
                  onDeleteActor={handleDeleteActor}
                  onUpdateActor={handleUpdateActor}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onAddDependencyType={handleAddDependencyType}
                  onDeleteDependencyType={handleDeleteDependencyType}
                  onUpdateDependencyType={handleUpdateDependencyType}
                />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
          {/* Top Toolbar */}
          <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50 shrink-0">
            <div className="flex gap-2">
              <div className="flex bg-white rounded border border-slate-300 p-0.5 shadow-sm">
                <button 
                  onClick={() => setViewMode('matrix')}
                  className={cn(
                      "px-4 py-1 text-xs font-semibold rounded transition-all",
                      viewMode === 'matrix' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Interaction Matrix
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={cn(
                      "px-4 py-1 text-xs font-semibold rounded transition-all",
                      viewMode === 'map' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Network Map
                </button>
                <button 
                  onClick={() => setViewMode('stats')}
                  className={cn(
                      "px-4 py-1 text-xs font-semibold rounded transition-all",
                      viewMode === 'stats' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  SNA Insights
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Node Size By:</label>
              <select 
                className="text-xs border-none bg-transparent font-bold text-slate-700 focus:ring-0 cursor-pointer"
                value={sizingMode}
                onChange={(e) => setSizingMode(e.target.value as any)}
              >
                <option value="none">Default Size</option>
                <option value="in">In-Degree Centrality</option>
                <option value="out">Out-Degree Centrality</option>
                <option value="betweenness">Betweenness Centrality</option>
                <option value="closeness">Closeness Centrality</option>
                <option value="impact">Impact Score</option>
              </select>
            </div>
          </div>

          <div className="flex-1 relative radial-dots overflow-hidden">
            <AnimatePresence mode="wait">
              {viewMode === 'matrix' ? (
                <motion.div 
                    key="matrix" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white"
                >
                  <Matrix 
                    actors={state.actors} 
                    dependencies={state.dependencies} 
                    dependencyTypes={state.dependencyTypes}
                    onToggleRelation={handleToggleRelation}
                    onEditRelation={setEditingDependency}
                  />
                </motion.div>
              ) : viewMode === 'map' ? (
                <motion.div 
                    key="map" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0"
                >
                  <NetworkMap 
                    ref={mapRef}
                    actors={state.actors}
                    categories={state.categories}
                    dependencies={state.dependencies}
                    dependencyTypes={state.dependencyTypes}
                    metrics={metrics}
                    sizingMode={sizingMode}
                    selectedActorId={selectedActorId}
                    onActorClick={setSelectedActorId}
                  />
                </motion.div>
              ) : (
                <motion.div 
                    key="stats" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white"
                >
                  <SNAStats actors={state.actors} dependencies={state.dependencies} categories={state.categories} metrics={metrics} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Node Info Overlay - LIGHT THEME CARD */}
            <AnimatePresence>
                {selectedActor && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-6 right-6 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-5 z-40 pointer-events-auto"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Users size={20} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-sm font-bold text-slate-900 leading-tight">{selectedActor.name}</h2>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                    {state.categories.find(c => c.id === selectedActor.categoryId)?.name}
                                </span>
                            </div>
                            <button onClick={() => setSelectedActorId(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg space-y-4 border border-slate-100">
                                <MetricItem 
                                    label="Betweenness Centrality" 
                                    value={metrics[selectedActor.id].betweennessCentrality} 
                                    color="text-indigo-600" 
                                    help="Identifies bridges and bottlenecks. High values mean many shortest paths pass through this actor." 
                                />
                                <MetricItem 
                                    label="Closeness Centrality" 
                                    value={metrics[selectedActor.id].closenessCentrality} 
                                    color="text-emerald-600" 
                                    help="Measures efficiency. High values mean the actor is 'close' to everyone else on average." 
                                />
                                <MetricItem 
                                    label="Impact Score" 
                                    value={metrics[selectedActor.id].impactScore} 
                                    color="text-amber-600" 
                                    help="Weighted composite score: 70% Betweenness, 30% Closeness. Indicates overall node importance." 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 border border-slate-100 rounded bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">In-Degree</div>
                                        <Info size={10} className="text-slate-300" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <div className="text-xl font-mono font-bold text-slate-800">{metrics[selectedActor.id].degreeCentrality.rawIn}</div>
                                        <div className="text-[10px] text-slate-400">/ {state.actors.length - 1}</div>
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-1 leading-none">Incoming relationships. Score: {(metrics[selectedActor.id].degreeCentrality.in * 100).toFixed(0)}%</div>
                                </div>
                                <div className="p-3 border border-slate-100 rounded bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Out-Degree</div>
                                        <Info size={10} className="text-slate-300" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <div className="text-xl font-mono font-bold text-slate-800">{metrics[selectedActor.id].degreeCentrality.rawOut}</div>
                                        <div className="text-[10px] text-slate-400">/ {state.actors.length - 1}</div>
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-1 leading-none">Outgoing relationships. Score: {(metrics[selectedActor.id].degreeCentrality.out * 100).toFixed(0)}%</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Direct Network</h3>
                                <div className="flex flex-wrap gap-1">
                                    {state.dependencies.filter(d => d.source === selectedActor.id || d.target === selectedActor.id).slice(0, 5).map(d => {
                                        const other = d.source === selectedActor.id ? state.actors.find(a => a.id === d.target) : state.actors.find(a => a.id === d.source);
                                        return (
                                            <span key={d.id} className="px-2 py-1 bg-slate-100 rounded text-[9px] font-bold text-slate-600 flex items-center gap-1 border border-slate-200">
                                               {d.bidirectional ? '↔' : '→'} {other?.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Network Health Legend */}
            {!selectedActor && viewMode === 'map' && (
                <div className="absolute bottom-6 left-6 flex gap-6 bg-white/90 backdrop-blur-sm border border-slate-200 px-5 py-3 rounded-xl shadow-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Density</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{(state.actors.length > 1 ? (state.dependencies.length / (state.actors.length * (state.actors.length - 1))).toFixed(2) : '0')}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-200 pl-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Edges</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{state.dependencies.length}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-200 pl-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Nodes</span>
                    <span className="text-sm font-mono font-bold text-slate-900">{state.actors.length}</span>
                  </div>
                </div>
            )}
          </div>
        </div>
      </main>

      {/* Dependency Editor Modal */}
      <AnimatePresence>
          {editingDependency && (
              <div className="fixed inset-0 z-101 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md glass-panel p-8 rounded-2xl"
                  >
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold flex items-center gap-2"><Sliders className="text-indigo-400" size={20} /> Relationship Editor</h3>
                          <button onClick={() => setEditingDependency(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                      </div>

                      <div className="space-y-6">
                          <div>
                              <label className="tab-header">Connection Type</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {state.dependencyTypes.map(t => (
                                      <button 
                                        key={t.id}
                                        onClick={() => setEditingDependency({...editingDependency, typeId: t.id})}
                                        className={cn(
                                            "px-3 py-2 text-xs font-medium rounded-md border transition-all text-left",
                                            editingDependency.typeId === t.id ? "bg-slate-800 border-indigo-500 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800"
                                        )}
                                      >
                                          <div className="w-full h-1 mb-2 rounded-full" style={{ backgroundColor: t.color }} />
                                          {t.name}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div>
                              <label className="tab-header">Criticality / Strength ({editingDependency.strength})</label>
                              <input 
                                type="range" min="1" max="5" step="1" 
                                className="w-full accent-indigo-500" 
                                value={editingDependency.strength}
                                onChange={(e) => setEditingDependency({...editingDependency, strength: parseInt(e.target.value)})}
                              />
                              <div className="flex justify-between text-[10px] text-slate-600 mt-1 uppercase font-bold">
                                  <span>Weak</span>
                                  <span>Critical</span>
                              </div>
                          </div>

                          <div>
                              <label className="tab-header">Directionality</label>
                              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                                  <button 
                                    onClick={() => setEditingDependency({...editingDependency, bidirectional: false})}
                                    className={cn("flex-1 py-2 text-xs rounded-md font-medium transition-all", !editingDependency.bidirectional ? "bg-slate-800 text-indigo-400 shadow-sm" : "text-slate-500")}
                                  >
                                      One-Way
                                  </button>
                                  <button 
                                    onClick={() => setEditingDependency({...editingDependency, bidirectional: true})}
                                    className={cn("flex-1 py-2 text-xs rounded-md font-medium transition-all", editingDependency.bidirectional ? "bg-slate-800 text-indigo-400 shadow-sm" : "text-slate-500")}
                                  >
                                      Bidirectional
                                  </button>
                              </div>
                          </div>

                          <div className="pt-4 flex gap-3">
                              <button 
                                onClick={() => handleUpdateDependency(editingDependency)}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                              >
                                  Apply Changes
                              </button>
                              <button 
                                onClick={() => deleteDependency(editingDependency.id)}
                                className="p-3 bg-slate-800 hover:bg-red-900/40 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                              >
                                  <X size={20} />
                              </button>
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
}

function MetricItem({ label, value, color, help }: { label: string, value: number, color: string, help: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-slate-400">{label}</span>
                <span className={cn("text-xs font-mono font-bold", color)}>{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, value * 100)}%` }}
                    className={cn("h-full rounded-full", color.replace('text-', 'bg-'))}
                />
            </div>
            <p className="text-[10px] text-slate-600 italic mt-1 leading-tight">{help}</p>
        </div>
    )
}
