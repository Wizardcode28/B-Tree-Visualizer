import { useState, useCallback, useRef, useEffect } from 'react';
import { BTree, resetNodeCounter } from '@/lib/btree';
import { BPlusTree, resetBPlusCounter } from '@/lib/bplus-tree';
import { TreeMode, Step, TreeMetrics } from '@/lib/tree-types';
import { checkInvariants, InvariantResult } from '@/lib/tree-invariants';
import { toast } from '@/hooks/use-toast';

export function useTreeVisualizer() {
  const [mode, setMode] = useState<TreeMode>('btree');
  const [order, setOrder] = useState(4);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const btreeRef = useRef<BTree>(new BTree(4));
  const bplusRef = useRef<BPlusTree>(new BPlusTree(4));
  const playIntervalRef = useRef<number | null>(null);

  const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;

  const getTree = useCallback(() => mode === 'btree' ? btreeRef.current : bplusRef.current, [mode]);

  const reset = useCallback(() => {
    resetNodeCounter();
    resetBPlusCounter();
    btreeRef.current = new BTree(order);
    bplusRef.current = new BPlusTree(order);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
  }, [order]);

  const changeMode = useCallback((m: TreeMode) => {
    setMode(m);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
  }, []);

  const changeOrder = useCallback((o: number) => {
    setOrder(o);
    resetNodeCounter();
    resetBPlusCounter();
    btreeRef.current = new BTree(o);
    bplusRef.current = new BPlusTree(o);
    setSteps([]);
    setStepIndex(-1);
  }, []);

  const runSteps = useCallback((newSteps: Step[]) => {
    if (newSteps.length === 0) return;
    setSteps(newSteps);
    setStepIndex(0);
    setIsPlaying(true);
  }, []);

  const insert = useCallback((key: number) => {
    const tree = getTree();
    const s = mode === 'btree' ? (tree as BTree).insert(key) : (tree as BPlusTree).insert(key);
    runSteps(s);
  }, [mode, getTree, runSteps]);

  const search = useCallback((key: number) => {
    const tree = getTree();
    const s = mode === 'btree' ? (tree as BTree).search(key) : (tree as BPlusTree).search(key);
    runSteps(s);
  }, [mode, getTree, runSteps]);

  const deleteKey = useCallback((key: number) => {
    const tree = getTree();
    const s = mode === 'btree' ? (tree as BTree).delete(key) : (tree as BPlusTree).delete(key);
    runSteps(s);
  }, [mode, getTree, runSteps]);

  const rangeQuery = useCallback((low: number, high: number) => {
    if (mode !== 'bplus') return;
    const s = (bplusRef.current).rangeQuery(low, high);
    runSteps(s);
  }, [mode, runSteps]);

  const randomInsert = useCallback((count: number) => {
    const tree = getTree();
    const allSteps: Step[] = [];
    for (let i = 0; i < count; i++) {
      const key = Math.floor(Math.random() * 999) + 1;
      const s = mode === 'btree' ? (tree as BTree).insert(key) : (tree as BPlusTree).insert(key);
      allSteps.push(...s);
    }
    runSteps(allSteps);
  }, [mode, getTree, runSteps]);

  const bulkInsert = useCallback((keys: number[]) => {
    const tree = getTree();
    const allSteps: Step[] = [];
    for (const key of keys) {
      const s = mode === 'btree' ? (tree as BTree).insert(key) : (tree as BPlusTree).insert(key);
      allSteps.push(...s);
    }
    runSteps(allSteps);
  }, [mode, getTree, runSteps]);

  const saveTree = useCallback(() => {
    const tree = getTree();
    const data = {
      mode,
      order,
      root: mode === 'btree' ? btreeRef.current.root : bplusRef.current.root,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-order${order}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Tree saved', description: `Downloaded ${mode}-order${order}.json` });
  }, [mode, order, getTree]);

  const loadTree = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.mode && data.order && data.root) {
            setMode(data.mode);
            setOrder(data.order);
            if (data.mode === 'btree') {
              btreeRef.current = new BTree(data.order);
              btreeRef.current.root = data.root;
            } else {
              bplusRef.current = new BPlusTree(data.order);
              bplusRef.current.root = data.root;
            }
            setSteps([]);
            setStepIndex(-1);
            toast({ title: 'Tree loaded', description: `Loaded ${data.mode} of order ${data.order}` });
          }
        } catch {
          toast({ title: 'Error', description: 'Invalid JSON file', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Playback
  useEffect(() => {
    if (isPlaying && stepIndex < steps.length - 1) {
      playIntervalRef.current = window.setTimeout(() => {
        setStepIndex(i => i + 1);
      }, 600 / speed);
      return () => { if (playIntervalRef.current) clearTimeout(playIntervalRef.current); };
    } else if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, stepIndex, steps.length, speed]);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(i => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(i => Math.max(i - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(p => !p);
    }
  }, [stepIndex, steps.length]);

  const metrics: TreeMetrics = {
    height: mode === 'btree' ? btreeRef.current.getHeight() : bplusRef.current.getHeight(),
    nodeCount: mode === 'btree' ? btreeRef.current.getNodeCount() : bplusRef.current.getNodeCount(),
    keyCount: mode === 'btree' ? btreeRef.current.getKeyCount() : bplusRef.current.getKeyCount(),
    order,
    mode,
  };

  const treeRoot = mode === 'btree' ? btreeRef.current.root : bplusRef.current.root;
  const invariants: InvariantResult = checkInvariants(treeRoot, order, mode);

  return {
    mode, order, steps, stepIndex, currentStep, isPlaying, speed, metrics, invariants,
    setMode: changeMode, setOrder: changeOrder, setSpeed,
    insert, search, deleteKey, rangeQuery, randomInsert, bulkInsert, reset,
    stepForward, stepBackward, togglePlay,
    saveTree, loadTree,
  };
}
