import { TreeNode, Step, HighlightState, TreeKey } from './tree-types';

let bplusCounter = 0;
export function resetBPlusCounter() { bplusCounter = 0; }
function newId(): string { return `bp${bplusCounter++}`; }
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return JSON.parse(JSON.stringify(node));
}

export class BPlusTree {
  root: TreeNode | null = null;
  order: number;

  constructor(order: number) { this.order = order; }

  private maxKeys(): number { return this.order - 1; }
  private minInternalKeys(): number { return Math.ceil(this.order / 2) - 1; }
  private minLeafKeys(): number { return Math.floor(this.order / 2); }
  private nodeMinKeys(isLeaf: boolean): number { return isLeaf ? this.minLeafKeys() : this.minInternalKeys(); }

  private snap(highlights: Record<string, HighlightState>, description: string): Step {
    return { tree: cloneTree(this.root), highlights, description };
  }

  private findChildIndex(keys: TreeKey[], key: TreeKey): number {
    let i = 0;
    while (i < keys.length && (key as any) >= (keys[i] as any)) i++;
    return i;
  }

  containsKey(key: TreeKey): boolean {
    let node = this.root;
    while (node) {
      if (node.isLeaf) return node.keys.includes(key);
      let i = 0;
      while (i < node.keys.length && (key as any) >= (node.keys[i] as any)) i++;
      node = node.children[i];
    }
    return false;
  }

  insert(key: TreeKey): Step[] {
    const steps: Step[] = [];
    if (!this.root) {
      this.root = { id: newId(), keys: [key], children: [], isLeaf: true };
      steps.push(this.snap({ [this.root.id]: 'found' }, `Created root with key ${key}`));
      return steps;
    }
    if (this.containsKey(key)) {
      steps.push(this.snap({}, `Key ${key} already exists`));
      return steps;
    }
    steps.push(this.snap({ [this.root.id]: 'active' }, `B+ Insert ${key}: start at root`));
    this._insertRec(this.root, key, steps);
    if (this.root.keys.length > this.maxKeys()) {
      const oldRoot = this.root;
      const newRoot: TreeNode = { id: newId(), keys: [], children: [oldRoot], isLeaf: false };
      this._splitChild(newRoot, 0, oldRoot.isLeaf, steps);
      this.root = newRoot;
    }
    steps.push(this.snap({}, `Insertion of ${key} complete`));
    return steps;
  }

  private _insertRec(node: TreeNode, key: TreeKey, steps: Step[]): void {
    if (node.isLeaf) {
      let i = 0;
      while (i < node.keys.length && (node.keys[i] as any) < (key as any)) i++;
      node.keys.splice(i, 0, key);
      steps.push(this.snap({ [node.id]: 'found' }, `Inserted ${key} into leaf [${node.keys.join(', ')}]`));
      return;
    }
    const i = this.findChildIndex(node.keys, key);
    steps.push(this.snap({ [node.children[i].id]: 'active' }, `Descending to child [${node.children[i].keys.join(', ')}]`));
    this._insertRec(node.children[i], key, steps);
    if (node.children[i].keys.length > this.maxKeys()) {
      this._splitChild(node, i, node.children[i].isLeaf, steps);
    }
  }

  private _splitChild(parent: TreeNode, index: number, isLeaf: boolean, steps: Step[]): void {
    const child = parent.children[index];
    const mid = Math.floor(child.keys.length / 2);
    const right: TreeNode = { id: newId(), keys: [], children: [], isLeaf: child.isLeaf };

    if (isLeaf) {
      right.keys = child.keys.slice(mid);
      child.keys = child.keys.slice(0, mid);
      parent.keys.splice(index, 0, right.keys[0]);
      parent.children.splice(index + 1, 0, right);
    } else {
      const median = child.keys[mid];
      right.keys = child.keys.slice(mid + 1);
      right.children = child.children.slice(mid + 1);
      child.keys = child.keys.slice(0, mid);
      child.children = child.children.slice(0, mid + 1);
      parent.keys.splice(index, 0, median);
      parent.children.splice(index + 1, 0, right);
    }

    steps.push(this.snap(
      { [parent.id]: 'splitting', [child.id]: 'splitting', [right.id]: 'splitting' },
      `Split ${isLeaf ? 'leaf' : 'internal'}: key ${parent.keys[index]} promoted`
    ));
  }

