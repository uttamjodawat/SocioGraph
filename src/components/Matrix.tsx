import { useState, useMemo } from 'react';
import { Actor, Dependency, DependencyType } from '../types';
import { cn } from '../lib/utils';
import { Settings2, Search, X } from 'lucide-react';

interface MatrixProps {
  actors: Actor[];
  dependencies: Dependency[];
  dependencyTypes: DependencyType[];
  onToggleRelation: (sourceId: string, targetId: string) => void;
  onEditRelation: (dep: Dependency) => void;
}

export default function Matrix({
  actors,
  dependencies,
  dependencyTypes,
  onToggleRelation,
  onEditRelation
}: MatrixProps) {
  const [search, setSearch] = useState('');

  const filteredActors = useMemo(() => {
    if (!search) return actors;
    const s = search.toLowerCase();
    return actors.filter(a => a.name.toLowerCase().includes(s));
  }, [actors, search]);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden p-6">
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Interaction Matrix</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Row: Source</span>
                <span className="text-slate-200">|</span>
                <span>Column: Target</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter source entities..." 
                className="tech-input w-full pl-9 pr-8 bg-slate-50 border-slate-200 focus:bg-white" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                {filteredActors.length} / {actors.length} Nodes
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-slate-200 rounded-xl relative bg-slate-50/20 shadow-inner">
        <table className="border-separate border-spacing-0 text-[10px] font-mono min-w-full">
          <thead className="sticky top-0 z-40">
            <tr>
              <th className="p-3 border-r border-b border-slate-200 sticky top-0 left-0 z-50 bg-slate-100 min-w-[140px] max-w-[200px] shadow-[2px_2px_5px_rgba(0,0,0,0.05)]">
                 <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Source \ Target</div>
              </th>
              {actors.map(actor => (
                <th key={actor.id} className="p-2 border-r border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-tighter text-center min-w-[50px] whitespace-nowrap overflow-hidden transition-colors sticky top-0 z-30">
                  <div className="[writing-mode:vertical-lr] rotate-180 h-28 mx-auto flex items-center justify-center font-bold">
                    {actor.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredActors.map((source) => (
              <tr key={source.id} className="group/row">
                <td className="p-3 border-r border-b border-slate-200 bg-slate-50 font-bold text-slate-700 sticky left-0 z-20 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] uppercase shadow-[2px_0_5px_rgba(0,0,0,0.05)] group-hover/row:bg-indigo-50 group-hover/row:text-indigo-700 transition-colors">
                  {source.name}
                </td>
                {actors.map((target) => {
                  const isDiagonal = source.id === target.id;
                  const dep = dependencies.find(
                    d => (d.source === source.id && d.target === target.id) ||
                         (d.bidirectional && d.source === target.id && d.target === source.id)
                  );

                  if (isDiagonal) {
                    return <td key={target.id} className="p-0 border-r border-b border-slate-200 bg-slate-200/50" />;
                  }

                  return (
                    <td
                      key={target.id}
                      className={cn(
                        "p-0 border-r border-b border-slate-200 text-center cursor-pointer transition-all group/cell relative",
                        dep ? "bg-white" : "hover:bg-indigo-50/30"
                      )}
                      onClick={() => dep ? onEditRelation(dep) : onToggleRelation(source.id, target.id)}
                    >
                      <div className="flex items-center justify-center min-h-[36px] w-full h-full">
                        {dep ? (
                          <div className="relative">
                            <div 
                              className="w-3 h-3 rounded-sm shadow-sm rotate-45" 
                              style={{ backgroundColor: dependencyTypes.find(t => t.id === dep.typeId)?.color || 'white' }} 
                            />
                            <div className="absolute -top-4 -right-4 hidden group-hover/cell:flex bg-white p-1 rounded-full border border-slate-200 shadow-2xl z-50">
                               <Settings2 size={12} className="text-indigo-600" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-slate-200 opacity-0 group-hover/cell:opacity-100" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-between px-2">
         <div className="flex gap-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No Link</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-sm rotate-45" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Relationship</span>
            </div>
         </div>
         <div className="text-[10px] font-bold text-slate-400 uppercase italic">
            Click any cell to establish or modify connection
         </div>
      </div>
    </div>
  );
}

