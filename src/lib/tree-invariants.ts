import { TreeNode, TreeMode } from './tree-types';

export interface InvariantResult {
  valid: boolean;
  errors: string[];
}

export function checkInvariants(root: TreeNode | null, order: number, mode: TreeMode): InvariantResult {
  const errors: string[] = [];
  if (!root) return { valid: true, errors: [] };

  const maxKeys = order - 1;

  // Check all leaves at same depth
  const leafDepths: number[] = [];
  function getLeafDepths(node: TreeNode, depth: number) {
    if (node.isLeaf) {
      leafDepths.push(depth);
      return;
    }
    for (const child of node.children) {
      getLeafDepths(child, depth + 1);
    }
  }
  getLeafDepths(root, 0);
  const uniqueDepths = new Set(leafDepths);
  if (uniqueDepths.size > 1) {
    errors.push(`Leaves at different depths: ${[...uniqueDepths].join(', ')}`);
  }

  // Check node key counts and sorted order
  function checkNode(node: TreeNode, isRoot: boolean) {
    // Check sorted keys
    for (let i = 1; i < node.keys.length; i++) {
      if ((node.keys[i] as any) <= (node.keys[i - 1] as any)) {
        errors.push(`Node ${node.id}: keys not sorted [${node.keys.join(', ')}]`);
        break;
      }
    }

    // Check key count limits
    const minKeysReq = (mode === 'bplus' && node.isLeaf) ? Math.floor(order / 2) : Math.ceil(order / 2) - 1;
    if (node.keys.length > maxKeys) {
      errors.push(`Node ${node.id}: too many keys (${node.keys.length} > ${maxKeys})`);
    }
    if (!isRoot && node.keys.length < minKeysReq) {
      errors.push(`Node ${node.id}: too few keys (${node.keys.length} < ${minKeysReq})`);
    }

    // Check children count for internal nodes
    if (!node.isLeaf) {
      if (node.children.length !== node.keys.length + 1) {
        errors.push(`Node ${node.id}: children count mismatch (${node.children.length} != ${node.keys.length + 1})`);
      }
      for (const child of node.children) {
        checkNode(child, false);
      }
    }

    // B+ tree: internal nodes should not be leaves if they have children
    if (mode === 'bplus' && !node.isLeaf && node.children.length === 0) {
      errors.push(`Node ${node.id}: internal node has no children`);
    }
  }

  checkNode(root, true);

  return { valid: errors.length === 0, errors };
}