  search(key: TreeKey): Step[] {
    const steps: Step[] = [];
    if (!this.root) { steps.push({ tree: null, highlights: {}, description: 'Tree is empty' }); return steps; }
    let node = this.root;
    while (node) {
      steps.push(this.snap({ [node.id]: 'active' }, `Searching [${node.keys.join(', ')}] for ${key}`));
      if (node.isLeaf) {
        if (node.keys.includes(key)) {
          steps.push(this.snap({ [node.id]: 'found' }, `Found ${key} in leaf!`));
        } else {
          steps.push(this.snap({}, `Key ${key} not found`));
        }
        return steps;
      }
      const i = this.findChildIndex(node.keys, key);
      node = node.children[i];
    }
    return steps;
  }

  rangeQuery(low: number, high: number): Step[] {
    const steps: Step[] = [];
    if (!this.root) { steps.push({ tree: null, highlights: {}, description: 'Tree is empty' }); return steps; }

    let node = this.root;
    while (!node.isLeaf) {
      steps.push(this.snap({ [node.id]: 'active' }, `Range [${low},${high}]: traversing`));
      const i = this.findChildIndex(node.keys, low);
      node = node.children[i];
    }

    const leaves = this._getLeaves(this.root);
    let started = false;
    const foundKeys: number[] = [];
    const rangeHighlights: Record<string, HighlightState> = {};

    for (const leaf of leaves) {
      for (const k of leaf.keys) {
        if ((k as any) >= (low as any) && (k as any) <= (high as any)) {
          started = true;
          foundKeys.push(k);
          rangeHighlights[leaf.id] = 'range';
        }
      }
      if (started && (leaf.keys[leaf.keys.length - 1] as any) > (high as any)) break;
    }

    steps.push(this.snap(rangeHighlights, `Range [${low},${high}] found: [${foundKeys.join(', ')}]`));
    return steps;
  }

  private _getLeaves(node: TreeNode): TreeNode[] {
    if (node.isLeaf) return [node];
    const leaves: TreeNode[] = [];
    for (const child of node.children) {
      leaves.push(...this._getLeaves(child));
    }
    return leaves;
  }

  delete(key: TreeKey): Step[] {
    const steps: Step[] = [];
    if (!this.root) { steps.push({ tree: null, highlights: {}, description: 'Tree is empty' }); return steps; }
    if (!this.containsKey(key)) {
      steps.push(this.snap({}, `Key ${key} not found`));
      return steps;
    }
    steps.push(this.snap({ [this.root.id]: 'active' }, `B+ Delete ${key}`));
    this._deleteFromLeaf(this.root, key, steps);
    if (!this.root.isLeaf && this.root.keys.length === 0) {
      this.root = this.root.children[0] || null;
      steps.push(this.snap(this.root ? { [this.root.id]: 'active' } : {}, 'Root shrunk'));
    }
    if (this.root && this.root.isLeaf && this.root.keys.length === 0) {
      this.root = null;
      steps.push(this.snap({}, 'Tree is now empty'));
    } else {
      steps.push(this.snap({}, `Deletion of ${key} complete`));
    }
    return steps;
  }

