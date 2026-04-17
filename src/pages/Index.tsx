import { useMemo } from 'react';
import { useTreeVisualizer } from '@/hooks/use-tree-visualizer';
import { computeLayout } from '@/lib/tree-layout';
import { AppHeader } from '@/components/visualizer/AppHeader';
import { ControlPanel } from '@/components/visualizer/ControlPanel';
import { TreeCanvas } from '@/components/visualizer/TreeCanvas';
import { ExplanationPanel } from '@/components/visualizer/ExplanationPanel';
import { MetricsPanel } from '@/components/visualizer/MetricsPanel';
import { InvariantPanel } from '@/components/visualizer/InvariantPanel';

const Index = () => {
  const viz = useTreeVisualizer();

  const treeToRender = viz.currentStep?.tree ?? null;
  const highlights = viz.currentStep?.highlights ?? {};

  const layout = useMemo(
    () => computeLayout(treeToRender, viz.mode === 'bplus'),
    [treeToRender, viz.mode]
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader mode={viz.mode} onModeChange={viz.setMode} />

      <main className="max-w-7xl mx-auto pt-6 pb-6 px-4 md:px-6 lg:px-8 space-y-6">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            <ControlPanel
              mode={viz.mode}
              order={viz.order}
              isPlaying={viz.isPlaying}
              speed={viz.speed}
              stepIndex={viz.stepIndex}
              totalSteps={viz.steps.length}
              onOrderChange={viz.setOrder}
              onInsert={viz.insert}
              onSearch={viz.search}
              onDelete={viz.deleteKey}
              onRangeQuery={viz.rangeQuery}
              onRandom={viz.randomInsert}
              onReset={viz.reset}
              onTogglePlay={viz.togglePlay}
              onStepForward={viz.stepForward}
              onStepBackward={viz.stepBackward}
              onSpeedChange={viz.setSpeed}
              onBulkInsert={viz.bulkInsert}
              onSave={viz.saveTree}
              onLoad={viz.loadTree}
            />
            {/* Adding instructions/limitations like Radix explorer */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                <li>Insert values to build the tree.</li>
                <li>Wait for animations to complete or pause to step manually.</li>
                <li>Adjust tree <strong>order (m)</strong> limits to see different split behaviors.</li>
                <li>Use Step Forward/Backward to analyze algorithm frame-by-frame.</li>
                <li>Values must be <strong>non-negative</strong> integers.</li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="space-y-3 flex-1 min-w-0">
            {/* Top metrics/invariants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MetricsPanel metrics={viz.metrics} />
              <InvariantPanel result={viz.invariants} />
            </div>

            <ExplanationPanel
              currentStep={viz.currentStep}
              stepIndex={viz.stepIndex}
              totalSteps={viz.steps.length}
            />

            <TreeCanvas layout={layout} highlights={highlights} isBPlus={viz.mode === 'bplus'} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
