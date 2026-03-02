import React, { useMemo } from "react";
import { motion } from "framer-motion";

function layoutTree(root, {
  width = 1200,
  levelGap = 110,
  topPadding = 60,
  sidePadding = 60,
} = {}) {
  // inorder para x “bonito”
  const inorder = [];
  function dfsIn(node, depth) {
    if (!node) return;
    dfsIn(node.left, depth + 1);
    inorder.push({ node, depth });
    dfsIn(node.right, depth + 1);
  }
  dfsIn(root, 0);

  const count = inorder.length;
  const usableWidth = Math.max(0, width - sidePadding * 2);
  const step = count > 1 ? usableWidth / (count - 1) : 0;

  const posById = new Map();
  inorder.forEach((item, i) => {
    const x = sidePadding + i * step;
    const y = topPadding + item.depth * levelGap;
    posById.set(item.node.id, { x, y });
  });

  const edges = [];
  const nodes = [];
  function walk(node) {
    if (!node) return;
    nodes.push(node);
    if (node.left) edges.push({ from: node.id, to: node.left.id });
    if (node.right) edges.push({ from: node.id, to: node.right.id });
    walk(node.left);
    walk(node.right);
  }
  walk(root);

  return { nodes, edges, posById };
}

export default function BinaryTreeViz({
  root,
  width = 1200,
  height = 420,
  highlightIds = [], // camino encontrado
}) {
  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);

  const { nodes, edges, posById } = useMemo(() => {
    if (!root) return { nodes: [], edges: [], posById: new Map() };
    return layoutTree(root, { width });
  }, [root, width]);

  return (
    <div style={{ width: "100%", overflowX: "auto", background: "#f4f4f4", borderRadius: 14, padding: 12 }}>
      <svg width={width} height={height} style={{ display: "block" }}>
        {/* Edges */}
        {edges.map((e, idx) => {
          const a = posById.get(e.from);
          const b = posById.get(e.to);
          if (!a || !b) return null;

          const isHighlighted = highlightSet.has(e.from) && highlightSet.has(e.to);

          return (
            <motion.line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={isHighlighted ? "#111" : "#333"}
              strokeWidth={isHighlighted ? 5 : 3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: idx * 0.01 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const p = posById.get(n.id);
          if (!p) return null;

          const isHighlighted = highlightSet.has(n.id);
          const fill = isHighlighted ? "#111" : "#fff";
          const textColor = isHighlighted ? "#fff" : "#111";

          return (
            <g key={n.id}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={22}
                fill={fill}
                stroke="#222"
                strokeWidth={3}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.02 }}
              />
              <text
                x={p.x}
                y={p.y + 6}
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill={textColor}
                style={{ userSelect: "none" }}
              >
                {n.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}