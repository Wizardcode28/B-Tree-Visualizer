import { TreeMetrics } from '@/lib/tree-types';
import { BarChart3, Layers, Hash, Ruler } from 'lucide-react';

interface MetricsPanelProps {
  metrics: TreeMetrics;
}

const items = [
  { key: 'height' as const, label: 'Height', icon: Ruler, color: 'text-primary' },
  { key: 'nodeCount' as const, label: 'Nodes', icon: Layers, color: 'text-accent' },
  { key: 'keyCount' as const, label: 'Keys', icon: Hash, color: 'text-node-found' },
  { key: 'order' as const, label: 'Order', icon: BarChart3, color: 'text-node-splitting' },
];

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="panel p-4">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Metrics</span>
      <div className="grid grid-cols-4 gap-3 mt-2">
        {items.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-semibold font-mono">{metrics[key]}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Mode:</span>{' '}
          <span className="font-mono">{metrics.mode === 'btree' ? 'B-Tree' : 'B+ Tree'}</span>
          {' · '}
          <span className="font-medium">Search:</span>{' '}
          <span className="font-mono">O(log n)</span>
          {' · '}
          <span className="font-medium">Insert:</span>{' '}
          <span className="font-mono">O(log n)</span>
        </p>
      </div>
    </div>
  );
}
