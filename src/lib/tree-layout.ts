import { TreeNode, LayoutNode, LayoutEdge, LayoutResult } from './tree-types';

const KEY_WIDTH = 48;
const KEY_HEIGHT = 36;
const LEVEL_GAP = 80;
const NODE_GAP = 24;
const PADDING = 40;

function nodeWidth(keys: number[]): number {
  return Math.max(keys.length * KEY_WIDTH, KEY_WIDTH);
}

interface SubtreeInfo {
  width: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  rootX: number;
}

function layoutSubtree(node: TreeNode, depth: number, xOffset: number): SubtreeInfo {
  const w = nodeWidth(node.keys);
  const y = depth * LEVEL_GAP + PADDING;

  if (node.isLeaf || node.children.length === 0) {
    return {
      width: w,
      nodes: [{ id: node.id, x: xOffset, y, keys: node.keys, isLeaf: node.isLeaf, width: w, height: KEY_HEIGHT }],
      edges: [],
      rootX: xOffset + w / 2,
    };
  }

  const childInfos: SubtreeInfo[] = [];
  let currentX = xOffset;
  for (const child of node.children) {
    const info = layoutSubtree(child, depth + 1, currentX);
    childInfos.push(info);
    currentX += info.width + NODE_GAP;
  }

  const totalChildWidth = currentX - NODE_GAP - xOffset;
  const firstChildCenter = childInfos[0].rootX;
  const lastChildCenter = childInfos[childInfos.length - 1].rootX;
  const parentCenter = (firstChildCenter + lastChildCenter) / 2;
  const parentX = parentCenter - w / 2;

  const parentNode: LayoutNode = { id: node.id, x: parentX, y, keys: node.keys, isLeaf: node.isLeaf, width: w, height: KEY_HEIGHT };

  const allNodes: LayoutNode[] = [parentNode];
  const allEdges: LayoutEdge[] = [];

  for (const ci of childInfos) {
    allNodes.push(...ci.nodes);
    allEdges.push(...ci.edges);
    allEdges.push({
      fromX: parentCenter,
      fromY: y + KEY_HEIGHT,
      toX: ci.rootX,
      toY: (depth + 1) * LEVEL_GAP + PADDING,
    });
  }

  return {
    width: Math.max(w, totalChildWidth),
    nodes: allNodes,
    edges: allEdges,
    rootX: parentCenter,
  };
}

export function computeLayout(root: TreeNode | null, isBPlus: boolean): LayoutResult {
  if (!root) return { nodes: [], edges: [], leafLinks: [], width: 0, height: 0 };

  const info = layoutSubtree(root, 0, PADDING);
  const leafLinks: LayoutEdge[] = [];

  if (isBPlus) {
    const leaves = info.nodes.filter(n => n.isLeaf).sort((a, b) => a.x - b.x);
    for (let i = 0; i < leaves.length - 1; i++) {
      leafLinks.push({
        fromX: leaves[i].x + leaves[i].width,
        fromY: leaves[i].y + KEY_HEIGHT / 2,
        toX: leaves[i + 1].x,
        toY: leaves[i + 1].y + KEY_HEIGHT / 2,
      });
    }
  }

  let maxX = 0, maxY = 0;
  for (const n of info.nodes) {
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }

  return {
    nodes: info.nodes,
    edges: info.edges,
    leafLinks,
    width: maxX + PADDING,
    height: maxY + PADDING * 2,
  };
}
