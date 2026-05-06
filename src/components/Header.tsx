/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Network, PanelLeftOpen, PanelLeftClose, ChevronDown, Download, FileJson, FileSpreadsheet, Image } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  onReset: () => void;
  onExportJSON: () => void;
  onExportNodesCSV: () => void;
  onExportConnectionsCSV: () => void;
  onExportSummaryCSV: () => void;
  onExportSVG: () => void;
  onImport: (file: File) => void;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ 
  onReset, 
  onExportJSON, 
  onExportNodesCSV,
  onExportConnectionsCSV,
  onExportSummaryCSV,
  onExportSVG, 
  onImport, 
  sidebarVisible, 
  onToggleSidebar 
}: HeaderProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  return (
    <header className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-700 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarVisible ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
            <Network className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 italic">NexusMap</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onReset} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors">
          Reset
        </button>
        <button onClick={handleImportClick} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors">
          Import Project
        </button>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Download size={14} />
            Export
            <ChevronDown size={14} className={cn("transition-transform", exportMenuOpen && "rotate-180")} />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Formats</div>
              
              <button 
                onClick={() => { onExportJSON(); setExportMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <FileJson size={14} className="text-amber-500" />
                <div className="flex-1">
                  <div className="font-bold">Project Data (JSON)</div>
                  <div className="text-[10px] text-slate-400">Full backup & analysis details</div>
                </div>
              </button>

              <button 
                onClick={() => { onExportSVG(); setExportMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Image size={14} className="text-indigo-500" />
                <div className="flex-1">
                  <div className="font-bold">Vector Map (SVG)</div>
                  <div className="text-[10px] text-slate-400">Visual snapshot of the map</div>
                </div>
              </button>

              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-b border-slate-50 mt-1">Spreadsheets (CSV)</div>
              
              <button 
                onClick={() => { onExportNodesCSV(); setExportMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <div className="flex-1">
                  <div className="font-bold">Nodes & SNA Metrics</div>
                  <div className="text-[10px] text-slate-400">Centrality, Impact & Adjacency</div>
                </div>
              </button>

              <button 
                onClick={() => { onExportConnectionsCSV(); setExportMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <div className="flex-1">
                  <div className="font-bold">Connections List</div>
                  <div className="text-[10px] text-slate-400">All network relationships</div>
                </div>
              </button>

              <button 
                onClick={() => { onExportSummaryCSV(); setExportMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <FileSpreadsheet size={14} className="text-emerald-500" />
                <div className="flex-1">
                  <div className="font-bold">Network Summary</div>
                  <div className="text-[10px] text-slate-400">Density & Global metrics</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
