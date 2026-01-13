import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, SkipForward, ArrowRight, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdaBoostLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [points, setPoints] = useState([
        { x: 30, y: 30, label: 1, weight: 1 },
        { x: 70, y: 70, label: -1, weight: 1 },
        { x: 40, y: 70, label: 1, weight: 1 }
    ]);
    const [activeClass, setActiveClass] = useState(1);
    const [learners, setLearners] = useState([]); // { axis, val, weight, direction }
    const [iteration, setIteration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Simplified Boosting Step
    const runBoostingStep = useCallback(() => {
        if (points.length < 2) return;

        // Current totals for weighting
        const totalWeight = points.reduce((sum, p) => sum + p.weight, 0);

        // Find best stump (weak learner)
        // We'll search x and y axes for a split that minimizes weighted error
        let bestStump = { error: Infinity, axis: 'x', splitVal: 50, direction: 1 };

        ['x', 'y'].forEach(axis => {
            // Test multiple split points
            for (let split = 10; split <= 90; split += 5) {
                [1, -1].forEach(dir => {
                    let error = 0;
                    points.forEach(p => {
                        const predicted = (dir * p[axis] > dir * split) ? 1 : -1;
                        if (predicted !== p.label) {
                            error += p.weight;
                        }
                    });

                    if (error < bestStump.error) {
                        bestStump = { error, axis, splitVal: split, direction: dir };
                    }
                });
            }
        });

        // 1. Calculate Alpha (learner weight)
        const epsilon = Math.max(bestStump.error / totalWeight, 0.01);
        const alpha = 0.5 * Math.log((1 - epsilon) / epsilon);

        // 2. Update Point Weights
        const newPoints = points.map(p => {
            const predicted = (bestStump.direction * p[bestStump.axis] > bestStump.direction * bestStump.splitVal) ? 1 : -1;
            const newWeight = p.weight * Math.exp(-alpha * p.label * predicted);
            return { ...p, weight: newWeight };
        });

        // Normalize weights
        const newTotal = newPoints.reduce((sum, p) => sum + p.weight, 0);
        const normalizedPoints = newPoints.map(p => ({ ...p, weight: (p.weight / newTotal) * points.length }));

        setPoints(normalizedPoints);
        setLearners([...learners, { ...bestStump, alpha }]);
        setIteration(prev => prev + 1);
    }, [points, learners]);

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(runBoostingStep, 800);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, runBoostingStep]);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y, label: activeClass, weight: 1 }]);
        setLearners([]);
        setIteration(0);
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

                <div className="space-y-2 pt-4 border-t border-white/10">
                    <Button variant="outline" className="w-full" onClick={() => { setPoints([]); setLearners([]); setIteration(0); setIsPlaying(false); }}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Reset All
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={runBoostingStep} disabled={isPlaying}>
                        <SkipForward className="mr-2 h-4 w-4" /> Next Learner
                    </Button>
                    <Button variant={isPlaying ? "destructive" : "default"} className="w-full" onClick={() => setIsPlaying(!isPlaying)}>
                        <Play className="mr-2 h-4 w-4" /> {isPlaying ? "Stop" : "Auto Boost"}
                    </Button>
                </div>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-primary">
                            <Zap className="w-4 h-4" />
                            Boosting Engine
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                            <span className="text-xs text-muted-foreground uppercase">Round</span>
                            <span className="text-2xl font-bold">{iteration}</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Learner #{iteration} was assigned weight <strong>{learners[iteration - 1]?.alpha.toFixed(2)}</strong>.
                                Points it missed now have larger visual sizes.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" />
                            Strong Classifier
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground">
                        <p>The final predicted boundary is a weighted sum of all individual stumps created so far.</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>Large point = Higher influence</li>
                            <li>Solid line = Strongest stump</li>
                            <li>Dashed lines = Ensemble sum</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    }, [activeClass, points.length, iteration, isPlaying, learners, setLeftPanelContent, setRightPanelContent, runBoostingStep]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6 overflow-hidden">
            <div className="relative w-full max-w-2xl aspect-square bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair shadow-inner" onClick={handleCanvasClick}>
                {/* Decision Boundaries */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Active Stump */}
                    {learners.length > 0 && learners.map((l, i) => (
                        <line
                            key={`learner-${i}`}
                            x1={l.axis === 'x' ? l.splitVal : 0}
                            y1={l.axis === 'y' ? l.splitVal : 0}
                            x2={l.axis === 'x' ? l.splitVal : 100}
                            y2={l.axis === 'y' ? l.splitVal : 100}
                            stroke={i === learners.length - 1 ? "white" : "white"}
                            strokeWidth={i === learners.length - 1 ? "0.5" : "0.2"}
                            strokeDasharray={i === learners.length - 1 ? "" : "1,1"}
                            opacity={0.3 + (i / learners.length) * 0.7}
                        />
                    ))}
                </svg>

                {/* Classification Hints */}
                {learners.length > 0 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[10px] text-white/50 uppercase tracking-widest border border-white/5">
                        Round {iteration}: Learner weights update...
                    </div>
                )}

                {/* Points */}
                {points.map((p, i) => (
                    <motion.div
                        key={`p-${i}`}
                        initial={{ scale: 0 }}
                        animate={{
                            scale: 0.5 + Math.sqrt(p.weight) * 0.5,
                            left: `${p.x}%`,
                            top: `${p.y}%`
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={`absolute rounded-full -ml-1 -mt-1 border border-white/10 shadow-lg`}
                        style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: p.label === 1 ? '#06b6d4' : '#ec4899',
                            boxShadow: `0 0 ${p.weight * 5}px ${p.label === 1 ? '#06b6d4' : '#ec4899'}40`
                        }}
                    >
                        {p.weight > 2.5 && <div className="absolute inset-0 rounded-full border border-white/50 animate-ping" />}
                    </motion.div>
                ))}

                {points.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                        <Zap className="w-16 h-16 mb-4 text-slate-700" />
                        <p className="text-sm font-medium">Click to add points, then Start Boosting</p>
                    </div>
                )}
            </div>

            <div className="flex gap-6 items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Normal Point</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-pink-500 ring-2 ring-white/50" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Misclassified (Higher Weight)</span>
                </div>
            </div>
        </div>
    );
};

export default AdaBoostLab;
