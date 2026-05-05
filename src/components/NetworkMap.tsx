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
  sizingMode: 'none' | 'in' | 'out' | 'betweenness' | 'closeness';
  onActorClick: (id: string | null) => void;
}

const NetworkMap = forwardRef<NetworkMapRef, NetworkMapProps>(({
  actors,
  categories,
  dependencies,
  dependencyTypes,
  metrics,
  sizingMode,
  onActorClick
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useImperativeHandle(ref, () => ({
    getPositions: () => {
        if (!networkRef.current) return {};
        return networkRef.current.getPositions();
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet(
      actors.map(actor => {
        const cat = categories.find(c => c.id === actor.categoryId);
        const metricValue = getMetricForActor(actor.id, metrics, sizingMode);
        
        return {
          id: actor.id,
          label: actor.name,
          color: {
            background: cat?.color || '#94a3b8',
            border: '#1e293b',
            highlight: {
              background: cat?.color || '#94a3b8',
              border: '#ffffff'
            }
          },
          font: { color: '#1e293b', size: 14, face: 'Inter', strokeWidth: 4, strokeColor: '#ffffff' },
          size: 25 + metricValue * 50, // Scale based on metric
          shape: 'dot',
          borderWidth: 2,
        };
      })
    );

    const edges = new DataSet(
      dependencies.map(dep => {
        const depType = dependencyTypes.find(t => t.id === dep.typeId);
        return {
          id: dep.id,
          from: dep.source,
          to: dep.target,
          arrows: dep.bidirectional ? 'to, from' : 'to',
          width: dep.strength,
          color: {
            color: depType?.color || '#64748b',
            highlight: '#1e293b',
            active: depType?.color || '#64748b',
          },
          dashes: depType?.style === 'dashed',
          smooth: { enabled: true, type: 'curvedCW', roundness: 0.2 },
        };
      })
    );

    const options: any = {
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
        stabilization: { iterations: 150 },
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

    const network = new Network(containerRef.current, { nodes, edges }, options);
    networkRef.current = network;

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        onActorClick(params.nodes[0]);
      } else {
        onActorClick(null);
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [actors, dependencies, sizingMode, categories, dependencyTypes, metrics]);

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
    default: return 0;
  }
}
