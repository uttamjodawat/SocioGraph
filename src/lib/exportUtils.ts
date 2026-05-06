/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Actor, Dependency, Category, DependencyType } from '../types';

function escapeXML(str: string): string {
    return str.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
}

export function generateNetworkSVG(
    actors: Actor[],
    dependencies: Dependency[],
    categories: Category[],
    dependencyTypes: DependencyType[],
    positions: Record<string, { x: number; y: number }>,
    metrics: Record<string, any>,
    sizingMode: string
): string {
    const padding = 100;
    const nodeCoords = Object.values(positions);
    
    if (nodeCoords.length === 0) return '';

    const minX = Math.min(...nodeCoords.map(p => p.x)) - padding;
    const minY = Math.min(...nodeCoords.map(p => p.y)) - padding;
    const maxX = Math.max(...nodeCoords.map(p => p.x)) + padding;
    const maxY = Math.max(...nodeCoords.map(p => p.y)) + padding;
    const width = maxX - minX;
    const height = maxY - minY;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">`;
    svg += `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />`;

    // Draw Edges
    dependencies.forEach(dep => {
        const source = positions[dep.source];
        const target = positions[dep.target];
        if (!source || !target) return;

        const type = dependencyTypes.find(t => t.id === dep.typeId);
        const color = type?.color || '#64748b';
        const isDashed = type?.style === 'dashed';
        const strength = dep.strength || 1;

        // Simple straight lines for export
        svg += `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" 
                 stroke="${color}" stroke-width="${strength}" 
                 ${isDashed ? 'stroke-dasharray="5,5"' : ''} />`;
        
        // Arrows
        svg += `<circle cx="${target.x}" cy="${target.y}" r="3" fill="${color}" />`;
    });

    // Draw Nodes
    actors.forEach(actor => {
        const pos = positions[actor.id];
        if (!pos) return;

        const cat = categories.find(c => c.id === actor.categoryId);
        const color = cat?.color || '#94a3b8';
        const metricValue = getMetricValue(metrics, actor.id, sizingMode);
        const radius = 15 + metricValue * 30;
        const escapedName = escapeXML(actor.name);

        svg += `<circle cx="${pos.x}" cy="${pos.y}" r="${radius}" fill="${color}" stroke="#1e293b" stroke-width="2" />`;
        svg += `<text x="${pos.x}" y="${pos.y + radius + 15}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#1e293b">${escapedName}</text>`;
    });

    svg += '</svg>';
    return svg;
}

function getMetricValue(metrics: Record<string, any>, id: string, mode: string): number {
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
