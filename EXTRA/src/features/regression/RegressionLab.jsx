import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, MousePointer2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const RegressionLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [points, setPoints] = useState([
        { x: 20, y: 30 }, { x: 30, y: 50 }, { x: 40, y: 40 },
        { x: 70, y: 80 }, { x: 60, y: 65 }
    ]);
    const [showResiduals, setShowResiduals] = useState(true);
    const [draggingIdx, setDraggingIdx] = useState(null);

    // Regression Logic
    const regression = useMemo(() => {
        const n = points.length;
        if (n < 2) return { m: 0, b: 0, r2: 0, equation: "Not enough points" };

        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        points.forEach(p => {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumX2 += p.x * p.x;
        });

        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = (n * sumX2) - (sumX * sumX);

        if (denominator === 0) return { m: 0, b: 0, r2: 0, equation: "Vertical Input" };

        const m = numerator / denominator;
        const b = (sumY - (m * sumX)) / n;

        // R2 Calculation
        const yMean = sumY / n;
        let ssTot = 0, ssRes = 0;
        points.forEach(p => {
            const yPred = m * p.x + b;
            ssTot += Math.pow(p.y - yMean, 2);
            ssRes += Math.pow(p.y - yPred, 2);
        });

        const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

        return {
            m,
            b,
            r2,
            equation: `y = ${m.toFixed(2)}x + ${b.toFixed(2)}`
        };
    }, [points]);

    // Handlers
    const handleMouseDown = (e, idx) => {
        e.stopPropagation(); // Prevent adding point when dragging
        setDraggingIdx(idx);
    };

    const handlePlaneMouseMove = (e) => {
        if (draggingIdx === null) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newPoints = [...points];
        newPoints[draggingIdx] = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
        setPoints(newPoints);
    };

    const handlePlaneMouseUp = () => {
        setDraggingIdx(null);
    };

    const handlePlaneClick = (e) => {
        if (draggingIdx !== null) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y }]);
    };

    // Sync Panels
    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-secondary/50 p-2 rounded">
                        <span className="text-sm font-medium">Show Residuals</span>
                        <Button
                            variant={showResiduals ? "neon" : "ghost"}
                            size="sm"
                            onClick={() => setShowResiduals(!showResiduals)}
                            className="h-6 text-xs"
                        >
                            {showResiduals ? "ON" : "OFF"}
                        </Button>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setPoints([])}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Clear All Points
                </Button>

                <Card className="bg-muted/50 border-none">
                    <CardContent className="pt-4 text-xs text-muted-foreground">
                        Click to add points.<br />
                        Drag existing points to adjust.<br />
                        Observe how the line updates instantly.
                    </CardContent>
                </Card>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-mono font-bold text-primary mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                            {regression.equation}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Slope (m):</span>
                            <span className="font-mono">{regression.m.toFixed(4)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Intercept (b):</span>
                            <span className="font-mono">{regression.b.toFixed(4)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-accent-foreground">
                            {regression.r2.toFixed(3)}
                        </div>
                        <p className="text-xs text-muted-foreground">R² Score (Coefficient of Determination)</p>
                        <div className={cn("mt-2 text-xs", regression.r2 > 0.8 ? "text-green-400" : regression.r2 > 0.5 ? "text-yellow-400" : "text-red-400")}>
                            {regression.r2 > 0.8 ? "Strong Fit" : regression.r2 > 0.5 ? "Moderate Fit" : "Weak Fit"}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }, [points, showResiduals, regression, setLeftPanelContent, setRightPanelContent]);

    // Calculate Line Points for Rendering (from x=0 to x=100)
    const linePoints = useMemo(() => {
        if (points.length < 2) return null;
        const y1 = regression.m * 0 + regression.b;
        const y2 = regression.m * 100 + regression.b;
        return { x1: 0, y1, x2: 100, y2 };
    }, [regression, points.length]);

    return (
        <div
            className="w-full h-full relative cursor-crosshair group overflow-hidden"
            onMouseMove={handlePlaneMouseMove}
            onMouseUp={handlePlaneMouseUp}
            onClick={handlePlaneClick}
            onMouseLeave={handlePlaneMouseUp}
        >
            {/* Background Grid */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <pattern id="grid-reg" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid-reg)" />
            </svg>

            {/* Residuals */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {showResiduals && points.map((p, i) => {
                    const yPred = regression.m * p.x + regression.b;
                    return (
                        <motion.line
                            key={`res-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5, x1: `${p.x}%`, y1: `${p.y}%`, x2: `${p.x}%`, y2: `${yPred}%` }}
                            stroke="red"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    );
                })}

                {/* The Regression Line */}
                {linePoints && (
                    <motion.line
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1, x1: `${linePoints.x1}%`, y1: `${linePoints.y1}%`, x2: `${linePoints.x2}%`, y2: `${linePoints.y2}%` }}
                        stroke="#00f2ff"
                        strokeWidth="3"
                        className="drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                    />
                )}
            </svg>

            {/* Points */}
            <AnimatePresence>
                {points.map((p, i) => (
                    <motion.div
                        key={`p-${i}`}
                        initial={{ scale: 0 }}
                        animate={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            scale: draggingIdx === i ? 1.2 : 1
                        }}
                        onMouseDown={(e) => handleMouseDown(e, i)}
                        className={cn(
                            "absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-white border-2 border-primary z-10 shadow-sm cursor-grab active:cursor-grabbing",
                            draggingIdx === i && "border-white bg-primary shadow-xl"
                        )}
                    />
                ))}
            </AnimatePresence>

            {points.length < 2 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                    <div className="flex flex-col items-center text-muted-foreground animate-pulse">
                        <MousePointer2 className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">Add at least 2 points</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegressionLab;
