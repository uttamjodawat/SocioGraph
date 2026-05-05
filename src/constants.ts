/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Actor, Category, Dependency, DependencyType } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Public Safety', color: '#ef4444', icon: 'Shield' },
  { id: 'cat-2', name: 'Health Services', color: '#3b82f6', icon: 'Heart' },
  { id: 'cat-3', name: 'Infrastructure', color: '#10b981', icon: 'Settings' },
  { id: 'cat-4', name: 'Government', color: '#8b5cf6', icon: 'Landmark' },
  { id: 'cat-5', name: 'Tech / Comms', color: '#f59e0b', icon: 'Wifi' },
];

export const INITIAL_DEP_TYPES: DependencyType[] = [
  { id: 'dt-1', name: 'Financial', color: '#10b981', style: 'solid' },
  { id: 'dt-2', name: 'Operational', color: '#3b82f6', style: 'solid' },
  { id: 'dt-3', name: 'Information', color: '#f59e0b', style: 'dashed' },
  { id: 'dt-4', name: 'Regulatory', color: '#ef4444', style: 'solid' },
];

export const DEMO_ACTORS: Actor[] = [
  { id: 'a-1', name: 'Central Fire Dept', categoryId: 'cat-1', notes: 'Main coordination for fire emergencies', size: 10 },
  { id: 'a-2', name: 'City Hospital', categoryId: 'cat-2', notes: 'Tertiary care center', size: 10 },
  { id: 'a-3', name: 'Mayor\'s Office', categoryId: 'cat-4', notes: 'Political leadership', size: 10 },
  { id: 'a-4', name: 'Telecom Grid', categoryId: 'cat-5', notes: 'Critical comms hub', size: 10 },
  { id: 'a-5', name: 'Water Utility', categoryId: 'cat-3', notes: 'Water and sanitation control', size: 10 },
];

export const DEMO_DEPENDENCIES: Dependency[] = [
  { id: 'd-1', source: 'a-1', target: 'a-2', typeId: 'dt-2', strength: 5, bidirectional: true }, // Fire <-> Hospital
  { id: 'd-2', source: 'a-3', target: 'a-1', typeId: 'dt-4', strength: 4, bidirectional: false }, // Mayor -> Fire
  { id: 'd-3', source: 'a-3', target: 'a-2', typeId: 'dt-4', strength: 4, bidirectional: false }, // Mayor -> Hospital
  { id: 'd-4', source: 'a-4', target: 'a-1', typeId: 'dt-3', strength: 5, bidirectional: true }, // Telecom <-> Fire
  { id: 'd-5', source: 'a-5', target: 'a-1', typeId: 'dt-2', strength: 3, bidirectional: false }, // Water -> Fire
  { id: 'd-6', source: 'a-4', target: 'a-3', typeId: 'dt-3', strength: 2, bidirectional: false }, // Telecom -> Mayor
];
