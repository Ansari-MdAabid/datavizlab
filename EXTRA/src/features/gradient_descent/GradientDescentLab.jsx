import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Play, SkipForward, RefreshCw, AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Gradient Descent Lab (Clean Re-implementation)
 * Target function: f(x) = x^2
 * Derivative: f'(x) = 2x
 */

const f = (x) => x * x;
const df = (x) => 2 * x;

const GradientDescentLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [currentX, setCurrentX] = useState(-4);
    const [learningRate, setLearningRate] = useState(0.1);
    const [history, setHistory] = useState([]);
    const [iteration, setIteration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExploded, setIsExploded] = useState(false);

    // Coordinate Mapping (for SVG)
    // Domain: [-6, 6] -> [0%, 100%]
    // Range: [0, 40]   -> [90%, 10%] (Canvas Y)
    const mapX = (x) => ((x + 6) / 12) * 100;
    const mapY = (y) => 90 - ((y / 40) * 80);

    const step = useCallback(() => {
        if (isExploded) return;

        const gradient = df(currentX);
        const nextX = currentX - (learningRate * gradient);

        // Safety check: Catch Explosion BEFORE updating state
        if (!isFinite(nextX) || Math.abs(nextX) > 1000) {
            setIsExploded(true);
            setIsPlaying(false);
            setCurrentX(nextX); // Still set it once so the UI shows the extreme value
            return;
        }

        // Convergence check (stop if very close to zero and auto-playing)
        if (isPlaying && Math.abs(currentX) < 0.0001) {
            setIsPlaying(false);
            return;
        }

        setHistory(prev => [...prev.slice(-20), currentX]); // Keep last 20 for trail
        setCurrentX(nextX);
        setIteration(prev => prev + 1);
    }, [currentX, learningRate, isExploded, isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(step, 200);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, step]);

    const handleReset = () => {
        setCurrentX(-4);
        setHistory([]);
        setIteration(0);
        setIsPlaying(false);
        setIsExploded(false);
    };

    // Parabola Path Data
    const parabolaD = useMemo(() => {
        const points = [];
        for (let x = -6; x <= 6; x += 0.2) {
            points.push(`${x === -6 ? 'M' : 'L'} ${mapX(x)} ${mapY(f(x))}`);
        }
        return points.join(' ');
    }, []);

    // Side Panels
    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span>Initial Position (x)</span>
                            <span className="font-mono font-bold text-primary">{currentX.toFixed(1)}</span>
                        </div>
                        <Slider
                            value={[currentX]}
                            onValueChange={v => { if (iteration === 0) setCurrentX(v[0]); }}
                            min={-5} max={5} step={0.1}
                            disabled={iteration > 0}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span>Learning Rate (α)</span>
                            <span className="font-mono font-bold text-primary">{learningRate.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[learningRate]}
                            onValueChange={v => setLearningRate(v[0])}
                            min={0.01} max={1.1} step={0.01}
                        />
                        <p className="text-[10px] text-muted-foreground mt-2">
                            High α (e.g., 1.05) causes <strong>oscillation</strong> and <strong>explosion</strong>.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" size="sm" onClick={step} disabled={isExploded}>
                            <SkipForward className="w-4 h-4 mr-2" /> Step
                        </Button>
                        <Button variant={isPlaying ? "destructive" : "neon"} size="sm" onClick={() => setIsPlaying(!isPlaying)} disabled={isExploded}>
                            <Play className="w-4 h-4 mr-2" /> {isPlaying ? "Stop" : "Auto Run"}
                        </Button>
                    </div>
                </div>

                {isExploded && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-500 text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>The gradient exploded! Reduce the learning rate and reset.</span>
                    </motion.div>
                )}
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card className="bg-slate-900/50">
                    <CardHeader className="py-3"><CardTitle className="text-sm">Live Metrics</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                            <span className="text-muted-foreground text-xs uppercase">Iteration</span>
                            <span className="font-mono font-bold text-primary">{iteration}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                            <span className="text-muted-foreground text-xs uppercase">Current X</span>
                            <span className={cn("font-mono font-bold", isExploded ? "text-red-500" : "text-white")}>
                                {isExploded ? "∞" : currentX.toFixed(4)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                            <span className="text-muted-foreground text-xs uppercase">Cost f(x)</span>
                            <span className="font-mono font-bold text-green-500">
                                {!isFinite(f(currentX)) ? "∞" : f(currentX).toFixed(4)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3"><CardTitle className="text-sm">Quick Concept</CardTitle></CardHeader>
                    <CardContent className="text-[11px] text-muted-foreground space-y-2 leading-relaxed">
                        <p>Gradient Descent finds the minimum of a function by moving in the opposite direction of the gradient.</p>
                        <div className="bg-slate-950 p-2 rounded font-mono text-primary text-[10px]">
                            x = x - α * f'(x)
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }, [currentX, learningRate, iteration, isExploded, isPlaying, setLeftPanelContent, setRightPanelContent, step]);

    return (
        <div className="w-full h-full flex flex-col p-6 items-center justify-center overflow-hidden">
            <header className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Gradient Descent Optimizer</h2>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3" />
                    Minimizing Cost Function: f(x) = x²
                </div>
            </header>

            <div className="relative w-full max-w-2xl aspect-[16/9] bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Axes */}
                <div className="absolute inset-x-0 bottom-[10%] border-t border-slate-700/50" />
                <div className="absolute inset-y-0 left-1/2 border-r border-slate-700/50" />

                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    {/* Parabola */}
                    <path d={parabolaD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" opacity="0.4" />

                    {/* Trail */}
                    {history.map((hX, i) => (
                        <circle key={`t-${i}`} cx={`${mapX(hX)}%`} cy={`${mapY(f(hX))}%`} r="2" fill="#3b82f6" opacity={i / history.length * 0.5} />
                    ))}

                    {/* Current Position (The Ball) */}
                    {isFinite(currentX) && isFinite(f(currentX)) && (
                        <motion.circle
                            animate={{ cx: `${mapX(currentX)}%`, cy: `${mapY(f(currentX))}%` }}
                            transition={{ duration: 0.2, ease: "linear" }}
                            r="6"
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth="2"
                            className="shadow-2xl"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }}
                        />
                    )}
                </svg>

                {/* Ground/Target */}
                <div className="absolute left-1/2 bottom-[10%] w-4 h-1 -ml-2 bg-green-500 rounded-full blur-[2px]" />
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Parameter State</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-40" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Optimized Target (Minimum)</span>
                </div>
            </div>
        </div>
    );
};

export default GradientDescentLab;
