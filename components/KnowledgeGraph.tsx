import React, { useEffect, useRef, useState } from 'react';
import { KnowledgeGraph as GraphData, GraphNode, GraphLink } from '../types';
import { Network, ZoomIn, ZoomOut, RefreshCw, Maximize, AlertCircle } from 'lucide-react';

interface KnowledgeGraphProps {
  data: GraphData;
}

interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<SimulationNode | null>(null);
  const [isRunning, setIsRunning] = useState(true);

  // Initialize nodes with random positions
  useEffect(() => {
    if (data.nodes.length === 0) return;
    
    const width = 800;
    const height = 600;

    const initialNodes = data.nodes.map(n => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    setNodes(initialNodes);
    setIsRunning(true);
  }, [data]);

  // Force Simulation Loop
  useEffect(() => {
    if (!isRunning || nodes.length === 0) return;

    let animationFrameId: number;
    const width = 800;
    const height = 600;

    // Simulation Parameters
    const REPULSION = 1200;
    const SPRING_LENGTH = 150;
    const SPRING_STRENGTH = 0.05;
    const CENTER_GRAVITY = 0.02;
    const DAMPING = 0.85;

    const tick = () => {
      setNodes(prevNodes => {
        // Clone nodes to avoid mutation issues in strict mode
        const nextNodes = prevNodes.map(n => ({ ...n }));
        const nodeMap = new Map<string, SimulationNode>();
        nextNodes.forEach(n => nodeMap.set(n.id, n));

        // 1. Repulsion (Nodes push apart)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n1 = nextNodes[i];
            const n2 = nextNodes[j];
            
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            let distSq = dx * dx + dy * dy;
            if (distSq === 0) distSq = 1; // Prevent div by zero
            
            const dist = Math.sqrt(distSq);
            const force = REPULSION / distSq;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx += fx;
            n1.vy += fy;
            n2.vx -= fx;
            n2.vy -= fy;
          }
        }

        // 2. Attraction (Links pull together)
        data.links.forEach(link => {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const stretch = dist - SPRING_LENGTH;
            const force = stretch * SPRING_STRENGTH;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Center Gravity & Boundary
        nextNodes.forEach(n => {
          const dx = (width / 2) - n.x;
          const dy = (height / 2) - n.y;
          
          n.vx += dx * CENTER_GRAVITY;
          n.vy += dy * CENTER_GRAVITY;

          // Apply Velocity
          n.x += n.vx;
          n.y += n.vy;

          // Damping
          n.vx *= DAMPING;
          n.vy *= DAMPING;
        });

        // Stop simulation if stable (low total energy)
        const totalEnergy = nextNodes.reduce((acc, n) => acc + Math.abs(n.vx) + Math.abs(n.vy), 0);
        if (totalEnergy < 0.5) setIsRunning(false);

        return nextNodes;
      });

      if (isRunning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, data.links]);

  const getNodeColor = (type: string, riskScore: number) => {
    if (riskScore > 80) return '#ef4444'; // Red (High Risk)
    if (riskScore > 50) return '#eab308'; // Yellow
    
    switch (type) {
      case 'Person': return '#3b82f6'; // Blue
      case 'Organization': return '#a855f7'; // Purple
      case 'Location': return '#22c55e'; // Green
      case 'Event': return '#f97316'; // Orange
      case 'Claim': return '#ec4899'; // Pink
      default: return '#64748b'; // Slate
    }
  };

  const getLinkColor = (type: string) => {
    switch(type) {
        case 'contradicts': return '#ef4444';
        case 'supports': return '#22c55e';
        default: return '#475569';
    }
  };

  if (data.nodes.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500 bg-black/20 rounded-xl border border-white/5">
              <Network className="w-16 h-16 mb-4 opacity-20" />
              <p>No entity relationships extracted.</p>
          </div>
      );
  }

  return (
    <div className="relative w-full h-[600px] bg-black/40 rounded-3xl border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 bg-black/60 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300">
                <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-black/60 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300">
                <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={() => setIsRunning(true)} className="p-2 bg-black/60 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300">
                <RefreshCw className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
            </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-black/80 p-3 rounded-lg border border-white/10 backdrop-blur-sm text-xs space-y-2">
            <div className="font-bold text-slate-400 uppercase tracking-widest mb-1">Entity Types</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Person</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Organization</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Location</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500"></div> Claim</div>
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> High Risk</div>
        </div>

        {/* Graph SVG */}
        <svg 
            ref={svgRef} 
            viewBox="0 0 800 600" 
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
        >
            <g transform={`scale(${zoom}) translate(${(800 * (1-zoom))/2}, ${(600 * (1-zoom))/2})`}>
                {/* Links */}
                {data.links.map((link, i) => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if (!source || !target) return null;

                    return (
                        <g key={i}>
                            <line 
                                x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                                stroke={getLinkColor(link.type)} 
                                strokeWidth="1.5"
                                opacity="0.6"
                            />
                            {/* Link Label (midpoint) */}
                            <text 
                                x={(source.x + target.x) / 2} 
                                y={(source.y + target.y) / 2} 
                                fill="#94a3b8" 
                                fontSize="10" 
                                textAnchor="middle"
                                className="select-none pointer-events-none bg-black"
                            >
                                {link.relation}
                            </text>
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => (
                    <g 
                        key={node.id} 
                        transform={`translate(${node.x},${node.y})`}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110"
                    >
                        {/* Glow for high risk */}
                        {node.riskScore > 50 && (
                            <circle r="25" fill={getNodeColor(node.type, node.riskScore)} opacity="0.2" className="animate-pulse" />
                        )}
                        
                        {/* Node Circle */}
                        <circle 
                            r={node.type === 'Claim' ? 15 : 20} 
                            fill="#000" 
                            stroke={getNodeColor(node.type, node.riskScore)} 
                            strokeWidth="2"
                        />
                        
                        {/* Icon/Letter */}
                        <text dy="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">
                            {node.label.substring(0, 2).toUpperCase()}
                        </text>

                        {/* Label */}
                        <text dy="35" textAnchor="middle" fill="#e2e8f0" fontSize="12" className="pointer-events-none select-none drop-shadow-md">
                            {node.label}
                        </text>
                    </g>
                ))}
            </g>
        </svg>

        {/* Selected Node Inspector */}
        {selectedNode && (
            <div className="absolute top-4 left-4 z-20 w-64 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedNode.label}</h3>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white"><Maximize className="w-4 h-4" /></button>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Type</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 border border-white/5 text-slate-200">{selectedNode.type}</span>
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Risk Score</span>
                            <span className={`font-bold ${selectedNode.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{selectedNode.riskScore}/100</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${selectedNode.riskScore > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${selectedNode.riskScore}%` }}></div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-500">
                             {selectedNode.type === 'Claim' 
                                ? "This entity represents a central claim extracted from the analysis text."
                                : "Entity extracted via Named Entity Recognition (NER). Connections represent semantic relationships."
                             }
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};