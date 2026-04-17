import { AppHeader } from '@/components/visualizer/AppHeader';
import { useState } from 'react';
import { TreeMode } from '@/lib/tree-types';

const Theory = () => {
  const [mode, setMode] = useState<TreeMode>('btree');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader mode={mode} onModeChange={setMode} />

      <main className="flex-1 max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-12">
        <div className="animate-float-in text-center space-y-3 pb-8 border-b border-border">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">B-Tree & B+ Tree Theory</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The ultimate guide to balanced multi-way search trees. Learn the fundamental properties, 
            insertion rules, deletion strategies, and differences. 
          </p>
        </div>

        {/* What is a B-Tree */}
        <section className="space-y-6 animate-float-in">
          <div>
            <h2 className="text-2xl font-bold text-foreground">1. What is a B-Tree?</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              A B-Tree of order <span className="font-mono text-primary font-medium">m</span> is a self-balancing search tree in which nodes can have more than two children. They are heavily optimized for systems that read and write large blocks of data, which is why databases and file systems fundamentally rely on them.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Core Structural Rules</h3>
            <ul className="text-sm space-y-3 list-disc list-outside ml-4 text-muted-foreground">
              <li><strong>Node Capacity:</strong> Every node can contain at most <span className="font-mono">m - 1</span> keys.</li>
              <li><strong>Minimum Keys:</strong> Every non-root node must contain at least <span className="font-mono">⌈m/2⌉ - 1</span> keys.</li>
              <li><strong>Children Limits:</strong> Every internal node has exactly one more child than it has keys (i.e. up to <span className="font-mono">m</span> children).</li>
              <li><strong>Perfect Balance:</strong> All leaf nodes MUST appear at the exact same depth level.</li>
              <li><strong>Sorted Order:</strong> Keys inside each node are strictly sorted in ascending order.</li>
            </ul>
          </div>
        </section>

        {/* Insertion Rules */}
        <section className="space-y-6 animate-float-in">
          <div>
            <h2 className="text-2xl font-bold text-foreground">2. Rules of Insertion</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              Inserting into a B-Tree always begins unconditionally at the <strong>leaf level</strong>. The challenge arises when a node becomes too full (overflow).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">Step-by-Step Procedure</h3>
              <ul className="text-sm space-y-3 list-decimal list-outside ml-4 text-muted-foreground">
                <li>Traverse down the tree to find the correct leaf node for the new key.</li>
                <li>Insert the key into the sorted array of the leaf node.</li>
                <li>If the leaf's key count strictly exceeds <span className="font-mono">m - 1</span>, an <strong>Overflow</strong> occurs.</li>
                <li>Handle the overflow via an operation called <strong>Splitting</strong>.</li>
              </ul>
            </div>
            <div className="bg-muted rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Node Splitting (Overflow Handling)</h3>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li>When a node overflows (has <span className="font-mono">m</span> keys), it splits into two separate nodes.</li>
                <li>The <strong>left node</strong> takes the first <span className="font-mono">⌈m/2⌉ - 1</span> keys.</li>
                <li>The <strong>right node</strong> takes the remaining keys on the right.</li>
                <li>The precise <strong>median key</strong> is pushed (promoted) upwards to its parent node.</li>
                <li>If the parent experiences an overflow after promotion, the process cascades back upwards. If the root splits, a new root is created, increasing the tree height.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Deletion Rules */}
        <section className="space-y-6 animate-float-in">
          <div>
            <h2 className="text-2xl font-bold text-foreground">3. Rules of Deletion</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              Deletion is famously the most complex B-Tree operation. A node can "underflow" if deleting a key leaves it below the minimum required keys (<span className="font-mono">⌈m/2⌉ - 1</span>).
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground">A) Deleting from a Leaf Node</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the target is in a leaf, remove it. If the leaf underflows, we must fix it using one of two strategies:
            </p>
            <div className="pl-4 space-y-3 border-l-2 border-primary/30 py-2">
              <div>
                <strong className="text-sm font-semibold">1. Borrowing from a Sibling (Redistribution):</strong>
                <p className="text-sm text-muted-foreground mt-1">If the immediate left or right sibling has "extra keys" (more than the minimum), we rotate a key. The sibling gives a key to the parent, and the parent drops its corresponding separating key down into our underflowed node.</p>
              </div>
              <div>
                <strong className="text-sm font-semibold">2. Merging (Combining):</strong>
                <p className="text-sm text-muted-foreground mt-1">If both immediate siblings are exactly at structural minimum capacity, they cannot spare a key. We merge our underflowed node with one of the siblings, dragging the separating parent key down into the newly merged node. (This may cause the parent to underflow, cascading the effect upwards!)</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground">B) Deleting from an Internal Node</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the target key exists in an internal node, we cannot simply delete it as it acts as a router for its children.
            </p>
            <ul className="text-sm space-y-2 list-disc list-outside ml-4 text-muted-foreground">
              <li>Find the key's <strong>in-order predecessor</strong> (the largest key in the left-child's subtree) OR <strong>in-order successor</strong> (the smallest key in the right-child's subtree).</li>
              <li>Replace the target key with this predecessor/successor.</li>
              <li>Now, delete that predecessor/successor from its original leaf node (this routes us back to scenario A).</li>
            </ul>
          </div>
        </section>

        {/* B+ Tree vs B-Tree */}
        <section className="space-y-6 animate-float-in border-t border-border pt-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">4. B+ Trees Overview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              A B+ Tree is a widely used variation where <strong>all actual data records reside at the leaf level</strong>. The internal nodes strictly store "routing keys" used solely for navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">Key Differences</h3>
              <ul className="text-sm space-y-3 list-disc list-outside ml-4 text-muted-foreground">
                <li>Internal nodes only function as street signs; they just point the way.</li>
                <li>All leaves are linked together sequentially like a Linked List.</li>
                <li><strong>Range queries are trivial:</strong> Find the starting element in <span className="font-mono">O(log n)</span>, then just walk the leaf linked-list left-to-right!</li>
              </ul>
            </div>
            <div className="bg-muted rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-3">B+ Splitting Difference</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                When a B+ Tree leaf node overflows, the median key is copied upward rather than strictly moving. This ensures the key still exists in the leaf level. If an internal routing node splits, it behaves exactly like a traditional B-Tree split.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="space-y-6 animate-float-in">
          <h2 className="text-2xl font-bold text-foreground">5. Cheat Sheet / Comparisons</h2>
          <div className="overflow-x-auto bg-card rounded-xl border border-border shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold text-foreground">Property</th>
                  <th className="py-3 px-4 font-semibold text-foreground border-l border-border">B-Tree</th>
                  <th className="py-3 px-4 font-semibold text-foreground border-l border-border">B+ Tree</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground divide-y divide-border">
                <tr>
                  <td className="py-3 px-4 font-medium text-foreground">Data Storage</td>
                  <td className="py-3 px-4 border-l border-border">Internal nodes & Leaves</td>
                  <td className="py-3 px-4 border-l border-border">Leaves only</td>
                </tr>
                <tr className="bg-muted/10">
                  <td className="py-3 px-4 font-medium text-foreground">Search Speed</td>
                  <td className="py-3 px-4 border-l border-border">Faster if found at root/internal</td>
                  <td className="py-3 px-4 border-l border-border">Consistent to leaves <code>O(log n)</code></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-foreground">Range Queries</td>
                  <td className="py-3 px-4 border-l border-border">Expensive (requires tree traversal)</td>
                  <td className="py-3 px-4 border-l border-border">Extremely fast (Linked leaves)</td>
                </tr>
                <tr className="bg-muted/10">
                  <td className="py-3 px-4 font-medium text-foreground">Real-World Examples</td>
                  <td className="py-3 px-4 border-l border-border">MongoDB, File Metadata</td>
                  <td className="py-3 px-4 border-l border-border">MySQL (InnoDB), NTFS filesystem</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-8">
          End of Theory Module · Interactive Educational Tooling
        </footer>
      </main>
    </div>
  );
};

export default Theory;
