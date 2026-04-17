import { useState } from 'react';
import { TreeMode } from '@/lib/tree-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, SkipForward, SkipBack, Plus, Search,
  Trash2, Shuffle, RotateCcw, ArrowRightLeft, Download, Upload, List
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ControlPanelProps {
  mode: TreeMode;
  order: number;
  isPlaying: boolean;
  speed: number;
  stepIndex: number;
  totalSteps: number;
  onOrderChange: (o: number) => void;
  onInsert: (key: number) => void;
  onSearch: (key: number) => void;
  onDelete: (key: number) => void;
  onRangeQuery: (low: number, high: number) => void;
  onRandom: (count: number) => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (s: number) => void;
  onBulkInsert: (keys: number[]) => void;
}

export function ControlPanel({
  mode, order, isPlaying, speed, stepIndex, totalSteps,
  onOrderChange, onInsert, onSearch, onDelete, onRangeQuery,
  onRandom, onReset, onTogglePlay, onStepForward, onStepBackward, onSpeedChange,
  onBulkInsert,
}: ControlPanelProps) {
  const [keyInput, setKeyInput] = useState('');
  const [rangeLow, setRangeLow] = useState('');
  const [rangeHigh, setRangeHigh] = useState('');
  const [bulkInput, setBulkInput] = useState('');

  const handleOp = (op: (key: number) => void) => {
    const val = parseInt(keyInput);
    if (!isNaN(val)) {
      if (val < 0) {
        toast({ title: 'Invalid input', description: 'Only non-negative numbers are allowed', variant: 'destructive' });
        return;
      }
      if (val >= 5000) {
        toast({ title: 'Invalid input', description: 'Numbers must be less than 5000', variant: 'destructive' });
        return;
      }
      op(val);
      setKeyInput('');
    }
  };

  const handleBulk = () => {
    const keys = bulkInput.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (keys.length > 30) {
      toast({ title: 'Limit exceeded', description: 'Maximum 30 items allowed', variant: 'destructive' });
      return;
    }
    const validKeys = keys.filter(k => k >= 0 && k < 5000);
    if (validKeys.length !== keys.length && keys.length > 0) {
      toast({ title: 'Invalid input', description: 'Some values were ignored. Only non-negative numbers < 5000 are allowed.', variant: 'destructive' });
    }
    if (validKeys.length > 0) {
      onBulkInsert(validKeys);
      setBulkInput('');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft space-y-5">
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order (degree)</Label>
        <div className="flex items-center gap-2 mt-1.5">
          {[3, 4, 5, 6, 7, 8].map(d => (
            <button
              key={d}
              onClick={() => onOrderChange(d)}
              className={`w-8 h-8 rounded-md text-sm font-mono font-medium transition-all ${d === order ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</Label>
        <div className="flex gap-1.5 mt-1.5">
          <Input
            type="number"
            placeholder="Enter key"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            className="font-mono text-sm"
            onKeyDown={e => e.key === 'Enter' && handleOp(onInsert)}
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <Button size="sm" onClick={() => handleOp(onInsert)} className="text-xs gap-1">
            <Plus className="w-3 h-3" /> Insert
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleOp(onSearch)} className="text-xs gap-1">
            <Search className="w-3 h-3" /> Search
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleOp(onDelete)} className="text-xs gap-1">
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      </div>

      {/* Bulk Input */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bulk Insert</Label>
        <div className="flex gap-1.5 mt-1.5">
          <Input
            placeholder="1, 5, 3, 8, ..."
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
            className="font-mono text-sm"
            onKeyDown={e => e.key === 'Enter' && handleBulk()}
          />
        </div>
        <Button size="sm" variant="secondary" className="w-full mt-1.5 text-xs gap-1" onClick={handleBulk}>
          <List className="w-3 h-3" /> Insert All
        </Button>
      </div>

      {mode === 'bplus' && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Range Query</Label>
          <div className="flex gap-1.5 mt-1.5">
            <Input type="number" placeholder="Low" value={rangeLow} onChange={e => setRangeLow(e.target.value)} className="font-mono text-sm" />
            <Input type="number" placeholder="High" value={rangeHigh} onChange={e => setRangeHigh(e.target.value)} className="font-mono text-sm" />
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-full mt-1.5 text-xs gap-1"
            onClick={() => {
              const l = parseInt(rangeLow), h = parseInt(rangeHigh);
              if (!isNaN(l) && !isNaN(h)) { onRangeQuery(l, h); setRangeLow(''); setRangeHigh(''); }
            }}
          >
            <ArrowRightLeft className="w-3 h-3" /> Range Query
          </Button>
        </div>
      )}

      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => onRandom(5)}>
          <Shuffle className="w-3 h-3" /> Random 5
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => onRandom(10)}>
          <Shuffle className="w-3 h-3" /> Random 10
        </Button>
      </div>



      <Button size="sm" variant="destructive" className="w-full text-xs gap-1" onClick={onReset}>
        <RotateCcw className="w-3 h-3" /> Reset Tree
      </Button>

      <div className="border-t border-border pt-4">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Playback</Label>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onStepBackward} disabled={stepIndex <= 0}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-9 w-9" onClick={onTogglePlay} disabled={totalSteps === 0}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onStepForward} disabled={stepIndex >= totalSteps - 1}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        {totalSteps > 0 && (
          <p className="text-xs text-center text-muted-foreground mt-1 font-mono">
            Step {stepIndex + 1} / {totalSteps}
          </p>
        )}
        <div className="mt-3">
          <Label className="text-xs text-muted-foreground">Speed: {speed}x</Label>
          <Slider
            min={0.25}
            max={4}
            step={0.25}
            value={[speed]}
            onValueChange={([v]) => onSpeedChange(v)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
