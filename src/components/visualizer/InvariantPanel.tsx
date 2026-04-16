import { InvariantResult } from '@/lib/tree-invariants';
import { CheckCircle2, XCircle } from 'lucide-react';

interface InvariantPanelProps {
  result: InvariantResult;
}

export function InvariantPanel({ result }: InvariantPanelProps) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-2">
        {result.valid ? (
          <CheckCircle2 className="w-4 h-4 text-node-found" />
        ) : (
          <XCircle className="w-4 h-4 text-destructive" />
        )}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Invariant Check
        </span>
        <span className={`ml-auto text-xs font-semibold ${result.valid ? 'text-node-found' : 'text-destructive'}`}>
          {result.valid ? 'VALID' : 'ERROR'}
        </span>
      </div>
      {!result.valid && (
        <ul className="text-xs text-destructive space-y-0.5 mt-1">
          {result.errors.map((err, i) => (
            <li key={i}>• {err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
