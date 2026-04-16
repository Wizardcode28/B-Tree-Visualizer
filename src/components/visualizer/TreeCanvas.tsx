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
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 500 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    if (layout.width > 0 && layout.height > 0) {
      setViewBox({ x: 0, y: 0, w: Math.max(layout.width, 400), h: Math.max(layout.height, 300) });
    }
  }, [layout.width, layout.height]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(vb => ({
      x: vb.x,
      y: vb.y,
      w: vb.w * factor,
      h: vb.h * factor,
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStartRef.current.x) * scaleX;
    const dy = (e.clientY - panStartRef.current.y) * scaleY;
    setViewBox(vb => ({ ...vb, x: panStartRef.current.vx - dx, y: panStartRef.current.vy - dy }));
  }, [isPanning, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  if (layout.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center animate-float-in">
          <div className="text-4xl mb-3 opacity-30">🌳</div>
          <p className="text-sm">Insert a key to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing rounded-xl bg-card border border-border"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
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
  );
}
