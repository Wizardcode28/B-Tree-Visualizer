import { TreeNode, Step, HighlightState } from './tree-types';

let nodeCounter = 0;
export function resetNodeCounter() { nodeCounter = 0; }
function newId(): string { return `n${nodeCounter++}`; }
function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return JSON.parse(JSON.stringify(node));
}

export class BTree {
  root: TreeNode | null = null;
  order: number;

  constructor(order: number) {
    this.order = order;
  }

  private maxKeys(): number { return this.order - 1; }
  private minKeys(): number { return Math.ceil(this.order / 2) - 1; }

  private snap(highlights: Record<string, HighlightState>, description: string): Step {
    return { tree: cloneTree(this.root), highlights, description };
  }

  private findChildIndex(keys: number[], key: number): number {
    let i = 0;
    while (i < keys.length && key > keys[i]) i++;
    return i;
  }

  private insertSorted(keys: number[], key: number): number {
    let i = 0;
    while (i < keys.length && keys[i] < key) i++;
    keys.splice(i, 0, key);
    return i;
  }

  containsKey(node: TreeNode | null, key: number): boolean {
    if (!node) return false;
    if (node.keys.includes(key)) return true;
    if (node.isLeaf) return false;
    return this.containsKey(node.children[this.findChildIndex(node.keys, key)], key);
  }

  insert(key: number): Step[] {
    const steps: Step[] = [];
    if (!this.root) {
      this.root = { id: newId(), keys: [key], children: [], isLeaf: true };
      steps.push(this.snap({ [this.root.id]: 'found' }, `Created root with key ${key}`));
      return steps;
    }
    if (this.containsKey(this.root, key)) {
      steps.push(this.snap({}, `Key ${key} already exists`));
      return steps;
    }
    steps.push(this.snap({ [this.root.id]: 'active' }, `Inserting ${key}: start at root`));
    this._insertRec(this.root, key, steps);
    if (this.root.keys.length > this.maxKeys()) {
      const oldRoot = this.root;
      const newRoot: TreeNode = { id: newId(), keys: [], children: [oldRoot], isLeaf: false };
      this._splitChild(newRoot, 0, steps);
      this.root = newRoot;
    }
    steps.push(this.snap({}, `Insertion of ${key} complete`));
    return steps;
  }

  private _insertRec(node: TreeNode, key: number, steps: Step[]): void {
    if (node.isLeaf) {
      this.insertSorted(node.keys, key);
      steps.push(this.snap({ [node.id]: 'found' }, `Inserted ${key} into leaf [${node.keys.join(', ')}]`));
      return;
    }
    const i = this.findChildIndex(node.keys, key);
    steps.push(this.snap({ [node.children[i].id]: 'active' }, `Descending to child [${node.children[i].keys.join(', ')}]`));
    this._insertRec(node.children[i], key, steps);
    if (node.children[i].keys.length > this.maxKeys()) {
      this._splitChild(node, i, steps);
    }
  }

  private _splitChild(parent: TreeNode, index: number, steps: Step[]): void {
    const child = parent.children[index];
    const mid = Math.floor(child.keys.length / 2);
    const median = child.keys[mid];
    const right: TreeNode = {
      id: newId(),
      keys: child.keys.slice(mid + 1),
      children: child.isLeaf ? [] : child.children.slice(mid + 1),
      isLeaf: child.isLeaf,
    };
    child.keys = child.keys.slice(0, mid);
    if (!child.isLeaf) child.children = child.children.slice(0, mid + 1);
    parent.keys.splice(index, 0, median);
    parent.children.splice(index + 1, 0, right);
    steps.push(this.snap(
      { [parent.id]: 'splitting', [child.id]: 'splitting', [right.id]: 'splitting' },
      `Split: median ${median} promoted up → left [${child.keys.join(', ')}] right [${right.keys.join(', ')}]`
    ));
  }

  search(key: number): Step[] {
    const steps: Step[] = [];
    if (!this.root) { steps.push({ tree: null, highlights: {}, description: 'Tree is empty' }); return steps; }
    this._searchRec(this.root, key, steps);
    return steps;
  }

  private _searchRec(node: TreeNode, key: number, steps: Step[]): void {
    steps.push(this.snap({ [node.id]: 'active' }, `Searching [${node.keys.join(', ')}] for ${key}`));
    if (node.keys.includes(key)) {
      steps.push(this.snap({ [node.id]: 'found' }, `Found ${key}!`));
      return;
    }
    if (node.isLeaf) {
      steps.push(this.snap({}, `Key ${key} not found`));
      return;
    }
    const i = this.findChildIndex(node.keys, key);
    this._searchRec(node.children[i], key, steps);
  }

