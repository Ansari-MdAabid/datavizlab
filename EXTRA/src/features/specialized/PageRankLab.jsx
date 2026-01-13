import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Link2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PageRankLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [nodes, setNodes] = useState([
        { id: 'A', rank: 0.2, x: 50, y: 30 },
        { id: 'B', rank: 0.3, x: 20, y: 80 },
        { id: 'C', rank: 0.5, x: 80, y: 80 },
    ]);
    const [links, setLinks] = useState([
        { source: 'A', target: 'B' },
        { source: 'A', target: 'C' },
        { source: 'B', target: 'C' },
    ]);

    // Recalculate Ranks (Iterative Power Method - Simplified)
    const recalculate = () => {
        let rounds = 10;
        let newNodes = [...nodes];

        for (let r = 0; r < rounds; r++) {
            const ranks = Object.fromEntries(newNodes.map(n => [n.id, 0]));

            newNodes.forEach(n => {
                // Distribute current rank to outbound links
                const outbound = links.filter(l => l.source === n.id);
                if (outbound.length > 0) {
                    const share = n.rank / outbound.length;
                    outbound.forEach(l => {
                        ranks[l.target] += share;
                    });
                } else {
                    // Dangling node share? distribute eq? ignore for simplicity
                }
            });

            // Damping factor
            const d = 0.85;
            newNodes = newNodes.map(n => ({
                ...n,
                rank: (1 - d) + d * (ranks[n.id] || 0)
            }));
        }

        // Normalize to sum 1
        const total = newNodes.reduce((s, n) => s + n.rank, 0);
        setNodes(newNodes.map(n => ({ ...n, rank: n.rank / total })));
    };

    // Trigger recalc on graph change
    useEffect(() => {
        // debounce/delay recalc
        const t = setTimeout(recalculate, 100);
        return () => clearTimeout(t);
    }, [links.length, nodes.length]);

    const addNode = () => {
        const id = String.fromCharCode(65 + nodes.length); // D, E, F...
        setNodes([...nodes, {
            id,
            rank: 1 / nodes.length,
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60
        }]);
    };

    const addRandomLink = () => {
        if (nodes.length < 2) return;
        const s = nodes[Math.floor(Math.random() * nodes.length)];
        const t = nodes[Math.floor(Math.random() * nodes.length)];
        if (s.id !== t.id) {
            setLinks([...links, { source: s.id, target: t.id }]);
        }
    };

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-4 animate-in slide-in-from-left">
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={addNode} variant="secondary">
                        <Plus className="mr-2 h-4 w-4" /> Add Node
                    </Button>
                    <Button onClick={addRandomLink} variant="secondary">
                        <Link2 className="mr-2 h-4 w-4" /> Add Link
                    </Button>
                </div>
                <Button variant="outline" className="w-full" onClick={() => {
                    setNodes([{ id: 'A', rank: 1, x: 50, y: 50 }]);
                    setLinks([]);
                }}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>
        );
        setRightPanelContent(null);
    }, [nodes.length, links.length, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <defs>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="15" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
                        </marker>
                    </defs>

                    {/* Links */}
                    {links.map((l, i) => {
                        const s = nodes.find(n => n.id === l.source);
                        const t = nodes.find(n => n.id === l.target);
                        if (!s || !t) return null;
                        return (
                            <line
                                key={i}
                                x1={`${s.x}%`} y1={`${s.y}%`}
                                x2={`${t.x}%`} y2={`${t.y}%`}
                                stroke="#475569" strokeWidth="1" markerEnd="url(#arrow)"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map(n => (
                        <motion.g
                            key={n.id}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            drag
                            onDrag={(e, info) => {
                                // in a real app, update state. here relying on visuals
                            }}
                        >
                            <circle
                                cx={`${n.x}%`} cy={`${n.y}%`}
                                r={Math.max(2, 2 + (n.rank * 20))} // Size based on rank
                                fill={n.id === 'C' ? "#22c55e" : "#3b82f6"}
                                opacity="0.8"
                                stroke="white"
                                strokeWidth="0.5"
                            />
                            <text x={`${n.x}%`} y={`${n.y}%`} dy="1" textAnchor="middle" fill="white" fontWeight="bold" fontSize="4">
                                {n.id}
                            </text>
                        </motion.g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default PageRankLab;
