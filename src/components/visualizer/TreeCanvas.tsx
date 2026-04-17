import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HighlightState, LayoutResult, LayoutNode, LayoutEdge } from '@/lib/tree-types';

interface TreeCanvasProps {
  layout: LayoutResult;
  highlights: Record<string, HighlightState>;
  isBPlus: boolean;
}

const NODE_COLORS: Record<HighlightState, { fill: string; stroke: string; text: string }> = {
  default: { fill: 'hsl(var(--node-default))', stroke: 'hsl(var(--node-default-border))', text: 'hsl(var(--foreground))' },
  active: { fill: 'hsl(var(--node-active))', stroke: 'hsl(var(--node-active-border))', text: 'hsl(var(--primary-foreground))' },
  found: { fill: 'hsl(var(--node-found))', stroke: 'hsl(var(--node-found-border))', text: 'hsl(var(--primary-foreground))' },
  splitting: { fill: 'hsl(var(--node-splitting))', stroke: 'hsl(var(--node-splitting-border))', text: 'hsl(var(--primary-foreground))' },
  range: { fill: 'hsl(var(--node-range))', stroke: 'hsl(var(--node-range-border))', text: 'hsl(var(--primary-foreground))' },
};

const KEY_WIDTH = 48;

function NodeRect({ node, highlight }: { node: LayoutNode; highlight: HighlightState }) {
  const colors = NODE_COLORS[highlight];
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={6}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={2}
      />
      {node.keys.map((key, i) => (
        <g key={i}>
          {i > 0 && (
            <line
              x1={node.x + i * KEY_WIDTH}
              y1={node.y + 4}
              x2={node.x + i * KEY_WIDTH}
              y2={node.y + node.height - 4}
              stroke={colors.stroke}
              strokeWidth={1}
              opacity={0.5}
            />
          )}
          <text
            x={node.x + i * KEY_WIDTH + KEY_WIDTH / 2}
            y={node.y + node.height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={13}
            fontFamily="'JetBrains Mono', monospace"
            fontWeight={500}
          >
            {key}
          </text>
        </g>
      ))}
    </motion.g>
  );
}

function Edge({ edge }: { edge: LayoutEdge }) {
  return (
    <motion.line
      x1={edge.fromX}
      y1={edge.fromY}
      x2={edge.toX}
      y2={edge.toY}
      stroke="hsl(var(--border))"
      strokeWidth={1.5}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

function LeafLink({ edge }: { edge: LayoutEdge }) {
  const midY = edge.fromY;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <line
        x1={edge.fromX + 2}
        y1={midY}
        x2={edge.toX - 2}
        y2={midY}
        stroke="hsl(var(--accent))"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <polygon
        points={`${edge.toX - 2},${midY} ${edge.toX - 8},${midY - 3} ${edge.toX - 8},${midY + 3}`}
        fill="hsl(var(--accent))"
      />
    </motion.g>
  );
}

export function TreeCanvas({ layout, highlights, isBPlus }: TreeCanvasProps) {
  if (layout.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-muted-foreground bg-card rounded-xl border border-border">
        <div className="text-center animate-float-in">
          <div className="text-4xl mb-3 opacity-30">🌳</div>
          <p className="text-sm">Insert a key to begin</p>
        </div>
      </div>
    );
  }

  // Calculate the required dimensions to fit the tree with some padding
  const svgWidth = Math.max(layout.width + 40, 600);
  const svgHeight = Math.max(layout.height + 40, 400);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Visualization</h2>
      </div>
      <div className="flex justify-center overflow-x-auto min-h-[400px] py-4 pointer-events-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`-20 -20 ${svgWidth} ${svgHeight}`}
          className="min-w-fit"
        >
          <AnimatePresence>
            {layout.edges.map((e, i) => <Edge key={`e-${i}`} edge={e} />)}
            {isBPlus && layout.leafLinks.map((e, i) => <LeafLink key={`ll-${i}`} edge={e} />)}
            {layout.nodes.map(n => (
              <NodeRect key={n.id} node={n} highlight={highlights[n.id] || 'default'} />
            ))}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}
