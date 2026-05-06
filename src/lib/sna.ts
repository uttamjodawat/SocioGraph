/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Actor, Dependency, SNAMetrics } from '../types';

/**
 * Calculates SNA metrics for a given network of actors and dependencies.
 */
export function calculateSNAMetrics(actors: Actor[], dependencies: Dependency[]): Record<string, SNAMetrics> {
  const n = actors.length;
  const metrics: Record<string, SNAMetrics> = {};
  
  // Initialize metrics
  actors.forEach(actor => {
    metrics[actor.id] = {
      degreeCentrality: { in: 0, out: 0, total: 0, rawIn: 0, rawOut: 0, rawTotal: 0 },
      betweennessCentrality: 0,
      closenessCentrality: 0,
      impactScore: 0
    };
  });

  if (n < 2) return metrics;

  // 1. Degree Centrality
  dependencies.forEach(dep => {
    if (metrics[dep.source]) {
      metrics[dep.source].degreeCentrality.rawOut++;
      metrics[dep.source].degreeCentrality.rawTotal++;
    }
    if (metrics[dep.target]) {
      metrics[dep.target].degreeCentrality.rawIn++;
      metrics[dep.target].degreeCentrality.rawTotal++;
    }
    if (dep.bidirectional) {
      if (metrics[dep.source]) {
        metrics[dep.source].degreeCentrality.rawIn++;
        metrics[dep.source].degreeCentrality.rawTotal++;
      }
      if (metrics[dep.target]) {
        metrics[dep.target].degreeCentrality.rawOut++;
        metrics[dep.target].degreeCentrality.rawTotal++;
      }
    }
  });

  // Normalize Degree Centrality and copy raw values
  actors.forEach(actor => {
    const m = metrics[actor.id];
    m.degreeCentrality.in = m.degreeCentrality.rawIn / (n - 1);
    m.degreeCentrality.out = m.degreeCentrality.rawOut / (n - 1);
    m.degreeCentrality.total = m.degreeCentrality.rawTotal / (n - 1);
  });

  // 2. Shortest Paths & Betweenness (Brandes' Algorithm)
  const betweenness: Record<string, number> = {};
  actors.forEach(a => betweenness[a.id] = 0);

  // Build adjacency list
  const adj: Record<string, string[]> = {};
  actors.forEach(a => adj[a.id] = []);
  dependencies.forEach(dep => {
    adj[dep.source].push(dep.target);
    if (dep.bidirectional) adj[dep.target].push(dep.source);
  });

  actors.forEach(s => {
    const S: string[] = []; // Stack
    const P: Record<string, string[]> = {}; // Predecessors
    const sigma: Record<string, number> = {}; // Paths from s
    const d: Record<string, number> = {}; // Distance from s
    
    actors.forEach(v => {
      P[v.id] = [];
      sigma[v.id] = 0;
      d[v.id] = -1;
    });

    sigma[s.id] = 1;
    d[s.id] = 0;

    const Q: string[] = [s.id]; // Queue

    while (Q.length > 0) {
      const vId = Q.shift()!;
      S.push(vId);
      
      adj[vId].forEach(wId => {
        // Path discovery
        if (d[wId] < 0) {
          d[wId] = d[vId] + 1;
          Q.push(wId);
        }
        // Path counting
        if (d[wId] === d[vId] + 1) {
          sigma[wId] += sigma[vId];
          P[wId].push(vId);
        }
      });
    }

    const delta: Record<string, number> = {};
    actors.forEach(v => delta[v.id] = 0);

    while (S.length > 0) {
      const wId = S.pop()!;
      P[wId].forEach(vId => {
        delta[vId] += (sigma[vId] / sigma[wId]) * (1 + delta[wId]);
      });
      if (wId !== s.id) {
        betweenness[wId] += delta[wId];
      }
    }
  });

  // Closeness Centrality
  actors.forEach(s => {
    const d: Record<string, number> = {};
    const Q: string[] = [s.id];
    actors.forEach(v => d[v.id] = -1);
    d[s.id] = 0;

    let sumDist = 0;
    let reachableCount = 0;

    while (Q.length > 0) {
      const vId = Q.shift()!;
      adj[vId].forEach(wId => {
        if (d[wId] < 0) {
          d[wId] = d[vId] + 1;
          sumDist += d[wId];
          reachableCount++;
          Q.push(wId);
        }
      });
    }

    if (reachableCount > 0) {
      // Wasserman and Faust normalization for disconnected components
      metrics[s.id].closenessCentrality = (reachableCount / (n - 1)) * (reachableCount / sumDist);
    } else {
      metrics[s.id].closenessCentrality = 0;
    }
  });

  // Normalize Betweenness and calculate final Impact Score
  const normalization = (n - 1) * (n - 2);
  actors.forEach(actor => {
    const m = metrics[actor.id];
    m.betweennessCentrality = normalization > 0 ? betweenness[actor.id] / normalization : 0;
    // Composite Impact Score (Weighted Betweenness 70% and Closeness 30%)
    m.impactScore = (m.betweennessCentrality * 0.7 + m.closenessCentrality * 0.3);
  });

  return metrics;
}
