import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, MousePointer2, Plus, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

// Distance helper
const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const CLASS_A_COLOR = '#00f2ff'; // Cyan
const CLASS_B_COLOR = '#ff0055'; // Pink

const KNNLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [trainingPoints, setTrainingPoints] = useState([
        { x: 20, y: 30, type: 'A' }, { x: 30, y: 20, type: 'A' }, { x: 25, y: 35, type: 'A' },
        { x: 70, y: 70, type: 'B' }, { x: 80, y: 60, type: 'B' }, { x: 75, y: 75, type: 'B' }
    ]);
    const [testPoint, setTestPoint] = useState({ x: 50, y: 50 });
    const [k, setK] = useState(3);
    const [addMode, setAddMode] = useState('A'); // 'A' or 'B'
    const [isDragging, setIsDragging] = useState(false);

    // Logic: Find nearest neighbors
    const nearestNeighbors = useMemo(() => {
        return trainingPoints
            .map(p => ({ ...p, d: distance(p, testPoint) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, k);
    }, [trainingPoints, testPoint, k]);

    // Logic: Classification
    const result = useMemo(() => {
        let aCount = 0;
        let bCount = 0;
        nearestNeighbors.forEach(n => {
            if (n.type === 'A') aCount++;
            else bCount++;
        });
        return {
            type: aCount > bCount ? 'A' : bCount > aCount ? 'B' : 'Tie',
            aCount,
            bCount,
            confidence: nearestNeighbors.length > 0 ? Math.max(aCount, bCount) / nearestNeighbors.length : 0
        };
    }, [nearestNeighbors]);

    // Logic: Handle plane interactions (Add point or Drag test point)
    const handlePlaneMouseDown = (e) => {
        // Check if clicked near test point to start drag
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const distToTest = distance({ x, y }, testPoint);
        if (distToTest < 5) { // 5% radius threshold
            setIsDragging(true);
        } else {
            // Add training point
            setTrainingPoints([...trainingPoints, { x, y, type: addMode }]);
        }
    };

    const handlePlaneMouseMove = (e) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTestPoint({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    const handlePlaneMouseUp = () => {
        setIsDragging(false);
    };

    // Sync Panels
    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Neighbors (K): {k}</span>
                    </div>
                    <Slider
                        value={[k]}
                        onValueChange={(vals) => setK(vals[0])}
                        min={1} max={15} step={1}
                        className="py-2"
                    />
                </div>

                <div className="space-y-2">
                    <span className="text-xs uppercase text-muted-foreground font-semibold">Add Data Points</span>
                    <div className="flex gap-2">
                        <Button
                            variant={addMode === 'A' ? 'neon' : 'outline'}
                            className="flex-1"
                            style={addMode === 'A' ? { borderColor: CLASS_A_COLOR, color: CLASS_A_COLOR, boxShadow: `0 0 10px ${CLASS_A_COLOR}` } : {}}
                            onClick={() => setAddMode('A')}
                        >
                            Class A (Cyan)
                        </Button>
                        <Button
                            variant={addMode === 'B' ? 'neon' : 'outline'}
                            className="flex-1"
                            style={addMode === 'B' ? { borderColor: CLASS_B_COLOR, color: CLASS_B_COLOR, boxShadow: `0 0 10px ${CLASS_B_COLOR}` } : {}}
                            onClick={() => setAddMode('B')}
                        >
                            Class B (Pink)
                        </Button>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setTrainingPoints([])}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Clear All Points
                </Button>

                <Card className="bg-muted/50 border-none">
                    <CardContent className="pt-4 text-xs text-muted-foreground">
                        Drag the <strong>White</strong> point to classify it.<br />
                        Click empty space to add training data.
                    </CardContent>
                </Card>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Classification Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-2" style={{ color: result.type === 'A' ? CLASS_A_COLOR : result.type === 'B' ? CLASS_B_COLOR : 'white' }}>
                            {result.type === 'Tie' ? 'Tie / Undefined' : `Class ${result.type}`}
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span style={{ color: CLASS_A_COLOR }}>A: {result.aCount} votes</span>
                            <span style={{ color: CLASS_B_COLOR }}>B: {result.bCount} votes</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Nearest Neighbors Distance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 max-h-[300px] overflow-y-auto">
                        {nearestNeighbors.map((n, i) => (
                            <div key={i} className="flex justify-between text-xs px-2 py-1 rounded bg-secondary/30">
                                <span style={{ color: n.type === 'A' ? CLASS_A_COLOR : CLASS_B_COLOR }}>
                                    Class {n.type}
                                </span>
                                <span className="font-mono text-muted-foreground">
                                    d = {n.d.toFixed(1)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }, [k, addMode, result, nearestNeighbors, trainingPoints, setLeftPanelContent, setRightPanelContent]);

    return (
        <div
            className="w-full h-full relative cursor-crosshair group overflow-hidden select-none"
            onMouseDown={handlePlaneMouseDown}
            onMouseMove={handlePlaneMouseMove}
            onMouseUp={handlePlaneMouseUp}
            onMouseLeave={handlePlaneMouseUp}
        >
            {/* Background Grid */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <pattern id="grid-knn" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid-knn)" />
            </svg>

            {/* Connections to neighbors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {nearestNeighbors.map((n, i) => (
                    <motion.line
                        key={i}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.5, x1: `${testPoint.x}%`, y1: `${testPoint.y}%`, x2: `${n.x}%`, y2: `${n.y}%` }}
                        stroke={n.type === 'A' ? CLASS_A_COLOR : CLASS_B_COLOR}
                        strokeWidth="1"
                        strokeDasharray="5,5"
                    />
                ))}
            </svg>

            {/* Training Points */}
            <AnimatePresence>
                {trainingPoints.map((p, i) => (
                    <motion.div
                        key={`tp-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn("absolute w-3 h-3 rounded-sm -ml-1.5 -mt-1.5 shadow-sm")} // Square/Diamond for training data?
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            backgroundColor: p.type === 'A' ? CLASS_A_COLOR : CLASS_B_COLOR,
                            rotate: 45 // Diamond shape
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Test Point (Draggable) */}
            <motion.div
                animate={{
                    left: `${testPoint.x}%`,
                    top: `${testPoint.y}%`,
                    backgroundColor: result.type === 'A' ? CLASS_A_COLOR : result.type === 'B' ? CLASS_B_COLOR : '#ffffff'
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                    "absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-4 border-white z-20 shadow-[0_0_20px_white] cursor-move flex items-center justify-center",
                    isDragging ? "scale-125" : "scale-100 hover:scale-110"
                )}
            >
                {/* Inner dot */}
                <div className="w-1 h-1 bg-black rounded-full" />
            </motion.div>

            {/* Tooltip for dragging hint if clean state */}
            {!isDragging && (
                <div
                    className="absolute pointer-events-none text-xs text-white/50 bg-black/50 px-2 py-1 rounded top-0 left-0 -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap"
                    style={{ left: `${testPoint.x}%`, top: `${testPoint.y}%` }}
                >
                    Drag Me
                </div>
            )}

        </div>
    );
};

export default KNNLab;
