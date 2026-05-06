/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { DataSet, Network, Options } from 'vis-network/standalone';
import { Actor, Category, Dependency, DependencyType, SNAMetrics } from '../types';

export interface NetworkMapRef {
    getPositions: () => Record<string, { x: number, y: number }>;
}

interface NetworkMapProps {
  actors: Actor[];
  categories: Category[];
  dependencies: Dependency[];
  dependencyTypes: DependencyType[];
  metrics: Record<string, SNAMetrics>;
  sizingMode: 'none' | 'in' | 'out' | 'betweenness' | 'closeness' | 'impact';
  selectedActorId: string | null;
  onActorClick: (id: string | null) => void;
}

const NetworkMap = forwardRef<NetworkMapRef, NetworkMapProps>(({
  actors,
  categories,
  dependencies,
  dependencyTypes,
  metrics,
  sizingMode,
  selectedActorId,
  onActorClick
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesRef = useRef<DataSet<any> | null>(null);
  const edgesRef = useRef<DataSet<any> | null>(null);

  useImperativeHandle(ref, () => ({
    getPositions: () => {
        if (!networkRef.current) return {};
        return networkRef.current.getPositions();
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Identify neighbors of selected actor
    const neighborIds = new Set<string>();
    if (selectedActorId) {
      neighborIds.add(selectedActorId);
      dependencies.forEach(dep => {
        if (dep.source === selectedActorId) neighborIds.add(dep.target);
        if (dep.target === selectedActorId) neighborIds.add(dep.source);
      });
    }

    const nodesData = actors.map(actor => {
      const cat = categories.find(c => c.id === actor.categoryId);
      const metricValue = getMetricForActor(actor.id, metrics, sizingMode);
      
      const isSelected = selectedActorId === actor.id;
      const isNeighbor = neighborIds.has(actor.id);
      const hasSelection = selectedActorId !== null;

      // Faded colors for non-related nodes
      const baseColor = cat?.color || '#94a3b8';
      const opacity = hasSelection && !isNeighbor ? 0.2 : 1;
      
      return {
        id: actor.id,
        label: actor.name,
        color: {
          background: baseColor,
          border: isSelected ? '#1e293b' : '#334155',
          highlight: {
            background: baseColor,
            border: '#000000'
          },
          hover: {
            background: baseColor,
            border: '#000000'
          }
        },
        opacity: opacity,
        font: { 
          color: hasSelection && !isNeighbor ? '#94a3b8' : '#1e293b', 
          size: 14, 
          face: 'Inter', 
          strokeWidth: 4, 
          strokeColor: '#ffffff' 
        },
        size: 25 + metricValue * 50,
        shape: 'dot',
        borderWidth: isSelected ? 4 : 2,
        shadow: isSelected ? { enabled: true, color: 'rgba(0,0,0,0.2)', size: 10, x: 0, y: 0 } : false
      };
    });

    const edgesData = dependencies.map(dep => {
      const depType = dependencyTypes.find(t => t.id === dep.typeId);
      const isRelated = selectedActorId === dep.source || selectedActorId === dep.target;
      const hasSelection = selectedActorId !== null;
      
      return {
        id: dep.id,
        from: dep.source,
        to: dep.target,
        arrows: dep.bidirectional ? 'to, from' : 'to',
        width: dep.strength, // Removed thickening
        color: {
          color: hasSelection && !isRelated ? '#e2e8f0' : (depType?.color || '#64748b'),
          highlight: depType?.color || '#1e293b',
          active: depType?.color || '#64748b',
          opacity: hasSelection && !isRelated ? 0.1 : 0.8
        },
        dashes: depType?.style === 'dashed',
        smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 },
        shadow: isRelated ? { enabled: true, color: 'rgba(0,0,0,0.1)', size: 5, x: 0, y: 0 } : false
      };
    });

    if (!networkRef.current) {
        nodesRef.current = new DataSet(nodesData);
        edgesRef.current = new DataSet(edgesData);

        const options: Options = {
          physics: {
            forceAtlas2Based: {
              gravitationalConstant: -100,
              centralGravity: 0.01,
              springLength: 150,
              springConstant: 0.08,
            },
            maxVelocity: 50,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: { 
              iterations: 150,
              updateInterval: 25
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            hideEdgesOnDrag: true,
          },
          edges: {
            selectionWidth: 2,
          },
        };

        const network = new Network(containerRef.current, { 
            nodes: nodesRef.current, 
            edges: edgesRef.current 
        }, options);
        
        networkRef.current = network;

        network.on('click', (params) => {
          if (params.nodes.length > 0) {
            onActorClick(params.nodes[0]);
          } else {
            onActorClick(null);
          }
        });
    } else {
        // Update data sets instead of recreating network
        // Note: remove ids that are no longer present
        const currentNodes = nodesRef.current!.getIds();
        const nextNodes = nodesData.map(n => n.id);
        const nodesToRemove = currentNodes.filter(id => !nextNodes.includes(id as string));
        if (nodesToRemove.length > 0) nodesRef.current!.remove(nodesToRemove);
        nodesRef.current!.update(nodesData);

        const currentEdges = edgesRef.current!.getIds();
        const nextEdges = edgesData.map(e => e.id);
        const edgesToRemove = currentEdges.filter(id => !nextEdges.includes(id as string));
        if (edgesToRemove.length > 0) edgesRef.current!.remove(edgesToRemove);
        edgesRef.current!.update(edgesData);
    }

    return () => {
      // We only destroy if the component unmounts
    };
  }, [actors, dependencies, sizingMode, categories, dependencyTypes, metrics, selectedActorId]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative" id="network-map-container">
      <div ref={containerRef} className="w-full h-full" id="network-map-canvas" />
      
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-xl pointer-events-auto">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</h4>
            <div className="space-y-2">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                        <span className="text-[11px] font-bold text-slate-700">{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-xl pointer-events-auto">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Relationships</h4>
            <div className="space-y-2">
                {dependencyTypes.map(type => (
                    <div key={type.id} className="flex items-center gap-2">
                        <div className="w-6" style={{ 
                            borderBottomColor: type.color, 
                            borderBottomStyle: type.style === 'dashed' ? 'dashed' : 'solid', 
                            borderBottomWidth: '2px' 
                        }} />
                        <span className="text-[11px] font-bold text-slate-700">{type.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
});

export default NetworkMap;

function getMetricForActor(id: string, metrics: Record<string, SNAMetrics>, mode: string): number {
  const m = metrics[id];
  if (!m) return 0;
  switch (mode) {
    case 'in': return m.degreeCentrality.in;
    case 'out': return m.degreeCentrality.out;
    case 'betweenness': return m.betweennessCentrality;
    case 'closeness': return m.closenessCentrality;
    case 'impact': return m.impactScore;
    default: return 0;
  }
}
