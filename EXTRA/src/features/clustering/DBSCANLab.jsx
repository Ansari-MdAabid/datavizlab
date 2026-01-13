import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info, MousePointer2, Target, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DBSCANLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [epsilon, setEpsilon] = useState(15);
    const [minPts, setMinPts] = useState(3);
    const [points, setPoints] = useState([
        { x: 30, y: 30 }, { x: 32, y: 33 }, { x: 28, y: 35 }, { x: 35, y: 28 },
        { x: 70, y: 70 }, { x: 75, y: 75 }, { x: 65, y: 75 }, { x: 70, y: 80 }, { x: 68, y: 72 },
        { x: 85, y: 20 },
    ]);
    const [hoverPoint, setHoverPoint] = useState(null);

    // DBSCAN Logic Implementation
    const clusteringResult = useMemo(() => {
        const n = points.length;
        if (n === 0) return { clusters: [], noise: [], core: [], border: [] };

        const labels = new Array(n).fill(0); // 0: unvisited, -1: noise, 1+: cluster ID
        const pointTypes = new Array(n).fill('noise'); // 'core', 'border', 'noise'
        let clusterCount = 0;

        const getNeighbors = (index) => {
            const neighbors = [];
            for (let i = 0; i < n; i++) {
                const dx = points[index].x - points[i].x;
                const dy = points[index].y - points[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= epsilon) {
                    neighbors.push(i);
                }
            }
            return neighbors;
        };

        for (let i = 0; i < n; i++) {
            if (labels[i] !== 0) continue;

            const neighbors = getNeighbors(i);
            if (neighbors.length < minPts) {
                labels[i] = -1;
                pointTypes[i] = 'noise';
                continue;
            }

            clusterCount++;
            labels[i] = clusterCount;
            pointTypes[i] = 'core';

            const queue = [...neighbors];
            for (let j = 0; j < queue.length; j++) {
                const neighborIdx = queue[j];

                if (labels[neighborIdx] === -1) {
                    labels[neighborIdx] = clusterCount;
                    pointTypes[neighborIdx] = 'border';
                }

                if (labels[neighborIdx] !== 0) continue;

                labels[neighborIdx] = clusterCount;
                const qNeighbors = getNeighbors(neighborIdx);

                if (qNeighbors.length >= minPts) {
                    pointTypes[neighborIdx] = 'core';
                    queue.push(...qNeighbors);
                } else {
                    pointTypes[neighborIdx] = 'border';
                }
            }
        }

        const clusters = [];
        for (let i = 1; i <= clusterCount; i++) {
            clusters.push(points.filter((_, idx) => labels[idx] === i));
        }

        return {
            clusters,
            noise: points.filter((_, idx) => labels[idx] === -1),
            core: points.filter((_, idx) => pointTypes[idx] === 'core'),
            border: points.filter((_, idx) => pointTypes[idx] === 'border'),
            allPoints: points.map((p, idx) => ({ ...p, type: pointTypes[idx], label: labels[idx] }))
        };
    }, [points, epsilon, minPts]);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y }]);
    };

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Parameters
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-black uppercase tracking-tighter opacity-70">Epsilon (Radius)</label>
                                <span className="text-lg font-black text-primary">{epsilon}px</span>
                            </div>
                            <Slider
                                value={[epsilon]}
                                onValueChange={v => setEpsilon(v[0])}
                                min={5}
                                max={50}
                                step={1}
                                className="py-4"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-black uppercase tracking-tighter opacity-70">Min Points</label>
                                <span className="text-lg font-black text-primary">{minPts}</span>
                            </div>
                            <Slider
                                value={[minPts]}
                                onValueChange={v => setMinPts(v[0])}
                                min={1}
                                max={10}
                                step={1}
                                className="py-4"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Info className="h-4 w-4 text-accent-foreground" />
                        Legend
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { label: 'Core Point', color: 'bg-primary', desc: '>= MinPts neighbors' },
                            { label: 'Border Point', color: 'bg-indigo-400', desc: '< MinPts but near Core' },
                            { label: 'Noise', color: 'bg-slate-500', desc: 'Isolated points' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className={`h-3 w-3 rounded-full ${item.color} shadow-lg`} />
                                <div>
                                    <p className="text-xs font-bold">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button variant="ghost" className="w-full h-12 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => setPoints([])}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Dataset
                </Button>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20 backdrop-blur-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-12 -mt-12 rounded-full" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <Layers className="h-3 w-3" />
                            Clustering Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-4xl font-black text-primary tracking-tighter">
                            {clusteringResult.clusters.length} <span className="text-sm font-normal text-muted-foreground tracking-normal uppercase ml-1">Clusters</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Core', val: clusteringResult.core.length, color: 'text-primary' },
                                { label: 'Border', val: clusteringResult.border.length, color: 'text-indigo-400' },
                                { label: 'Noise', val: clusteringResult.noise.length, color: 'text-slate-500' }
                            ].map((stat, i) => (
                                <div key={i} className="p-3 bg-background/50 rounded-2xl border border-border/30 text-center">
                                    <div className={`text-xl font-bold ${stat.color}`}>{stat.val}</div>
                                    <div className="text-[10px] uppercase font-black opacity-50">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-2 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                    <MousePointer2 className="h-5 w-5 text-accent-foreground" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Hover over any point to visualize its <strong>epsilon neighborhood</strong>.
                    </p>
                </div>
            </div>
        );
    }, [clusteringResult, epsilon, minPts, setLeftPanelContent, setRightPanelContent]);

    const clusterColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
            {/* Background Grid Decoration */}
            <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <motion.div
                layout
                className="relative w-full max-w-[600px] aspect-square bg-slate-900/40 border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-crosshair group"
                onClick={handleCanvasClick}
            >
                {/* SVG Visualization Layer */}
                <svg className="w-full h-full p-4" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="epsilonGradient">
                            <stop offset="0%" stopColor="rgba(var(--primary-rgb), 0.2)" />
                            <stop offset="100%" stopColor="rgba(var(--primary-rgb), 0)" />
                        </radialGradient>
                    </defs>

                    {/* Interactive Epsilon Radius for Hovered Point */}
                    <AnimatePresence>
                        {hoverPoint !== null && points[hoverPoint] && (
                            <motion.circle
                                initial={{ r: 0, opacity: 0 }}
                                animate={{ r: epsilon, opacity: 1 }}
                                exit={{ r: 0, opacity: 0 }}
                                cx={points[hoverPoint].x}
                                cy={points[hoverPoint].y}
                                fill="url(#epsilonGradient)"
                                stroke="currentColor"
                                className="text-primary/30"
                                strokeDasharray="2 2"
                                pointerEvents="none"
                            />
                        )}
                    </AnimatePresence>

                    {/* Points Visualization */}
                    {clusteringResult.allPoints.map((p, i) => (
                        <motion.g
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onMouseEnter={() => setHoverPoint(i)}
                            onMouseLeave={() => setHoverPoint(null)}
                        >
                            {/* Glow Effect for Core Points */}
                            {p.type === 'core' && (
                                <circle
                                    cx={p.x} cy={p.y} r="3"
                                    fill={p.label > 0 ? clusterColors[(p.label - 1) % clusterColors.length] : '#64748b'}
                                    className="blur-[2px] opacity-40 animate-pulse"
                                />
                            )}

                            {/* Main Point Circle */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={p.type === 'core' ? "2" : "1.5"}
                                fill={p.label > 0 ? clusterColors[(p.label - 1) % clusterColors.length] : '#64748b'}
                                stroke={p.type === 'core' ? 'white' : 'none'}
                                strokeWidth="0.5"
                                className="transition-all duration-300"
                            />

                            {/* Type Indicator */}
                            {p.type === 'noise' && (
                                <text x={p.x} y={p.y - 3} className="text-[2px] fill-slate-500 font-bold pointer-events-none text-center" textAnchor="middle">
                                    outlier
                                </text>
                            )}
                        </motion.g>
                    ))}
                </svg>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 pointer-events-none group-hover:opacity-0 transition-opacity">
                    Click anywhere to seed data
                </div>
            </motion.div>
        </div>
    );
};

export default DBSCANLab;
