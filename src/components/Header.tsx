/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Network, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onExport: () => void;
  onExportSVG: () => void;
  onImport: (file: File) => void;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ onReset, onExport, onExportSVG, onImport, sidebarVisible, onToggleSidebar }: HeaderProps) {
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
    <header className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-700">
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
            <h1 className="text-lg font-bold tracking-tight text-slate-100">Sociograph</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onReset} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors">
          Reset Board
        </button>
        <button onClick={handleImportClick} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors">
          Import JSON
        </button>
        <button onClick={onExportSVG} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors">
          Export SVG Map
        </button>
        <button onClick={onExport} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded transition-colors shadow-lg shadow-indigo-600/20">
          Export Analysis Data
        </button>
      </div>
    </header>
  );
}
