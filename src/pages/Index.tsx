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
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader mode={viz.mode} onModeChange={viz.setMode} />

      <div className="flex flex-1 overflow-hidden">
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

        <div className="flex-1 flex flex-col gap-3 p-3 overflow-hidden">
          <TreeCanvas layout={layout} highlights={highlights} isBPlus={viz.mode === 'bplus'} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ExplanationPanel
              currentStep={viz.currentStep}
              stepIndex={viz.stepIndex}
              totalSteps={viz.steps.length}
            />
            <MetricsPanel metrics={viz.metrics} />
            <InvariantPanel result={viz.invariants} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