  private _deleteFromLeaf(node: TreeNode, key: TreeKey, steps: Step[]): void {
    if (node.isLeaf) {
      const idx = node.keys.indexOf(key);
      if (idx !== -1) {
        node.keys.splice(idx, 1);
        steps.push(this.snap({ [node.id]: 'found' }, `Removed ${key} from leaf`));
      }
      return;
    }
    let i = this.findChildIndex(node.keys, key);
    if (node.children[i]) {
      steps.push(this.snap({ [node.children[i].id]: 'active' }, `Descending to [${node.children[i].keys.join(', ')}]`));
      this._deleteFromLeaf(node.children[i], key, steps);

      if (node.children[i].keys.length < this.nodeMinKeys(node.children[i].isLeaf)) {
        this._fixBPlusChild(node, i, steps);
      }

      this._updateSeparators(node);
    }
  }

  private _fixBPlusChild(parent: TreeNode, i: number, steps: Step[]): void {
    const left = i > 0 ? parent.children[i - 1] : null;
    const right = i < parent.children.length - 1 ? parent.children[i + 1] : null;
    const child = parent.children[i];

    const reqMin = this.nodeMinKeys(child.isLeaf);
    if (left && left.keys.length > reqMin) {
      if (child.isLeaf) {
        child.keys.unshift(left.keys.pop()!);
        parent.keys[i - 1] = child.keys[0];
      } else {
        child.keys.unshift(parent.keys[i - 1]);
        parent.keys[i - 1] = left.keys.pop()!;
        if (left.children.length) child.children.unshift(left.children.pop()!);
      }
      steps.push(this.snap({ [child.id]: 'active' }, 'Borrowed from left'));
    } else if (right && right.keys.length > reqMin) {
      if (child.isLeaf) {
        child.keys.push(right.keys.shift()!);
        parent.keys[i] = right.keys[0];
      } else {
        child.keys.push(parent.keys[i]);
        parent.keys[i] = right.keys.shift()!;
        if (right.children.length) child.children.push(right.children.shift()!);
      }
      steps.push(this.snap({ [child.id]: 'active' }, 'Borrowed from right'));
    } else if (left) {
      if (child.isLeaf) {
        left.keys.push(...child.keys);
      } else {
        left.keys.push(parent.keys[i - 1], ...child.keys);
        left.children.push(...child.children);
      }
      parent.keys.splice(i - 1, 1);
      parent.children.splice(i, 1);
      steps.push(this.snap({ [left.id]: 'splitting' }, 'Merged with left sibling'));
    } else if (right) {
      if (child.isLeaf) {
        child.keys.push(...right.keys);
      } else {
        child.keys.push(parent.keys[i], ...right.keys);
        child.children.push(...right.children);
      }
      parent.keys.splice(i, 1);
      parent.children.splice(i + 1, 1);
      steps.push(this.snap({ [child.id]: 'splitting' }, 'Merged with right sibling'));
    }
  }

  private _updateSeparators(node: TreeNode): void {
    for (let i = 1; i < node.children.length; i++) {
      const leftmost = this._getLeftmostKey(node.children[i]);
      if (leftmost !== undefined) {
        node.keys[i - 1] = leftmost;
      }
    }
  }

  private _getLeftmostKey(node: TreeNode): TreeKey | undefined {
    if (node.isLeaf) return node.keys[0];
    if (node.children.length) return this._getLeftmostKey(node.children[0]);
    return undefined;
  }

  getHeight(): number {
    if (!this.root) return 0;
    let h = 1, n = this.root;
    while (!n.isLeaf) { h++; n = n.children[0]; }
    return h;
  }

  getNodeCount(): number { return this.root ? this._count(this.root) : 0; }
  private _count(n: TreeNode): number { return 1 + n.children.reduce((s, c) => s + this._count(c), 0); }

  getKeyCount(): number { return this.root ? this._countKeys(this.root) : 0; }
  private _countKeys(n: TreeNode): number {
    if (n.isLeaf) return n.keys.length;
    return n.children.reduce((s, c) => s + this._countKeys(c), 0);
  }

  clone(): BPlusTree {
    const t = new BPlusTree(this.order);
    t.root = cloneTree(this.root);
    return t;
  }
}
