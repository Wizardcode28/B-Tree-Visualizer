export type HighlightState = 'default' | 'active' | 'found' | 'splitting' | 'range';

export interface TreeNode {
  id: string;
  keys: number[];
  children: TreeNode[];
  isLeaf: boolean;
}

export interface Step {
  tree: TreeNode | null;
  highlights: Record<string, HighlightState>;
  description: string;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  keys: number[];
  isLeaf: boolean;
  width: number;
  height: number;
}

export interface LayoutEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  leafLinks: LayoutEdge[];
  width: number;
  height: number;
}

export type TreeMode = 'btree' | 'bplus';

export interface TreeMetrics {
  height: number;
  nodeCount: number;
  keyCount: number;
  order: number;
  mode: TreeMode;
}
