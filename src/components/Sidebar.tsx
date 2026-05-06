/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode } from 'react';
import { Actor, Category, DependencyType } from '../types';
import { Plus, Trash2, Edit2, Users, Settings, GitCommit, GitBranch, ChevronDown, ChevronRight, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  actors: Actor[];
  categories: Category[];
  dependencyTypes: DependencyType[];
  onAddActor: (name: string, categoryId: string, description: string) => void;
  onDeleteActor: (id: string) => void;
  onUpdateActor: (actor: Actor) => void;
  onAddCategory: (name: string, color: string, description: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (category: Category) => void;
  onAddDependencyType: (name: string, color: string, style: 'solid' | 'dashed', description: string) => void;
  onDeleteDependencyType: (id: string) => void;
  onUpdateDependencyType: (type: DependencyType) => void;
}

export default function Sidebar({
  actors,
  categories,
  dependencyTypes,
  onAddActor,
  onDeleteActor,
  onUpdateActor,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
  onAddDependencyType,
  onDeleteDependencyType,
  onUpdateDependencyType,
}: SidebarProps) {
  const [editingActorId, setEditingActorId] = useState<string | null>(null);
  const [newActorName, setNewActorName] = useState('');
  const [newActorCat, setNewActorCat] = useState(categories[0]?.id || '');
  const [newActorDesc, setNewActorDesc] = useState('');
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#10b981');
  const [newTypeStyle, setNewTypeStyle] = useState<'solid' | 'dashed'>('solid');
  const [newTypeDesc, setNewTypeDesc] = useState('');

  const [expanded, setExpanded] = useState({
    actors: true,
    categories: false,
    types: false
  });

  const reversedActors = [...actors].reverse();

  return (
    <aside className="w-full h-full border-r border-slate-200 bg-white flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project Assets</h2>
        <p className="text-[10px] text-slate-500 font-medium font-mono">Manage nodes and links</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent bg-slate-50/10 p-5 space-y-6">
          {/* ACTORS SECTION */}
          <section className="space-y-3">
            <button 
              onClick={() => setExpanded(prev => ({ ...prev, actors: !prev.actors }))}
              className="flex items-center justify-between w-full group"
            >
              <h3 className="tab-header flex items-center gap-2 mb-0">
                <Users size={12} className="text-indigo-500" /> 
                Actors ({actors.length})
              </h3>
              {expanded.actors ? <ChevronDown size={14} className="text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
            </button>

            <AnimatePresence>
              {expanded.actors && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      {editingActorId ? 'Edit Actor' : 'Add New Actor'}
                    </div>
                    <input 
                      type="text" 
                      className="tech-input w-full bg-slate-50 border-slate-100 placeholder:text-slate-400 text-xs" 
                      placeholder="Actor name..."
                      value={newActorName}
                      onChange={(e) => setNewActorName(e.target.value)}
                    />
                    <textarea
                      className="tech-input w-full bg-slate-50 border-slate-100 placeholder:text-slate-400 text-[10px] min-h-[40px] resize-none"
                      placeholder="Optional description..."
                      value={newActorDesc}
                      onChange={(e) => setNewActorDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <select 
                        className="tech-input flex-1 bg-slate-50 border-slate-100 cursor-pointer text-[11px]"
                        value={newActorCat}
                        onChange={(e) => setNewActorCat(e.target.value)}
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {editingActorId && (
                        <button 
                          onClick={() => {
                            setEditingActorId(null);
                            setNewActorName('');
                            setNewActorDesc('');
                          }}
                          className="px-3 py-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                            if (newActorName) {
                                if (editingActorId) {
                                  const actor = actors.find(a => a.id === editingActorId);
                                  if (actor) {
                                    onUpdateActor({ ...actor, name: newActorName, categoryId: newActorCat, description: newActorDesc });
                                  }
                                  setEditingActorId(null);
                                } else {
                                  onAddActor(newActorName, newActorCat || categories[0].id, newActorDesc);
                                }
                                setNewActorName('');
                                setNewActorDesc('');
                            }
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors shadow-sm font-bold text-[10px]"
                      >
                        {editingActorId ? 'Save' : 'Add'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {reversedActors.map(actor => {
                      const cat = categories.find(c => c.id === actor.categoryId);
                      return (
                        <div key={actor.id} className="flex items-center justify-between p-2.5 bg-white rounded border border-slate-100 group hover:border-indigo-200 hover:bg-indigo-50/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat?.color }} />
                            <div>
                              <div className="text-xs font-bold text-slate-800 leading-none mb-1">{actor.name}</div>
                              <div className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold">{cat?.name}</div>
                              {actor.description && (
                                <div className="text-[9px] text-slate-500 mt-1 italic whitespace-pre-wrap">{actor.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                setEditingActorId(actor.id);
                                setNewActorName(actor.name);
                                setNewActorDesc(actor.description || '');
                                setNewActorCat(actor.categoryId);
                                setExpanded(prev => ({ ...prev, actors: true }));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1 text-slate-300 hover:text-indigo-500"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => onDeleteActor(actor.id)}
                              className="p-1 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* CATEGORIES SECTION */}
          <section className="space-y-3">
            <button 
              onClick={() => setExpanded(prev => ({ ...prev, categories: !prev.categories }))}
              className="flex items-center justify-between w-full group"
            >
              <h3 className="tab-header flex items-center gap-2 mb-0">
                <Settings size={12} className="text-indigo-500" /> 
                Categories
              </h3>
              {expanded.categories ? <ChevronDown size={14} className="text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
            </button>

            <AnimatePresence>
              {expanded.categories && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 group hover:shadow-xs transition-all">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-[11px] font-bold text-slate-700">{cat.name}</span>
                          </div>
                          {cat.description && (
                            <div className="text-[9px] text-slate-500 italic ml-5.5 whitespace-pre-wrap">{cat.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setNewCatName(cat.name);
                              setNewCatColor(cat.color);
                              setNewCatDesc(cat.description || '');
                            }}
                            className="p-1 text-slate-300 hover:text-indigo-500"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => onDeleteCategory(cat.id)}
                            className="p-1 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-1 pt-1 opacity-60">
                      {editingCategoryId ? 'Edit Category' : 'Add Category'}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="tech-input flex-1 border-none bg-transparent shadow-none text-xs" 
                        placeholder="Category name..." 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                      />
                      <input 
                        type="color" 
                        className="w-6 h-6 p-0 bg-transparent border-none cursor-pointer" 
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                      />
                    </div>
                    <textarea
                      className="tech-input w-full bg-slate-50 border-slate-100 placeholder:text-slate-400 text-[10px] min-h-[40px] resize-none"
                      placeholder="Optional description..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      {editingCategoryId && (
                        <button 
                          onClick={() => {
                            setEditingCategoryId(null);
                            setNewCatName('');
                            setNewCatDesc('');
                            setNewCatColor('#6366f1');
                          }}
                          className="flex-1 p-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded text-[10px] font-bold"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                            if (newCatName) {
                              if (editingCategoryId) {
                                const cat = categories.find(c => c.id === editingCategoryId);
                                if (cat) {
                                  onUpdateCategory({ ...cat, name: newCatName, color: newCatColor, description: newCatDesc });
                                }
                                setEditingCategoryId(null);
                              } else {
                                onAddCategory(newCatName, newCatColor, newCatDesc);
                              }
                              setNewCatName('');
                              setNewCatDesc('');
                              setNewCatColor('#6366f1');
                            }
                        }}
                        className="flex-3 p-1 bg-indigo-600 text-white hover:bg-indigo-500 rounded text-[10px] font-bold"
                      >
                        {editingCategoryId ? 'Save Changes' : 'Add Category'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* RELATIONSHIP TYPES SECTION */}
          <section className="space-y-3">
            <button 
              onClick={() => setExpanded(prev => ({ ...prev, types: !prev.types }))}
              className="flex items-center justify-between w-full group"
            >
              <h3 className="tab-header flex items-center gap-2 mb-0">
                <GitBranch size={12} className="text-indigo-500" /> 
                Relationship Types
              </h3>
              {expanded.types ? <ChevronDown size={14} className="text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
            </button>

            <AnimatePresence>
              {expanded.types && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div className="space-y-2">
                    {dependencyTypes.map(type => (
                      <div key={type.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 group hover:shadow-xs transition-all">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <div className="w-5" style={{ 
                                borderBottomWidth: '2px', 
                                borderBottomColor: type.color, 
                                borderBottomStyle: type.style === 'dashed' ? 'dashed' : 'solid' 
                            }} />
                            <span className="text-[11px] font-bold text-slate-700 lowercase tracking-tight">{type.name}</span>
                          </div>
                          {type.description && (
                            <div className="text-[9px] text-slate-500 italic ml-8 whitespace-pre-wrap">{type.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              setEditingTypeId(type.id);
                              setNewTypeName(type.name);
                              setNewTypeColor(type.color);
                              setNewTypeStyle(type.style);
                              setNewTypeDesc(type.description || '');
                            }}
                            className="p-1 text-slate-300 hover:text-indigo-500"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => onDeleteDependencyType(type.id)}
                            className="p-1 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400 opacity-60">
                      {editingTypeId ? 'Edit Relationship' : 'Add Relationship'}
                    </div>
                    <input 
                      type="text" 
                      className="tech-input w-full bg-slate-50 border-slate-100 placeholder:text-slate-400 text-xs" 
                      placeholder="Relationship name..." 
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                    />
                    <textarea
                      className="tech-input w-full bg-slate-50 border-slate-100 placeholder:text-slate-400 text-[10px] min-h-[40px] resize-none"
                      placeholder="Optional description..."
                      value={newTypeDesc}
                      onChange={(e) => setNewTypeDesc(e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        className="w-6 h-6 p-0 bg-transparent border-none cursor-pointer" 
                        value={newTypeColor}
                        onChange={(e) => setNewTypeColor(e.target.value)}
                      />
                      <select 
                        className="tech-input flex-1 text-[10px] border-slate-100 bg-slate-50"
                        value={newTypeStyle}
                        onChange={(e) => setNewTypeStyle(e.target.value as any)}
                      >
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                      </select>
                      {editingTypeId && (
                         <button 
                           onClick={() => {
                             setEditingTypeId(null);
                             setNewTypeName('');
                             setNewTypeDesc('');
                           }}
                           className="p-1 px-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded"
                         >
                           Cancel
                         </button>
                      )}
                      <button 
                        onClick={() => {
                            if (newTypeName) {
                              if (editingTypeId) {
                                const type = dependencyTypes.find(t => t.id === editingTypeId);
                                if (type) {
                                  onUpdateDependencyType({ ...type, name: newTypeName, color: newTypeColor, style: newTypeStyle, description: newTypeDesc });
                                }
                                setEditingTypeId(null);
                              } else {
                                onAddDependencyType(newTypeName, newTypeColor, newTypeStyle, newTypeDesc);
                              }
                              setNewTypeName('');
                              setNewTypeDesc('');
                            }
                        }}
                        className="p-1.5 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-500 transition-colors"
                      >
                        {editingTypeId ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
      </div>
    </aside>
  );
}

