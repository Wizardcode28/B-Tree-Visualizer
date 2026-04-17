const fs = require('fs');

const btreePath = 'src/lib/btree.ts';
let btree = fs.readFileSync(btreePath, 'utf8');
btree = btree.replace(/import \{ ([^}]+) \} from '\.\/tree-types';/, "import { $1, TreeKey } from './tree-types';");
btree = btree.replace(/keys: number\[\]/g, 'keys: TreeKey[]');
btree = btree.replace(/key: number/g, 'key: TreeKey');
btree = btree.replace(/: number \{/g, (m) => {
  // Only replace for _max and _min
  return m;
});
btree = btree.replace(/_max\(node: TreeNode\): number/g, '_max(node: TreeNode): TreeKey');
btree = btree.replace(/_min\(node: TreeNode\): number/g, '_min(node: TreeNode): TreeKey');
btree = btree.replace(/key > keys\[i\]/g, '(key as any) > (keys[i] as any)');
btree = btree.replace(/keys\[i\] < key/g, '(keys[i] as any) < (key as any)');
fs.writeFileSync(btreePath, btree);

const bplusPath = 'src/lib/bplus-tree.ts';
let bplus = fs.readFileSync(bplusPath, 'utf8');
bplus = bplus.replace(/import \{ ([^}]+) \} from '\.\/tree-types';/, "import { $1, TreeKey } from './tree-types';");
bplus = bplus.replace(/keys: number\[\]/g, 'keys: TreeKey[]');
bplus = bplus.replace(/key: number/g, 'key: TreeKey');
bplus = bplus.replace(/_getLeftmostKey\(node: TreeNode\): number \| undefined/g, '_getLeftmostKey(node: TreeNode): TreeKey | undefined');
bplus = bplus.replace(/key >= keys\[i\]/g, '(key as any) >= (keys[i] as any)');
bplus = bplus.replace(/key >= node\.keys\[i\]/g, '(key as any) >= (node.keys[i] as any)');
bplus = bplus.replace(/node\.keys\[i\] < key/g, '(node.keys[i] as any) < (key as any)');
bplus = bplus.replace(/k >= low && k <= high/g, '(k as any) >= (low as any) && (k as any) <= (high as any)');
bplus = bplus.replace(/leaf\.keys\[leaf\.keys\.length - 1\] > high/g, '(leaf.keys[leaf.keys.length - 1] as any) > (high as any)');
fs.writeFileSync(bplusPath, bplus);

const hookPath = 'src/hooks/use-tree-visualizer.ts';
let hook = fs.readFileSync(hookPath, 'utf8');
hook = hook.replace(/import \{ ([^}]+) \} from '@\/lib\/tree-types';/, "import { $1, TreeKey } from '@/lib/tree-types';");
hook = hook.replace(/key: number/g, 'key: TreeKey');
hook = hook.replace(/keys: number\[\]/g, 'keys: TreeKey[]');
// Range query is tricky, it expects numbers. B+ trees range query usually works strings too, but the UI component uses type="number".
hook = hook.replace(/low: number, high: number/g, 'low: TreeKey, high: TreeKey');
fs.writeFileSync(hookPath, hook);

const invPath = 'src/lib/tree-invariants.ts';
let inv = fs.readFileSync(invPath, 'utf8');
inv = inv.replace(/node\.keys\[i\] <= node\.keys\[i - 1\]/g, '(node.keys[i] as any) <= (node.keys[i - 1] as any)');
fs.writeFileSync(invPath, inv);

const cPanelPath = 'src/components/visualizer/ControlPanel.tsx';
let cPanel = fs.readFileSync(cPanelPath, 'utf8');
cPanel = cPanel.replace(/import \{ ([^}]+) \} from '@\/lib\/tree-types';/, "import { $1, TreeKey } from '@/lib/tree-types';");
cPanel = cPanel.replace(/key: number/g, 'key: TreeKey');
cPanel = cPanel.replace(/keys: number\[\]/g, 'keys: TreeKey[]');
cPanel = cPanel.replace(/low: number, high: number/g, 'low: TreeKey, high: TreeKey');
// Remove integer constraints and allow string limit checking correctly
cPanel = cPanel.replace(/type="number"/g, 'type="text"');
cPanel = cPanel.replace(/const val = parseInt\(keyInput\);/g, 'const val = isNaN(Number(keyInput)) ? keyInput.trim() : Number(keyInput);');
cPanel = cPanel.replace(/if \(!isNaN\(val\)\) \{/g, 'if (val !== "") {');
cPanel = cPanel.replace(/const keys = bulkInput\.split\(\/\[,\\s\]\+\/\)\.map\(s => parseInt\(s\.trim\(\)\)\)\.filter\(n => !isNaN\(n\)\);/g, 'const keys = bulkInput.split(/[,\\s]+/).map(s => s.trim()).filter(s => s !== "").map(s => isNaN(Number(s)) ? s : Number(s));');
cPanel = cPanel.replace(/const validKeys = keys\.filter\(k => k >= 0 && k < 5000\);/g, 'const validKeys = keys.filter(k => typeof k === "string" ? k.length <= 15 : (k >= 0 && k < 5000));');
// The handleOp check
cPanel = cPanel.replace(/if \(val < 0\) \{/g, 'if (typeof val === "number" && val < 0) {');
cPanel = cPanel.replace(/if \(val >= 5000\) \{/g, 'if (typeof val === "number" && val >= 5000) {');
// Add string specific checks to handleOp
cPanel = cPanel.replace(/if \(typeof val === "number" && val >= 5000\) \{([\s\S]*?)return;/g, 
`if (typeof val === "number" && val >= 5000) {
        toast({ title: 'Invalid input', description: 'Numbers must be less than 5000', variant: 'destructive' });
        return;
      }
      if (typeof val === "string" && val.length > 15) {
        toast({ title: 'Invalid input', description: 'Strings must be 15 characters or less', variant: 'destructive' });
        return;`);
fs.writeFileSync(cPanelPath, cPanel);

console.log("Done");