  delete(key: number): Step[] {
    const steps: Step[] = [];
    if (!this.root) { steps.push({ tree: null, highlights: {}, description: 'Tree is empty' }); return steps; }
    steps.push(this.snap({ [this.root.id]: 'active' }, `Deleting ${key}`));
    this._deleteRec(this.root, key, steps);
    if (this.root.keys.length === 0) {
      this.root = this.root.isLeaf ? null : (this.root.children[0] || null);
      steps.push(this.snap(this.root ? { [this.root.id]: 'active' } : {}, this.root ? 'Root shrunk' : 'Tree is now empty'));
    } else {
      steps.push(this.snap({}, `Deletion of ${key} complete`));
    }
    return steps;
  }

  private _deleteRec(node: TreeNode, key: number, steps: Step[]): void {
    const idx = node.keys.indexOf(key);
    if (idx !== -1) {
      if (node.isLeaf) {
        node.keys.splice(idx, 1);
        steps.push(this.snap({ [node.id]: 'found' }, `Removed ${key} from leaf`));
      } else {
        const left = node.children[idx];
        const right = node.children[idx + 1];
        if (left.keys.length > this.minKeys()) {
          const pred = this._max(left);
          node.keys[idx] = pred;
          steps.push(this.snap({ [node.id]: 'active' }, `Replaced ${key} with predecessor ${pred}`));
          this._deleteRec(left, pred, steps);
        } else if (right.keys.length > this.minKeys()) {
          const succ = this._min(right);
          node.keys[idx] = succ;
          steps.push(this.snap({ [node.id]: 'active' }, `Replaced ${key} with successor ${succ}`));
          this._deleteRec(right, succ, steps);
        } else {
          this._merge(node, idx, steps);
          this._deleteRec(node.children[idx], key, steps);
        }
      }
    } else {
      if (node.isLeaf) { steps.push(this.snap({}, `Key ${key} not found`)); return; }
      let i = this.findChildIndex(node.keys, key);
      if (node.children[i].keys.length <= this.minKeys()) {
        this._fixChild(node, i, steps);
        i = this.findChildIndex(node.keys, key);
      }
      if (i < node.children.length) {
        steps.push(this.snap({ [node.children[i].id]: 'active' }, `Descending to [${node.children[i].keys.join(', ')}]`));
        this._deleteRec(node.children[i], key, steps);
      }
    }
  }

  private _fixChild(parent: TreeNode, i: number, steps: Step[]): void {
    const left = i > 0 ? parent.children[i - 1] : null;
    const right = i < parent.children.length - 1 ? parent.children[i + 1] : null;
    if (left && left.keys.length > this.minKeys()) {
      const child = parent.children[i];
      child.keys.unshift(parent.keys[i - 1]);
      parent.keys[i - 1] = left.keys.pop()!;
      if (!left.isLeaf) child.children.unshift(left.children.pop()!);
      steps.push(this.snap({ [child.id]: 'active', [left.id]: 'active' }, 'Borrowed from left sibling'));
    } else if (right && right.keys.length > this.minKeys()) {
      const child = parent.children[i];
      child.keys.push(parent.keys[i]);
      parent.keys[i] = right.keys.shift()!;
      if (!right.isLeaf) child.children.push(right.children.shift()!);
      steps.push(this.snap({ [child.id]: 'active', [right.id]: 'active' }, 'Borrowed from right sibling'));
    } else if (left) {
      this._merge(parent, i - 1, steps);
    } else {
      this._merge(parent, i, steps);
    }
  }

  private _merge(parent: TreeNode, i: number, steps: Step[]): void {
    const left = parent.children[i];
    const right = parent.children[i + 1];
    left.keys.push(parent.keys[i], ...right.keys);
    left.children.push(...right.children);
    parent.keys.splice(i, 1);
    parent.children.splice(i + 1, 1);
    steps.push(this.snap({ [left.id]: 'splitting' }, `Merged nodes → [${left.keys.join(', ')}]`));
  }

  private _max(node: TreeNode): number {
    while (!node.isLeaf) node = node.children[node.children.length - 1];
    return node.keys[node.keys.length - 1];
  }

  private _min(node: TreeNode): number {
    while (!node.isLeaf) node = node.children[0];
    return node.keys[0];
  }

  getHeight(): number {
    if (!this.root) return 0;
    let h = 1, n = this.root;
    while (!n.isLeaf) { h++; n = n.children[0]; }
    return h;
  }

  getNodeCount(): number { return this.root ? this._countNodes(this.root) : 0; }
  private _countNodes(n: TreeNode): number { return 1 + n.children.reduce((s, c) => s + this._countNodes(c), 0); }

  getKeyCount(): number { return this.root ? this._countKeys(this.root) : 0; }
  private _countKeys(n: TreeNode): number { return n.keys.length + n.children.reduce((s, c) => s + this._countKeys(c), 0); }

  clone(): BTree {
    const t = new BTree(this.order);
    t.root = cloneTree(this.root);
    return t;
  }
}
