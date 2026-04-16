import { Step } from '@/lib/tree-types';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface ExplanationPanelProps {
  currentStep: Step | null;
  stepIndex: number;
  totalSteps: number;
}

export function ExplanationPanel({ currentStep, stepIndex, totalSteps }: ExplanationPanelProps) {
  return (
    <div className="panel p-4 min-h-[80px]">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Explanation</span>
      </div>
      <AnimatePresence mode="wait">
        {currentStep ? (
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-sm leading-relaxed"
          >
            {currentStep.description}
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground">Perform an operation to see step-by-step explanations.</p>
        )}
      </AnimatePresence>
      {totalSteps > 0 && (
        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </div>
  );
}
