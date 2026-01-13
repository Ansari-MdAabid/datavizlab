import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Trees, RefreshCw, BarChart, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RandomForestLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [points, setPoints] = useState([
        { x: 20, y: 30, label: 1 }, { x: 30, y: 25, label: 1 }, { x: 25, y: 40, label: 1 },
        { x: 70, y: 70, label: -1 }, { x: 80, y: 75, label: -1 }, { x: 75, y: 60, label: -1 }
    ]);
    const [numTrees, setNumTrees] = useState(5);
    const [activeClass, setActiveClass] = useState(1);
    const [trees, setTrees] = useState([]);

    // Simplified Decision Tree (Stump/Small Tree) logic
    const trainTree = (data) => {
        // Bootstrap sample
        const bootstrap = [];
        for (let i = 0; i < data.length; i++) {
            bootstrap.push(data[Math.floor(Math.random() * data.length)]);
        }

        // Randomly pick axis (x or y) and split point
        const axis = Math.random() > 0.5 ? 'x' : 'y';
        const minVal = Math.min(...bootstrap.map(p => p[axis]));
        const maxVal = Math.max(...bootstrap.map(p => p[axis]));
        const splitVal = minVal + Math.random() * (maxVal - minVal);

        // Assign label based on majority in bootstrap
        const leftPoints = bootstrap.filter(p => p[axis] <= splitVal);
        const rightPoints = bootstrap.filter(p => p[axis] > splitVal);

        const getMode = (pts) => {
            const counts = pts.reduce((acc, p) => { acc[p.label] = (acc[p.label] || 0) + 1; return acc; }, {});
            return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 1;
        };

        return {
            axis,
            splitVal,
            leftLabel: Number(getMode(leftPoints)),
            rightLabel: Number(getMode(rightPoints))
        };
    };

    const updateForest = useMemo(() => {
        if (points.length < 2) return [];
        const newTrees = [];
        for (let i = 0; i < numTrees; i++) {
            newTrees.push(trainTree(points));
        }
        return newTrees;
    }, [points, numTrees]);

    useEffect(() => {
        setTrees(updateForest);
    }, [updateForest]);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y, label: activeClass }]);
    };

    // Sidebar Content
    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left">
                <div className="space-y-4">
                    <p className="text-sm font-medium">Add Training Data</p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={activeClass === 1 ? 'default' : 'outline'}
                            className={activeClass === 1 ? 'bg-cyan-500' : 'text-cyan-500 border-cyan-500'}
                            onClick={() => setActiveClass(1)}
                        >
                            Class A
                        </Button>
                        <Button
                            size="sm"
                            variant={activeClass === -1 ? 'default' : 'outline'}
                            className={activeClass === -1 ? 'bg-pink-500' : 'text-pink-500 border-pink-500'}
                            onClick={() => setActiveClass(-1)}
                        >
                            Class B
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span>Number of Trees:</span>
                        <span className="text-primary font-bold">{numTrees}</span>
                    </div>
                    <Slider value={[numTrees]} onValueChange={v => setNumTrees(v[0])} min={1} max={10} step={1} />
                </div>

                <Button variant="outline" className="w-full" onClick={() => setPoints([])}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Data
                </Button>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Ensemble Statistics</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between">
                            <span className="text-xs">Forest Size</span>
                            <span className="font-bold">{numTrees} Trees</span>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg flex items-center justify-between">
                            <span className="text-xs">Data Points</span>
                            <span className="font-bold">{points.length}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm">Wisdom of Crowds</CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground leading-relaxed space-y-2">
                        <p>Random Forest combines multiple decision trees to reduce overfitting.</p>
                        <p>Each tree is trained on a random <strong>bootstrap sample</strong> of the data.</p>
                        <p>Look at the overlapping background regions; darker areas show higher agreement between trees.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }, [activeClass, numTrees, points.length, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6">
            <div className="relative w-full max-w-2xl aspect-square bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair shadow-inner" onClick={handleCanvasClick}>
                {/* Decision Boundaries (Composite) */}
                <div className="absolute inset-0 pointer-events-none">
                    {trees.map((t, i) => (
                        <div
                            key={`tree-bound-${i}`}
                            className="absolute opacity-[0.08]"
                            style={{
                                left: t.axis === 'x' ? 0 : 0,
                                top: t.axis === 'y' ? 0 : 0,
                                width: t.axis === 'x' ? `${t.splitVal}%` : '100%',
                                height: t.axis === 'y' ? `${t.splitVal}%` : '100%',
                                backgroundColor: t.leftLabel === 1 ? '#06b6d4' : '#ec4899',
                            }}
                        />
                    ))}
                    {trees.map((t, i) => (
                        <div
                            key={`tree-bound-right-${i}`}
                            className="absolute opacity-[0.08]"
                            style={{
                                left: t.axis === 'x' ? `${t.splitVal}%` : 0,
                                top: t.axis === 'y' ? `${t.splitVal}%` : 0,
                                width: t.axis === 'x' ? `${100 - t.splitVal}%` : '100%',
                                height: t.axis === 'y' ? `${100 - t.splitVal}%` : '100%',
                                backgroundColor: t.rightLabel === 1 ? '#06b6d4' : '#ec4899',
                            }}
                        />
                    ))}
                </div>

                {/* Points */}
                {points.map((p, i) => (
                    <motion.div
                        key={`p-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute w-2 h-2 rounded-full -ml-1 -mt-1 border border-white/20 shadow-lg`}
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            backgroundColor: p.label === 1 ? '#06b6d4' : '#ec4899'
                        }}
                    />
                ))}

                {points.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                        <Trees className="w-16 h-16 mb-4 text-slate-700" />
                        <p className="text-sm">Click to build your forest</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-500/50" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Class A Region</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-pink-500/20 border border-pink-500/50" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Class B Region</span>
                </div>
            </div>
        </div>
    );
};

export default RandomForestLab;
