/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Actor, Category, SNAMetrics } from '../types';
import { cn } from '../lib/utils';

interface SNAStatsProps {
  actors: Actor[];
  categories: Category[];
  metrics: Record<string, SNAMetrics>;
}

export default function SNAStats({ actors, categories, metrics }: SNAStatsProps) {
  const sortedByBetweenness = [...actors].sort((a, b) => 
    (metrics[b.id]?.betweennessCentrality || 0) - (metrics[a.id]?.betweennessCentrality || 0)
  );

  return (
    <div className="p-8 h-full overflow-auto space-y-10 bg-slate-50">
      <section>
        <h3 className="tab-header tracking-[0.2em] mb-4">Network Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox label="Total Nodes" value={actors.length} />
          <StatBox label="Network Density" value={(actors.length > 1 ? (Object.keys(metrics).length / (actors.length * (actors.length - 1))).toFixed(2) : '0')} />
          <StatBox label="Avg Degree" value={(Object.values(metrics).reduce((acc, current) => acc + current.degreeCentrality.total, 0) / actors.length).toFixed(2)} />
          <StatBox label="Flow Efficiency" value={(Object.values(metrics).reduce((acc, current) => acc + current.closenessCentrality, 0) / actors.length).toFixed(2)} />
        </div>
      </section>

      <section>
        <h3 className="tab-header tracking-[0.2em] mb-4">Centrality Leaderboard</h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left uppercase tracking-tighter">Actor Entity</th>
                <th className="px-6 py-4 text-center uppercase tracking-tighter">In / Out Ratio</th>
                <th className="px-6 py-4 text-center uppercase tracking-tighter">Betweenness (Rank)</th>
                <th className="px-6 py-4 text-center uppercase tracking-tighter">Impact Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedByBetweenness.map(actor => {
                const m = metrics[actor.id];
                const cat = categories.find(c => c.id === actor.categoryId);
                const impact = (m.betweennessCentrality * 0.7 + m.closenessCentrality * 0.3);
                return (
                  <tr key={actor.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat?.color }} />
                        <div>
                            <span className="font-bold text-slate-800 block">{actor.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">{cat?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-slate-500">
                        {m.degreeCentrality.in.toFixed(2)} / {m.degreeCentrality.out.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                         <span className={cn(
                             "px-2 py-0.5 rounded text-[10px] font-bold",
                             m.betweennessCentrality > 0.6 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                         )}>
                             {(m.betweennessCentrality * 100).toFixed(1)}%
                         </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${impact * 100}%` }} />
                            </div>
                            <span className="font-mono text-[10px] font-bold text-slate-700">{(impact * 100).toFixed(0)}</span>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 truncate">{label}</div>
      <div className="text-2xl font-mono font-bold text-slate-900">{value}</div>
    </div>
  );
}
