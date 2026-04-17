import { useMemo } from 'react';
import { useTreeVisualizer } from '@/hooks/use-tree-visualizer';
import { computeLayout } from '@/lib/tree-layout';
import { AppHeader } from '@/components/visualizer/AppHeader';
import { ControlPanel } from '@/components/visualizer/ControlPanel';
import { TreeCanvas } from '@/components/visualizer/TreeCanvas';
import { ExplanationPanel } from '@/components/visualizer/ExplanationPanel';
import { MetricsPanel } from '@/components/visualizer/MetricsPanel';

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

      <main className="max-w-screen-xl mx-auto pt-6 pb-6 px-3 lg:px-4 space-y-6">
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
              <h3 className="text-sm font-medium mb-2">Quick Guide</h3>
              <ul className="text-xs space-y-1 text-muted-foreground list-none">
                <li>• Enter numbers or strings separated by commas</li>
                <li>• Maximum 30 items allowed</li>
                <li>• Numbers must be less than 5000</li>
                <li>• Only non-negative numbers are allowed</li>
                <li>• Strings/characters must be 15 chars or less</li>
                <li>• Use "Insert" or "Insert All" to begin visualization</li>
                <li>• Play button animates through all steps</li>
                <li>• Adjust speed slider for faster/slower animation</li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="space-y-3 flex-1 min-w-0">
            {/* Top metrics */}
            <div className="mb-3">
              <MetricsPanel metrics={viz.metrics} />
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
