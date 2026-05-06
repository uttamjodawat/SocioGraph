/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Actor {
  id: string;
  name: string;
  categoryId: string;
  notes: string;
  description?: string;
  size: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface Dependency {
  id: string;
  source: string;
  target: string;
  typeId: string;
  strength: number; // 1-5
  bidirectional: boolean;
}

export interface DependencyType {
  id: string;
  name: string;
  color: string;
  style: 'solid' | 'dashed';
  description?: string;
}

export interface SNAMetrics {
  degreeCentrality: {
    in: number;
    out: number;
    total: number;
    rawIn: number;
    rawOut: number;
    rawTotal: number;
  };
  betweennessCentrality: number;
  closenessCentrality: number;
  impactScore: number;
}

export type NetworkState = {
  actors: Actor[];
  categories: Category[];
  dependencies: Dependency[];
  dependencyTypes: DependencyType[];
};
