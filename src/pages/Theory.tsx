import { AppHeader } from '@/components/visualizer/AppHeader';
import { useState } from 'react';
import { TreeMode } from '@/lib/tree-types';

const Theory = () => {
  const [mode, setMode] = useState<TreeMode>('btree');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader mode={mode} onModeChange={setMode} />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="animate-float-in">
          <h1 className="text-3xl font-bold mb-2">B-Tree & B+ Tree Theory</h1>
          <p className="text-muted-foreground">
            A comprehensive guide to balanced multi-way search trees.
          </p>
        </div>

        {/* B-Tree Section */}
        <section className="panel p-6 space-y-4 animate-float-in">
          <h2 className="text-xl font-semibold text-primary">B-Tree</h2>
          <p className="text-sm leading-relaxed">
            A B-Tree of order <span className="font-mono font-medium">m</span> is a self-balancing search tree where
            each node can contain at most <span className="font-mono">m−1</span> keys and at most <span className="font-mono">m</span> children.
            All leaves are at the same depth. Data can be stored in both internal nodes and leaves.
          </p>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Properties</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Every node has at most <span className="font-mono">m</span> children</li>
              <li>Every non-leaf node (except root) has at least <span className="font-mono">⌈m/2⌉</span> children</li>
              <li>Root has at least 2 children (if not a leaf)</li>
              <li>All leaves appear at the same level</li>
              <li>A non-leaf node with <span className="font-mono">k</span> children has <span className="font-mono">k−1</span> keys</li>
            </ul>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Pseudocode: Insert</h3>
            <pre className="text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`BTREE-INSERT(T, k):
  r = T.root
  if r.keys.length == 2t - 1:
    s = new node
    T.root = s
    s.children[0] = r
    SPLIT-CHILD(s, 0)
    INSERT-NONFULL(s, k)
  else:
    INSERT-NONFULL(r, k)

SPLIT-CHILD(x, i):
  y = x.children[i]
  z = new node
  // Move upper half of y's keys to z
  // Promote median key to x`}
            </pre>
          </div>
        </section>

        {/* B+ Tree Section */}
        <section className="panel p-6 space-y-4 animate-float-in">
          <h2 className="text-xl font-semibold text-primary">B+ Tree</h2>
          <p className="text-sm leading-relaxed">
            A B+ Tree is a variation where <strong>all data resides in leaf nodes</strong>. Internal nodes serve only
            as routing guides. Leaf nodes are linked together for efficient range queries.
          </p>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Key Differences from B-Tree</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Data stored only in leaves</li>
              <li>Internal nodes contain only routing keys</li>
              <li>Leaf nodes are linked in a sorted linked list</li>
              <li>Supports efficient range queries via leaf traversal</li>
              <li>When splitting a leaf, the split key is <em>copied</em> up (not moved)</li>
            </ul>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Pseudocode: Range Query</h3>
            <pre className="text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`RANGE-QUERY(T, low, high):
  leaf = find leaf containing low
  results = []
  while leaf != null:
    for key in leaf.keys:
      if low <= key <= high:
        results.append(key)
      if key > high:
        return results
    leaf = leaf.next
  return results`}
            </pre>
          </div>
        </section>

        {/* Complexity Comparison */}
        <section className="panel p-6 space-y-4 animate-float-in">
          <h2 className="text-xl font-semibold text-primary">Complexity Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Operation</th>
                  <th className="text-center py-2 font-medium">B-Tree</th>
                  <th className="text-center py-2 font-medium">B+ Tree</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border/50">
                  <td className="py-2 font-sans">Search</td>
                  <td className="text-center py-2">O(log n)</td>
                  <td className="text-center py-2">O(log n)</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-sans">Insert</td>
                  <td className="text-center py-2">O(log n)</td>
                  <td className="text-center py-2">O(log n)</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-sans">Delete</td>
                  <td className="text-center py-2">O(log n)</td>
                  <td className="text-center py-2">O(log n)</td>
                </tr>
                <tr>
                  <td className="py-2 font-sans">Range Query</td>
                  <td className="text-center py-2">O(n)</td>
                  <td className="text-center py-2">O(log n + k)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Where <span className="font-mono">n</span> = total keys, <span className="font-mono">k</span> = keys in range.
            B+ Trees excel at range queries due to linked leaf nodes.
          </p>
        </section>

        {/* Use Cases */}
        <section className="panel p-6 space-y-4 animate-float-in">
          <h2 className="text-xl font-semibold text-primary">Real-World Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">B-Tree</h3>
              <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                <li>MongoDB indexes</li>
                <li>File system metadata (ext4, NTFS)</li>
                <li>In-memory databases</li>
              </ul>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">B+ Tree</h3>
              <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                <li>MySQL/PostgreSQL indexes (InnoDB)</li>
                <li>File systems (NTFS, ReiserFS, XFS)</li>
                <li>Database engines (sequential scans)</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-6">
          Tree Visualizer · Educational Tool
        </footer>
      </main>
    </div>
  );
};

export default Theory;
