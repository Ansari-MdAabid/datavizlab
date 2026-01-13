import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, Play, SkipForward, MousePointer2 } from 'lucide-react';

// Helper: Euclidean distance
const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// Helper: Generate distinct colors for K
const getKColor = (index) => {
    const colors = [
        '#00f2ff', // Neon Blue
        '#ff0055', // Neon Pink
        '#00ff99', // Neon Green
        '#ffcc00', // Neon Yellow
        '#bd00ff', // Neon Purple
        '#ff6600', // Neon Orange
    ];
    return colors[index % colors.length];
};

const KMeansLab = ({ setRightPanelContent, setLeftPanelContent }) => {
    const [points, setPoints] = useState([]);
    const [k, setK] = useState(3);
    const [centroids, setCentroids] = useState([]);
    const [assignments, setAssignments] = useState({}); // pointId -> centroidIndex
    const [iteration, setIteration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize centroids
    const initializeCentroids = useCallback(() => {
        if (points.length === 0) return;
        const newCentroids = [];
        const usedIndices = new Set();

        // Pick K random points as initial centroids if possible, otherwise fully random
        if (points.length >= k) {
            while (newCentroids.length < k) {
                const idx = Math.floor(Math.random() * points.length);
                if (!usedIndices.has(idx)) {
                    usedIndices.add(idx);
                    newCentroids.push({
                        ...points[idx],
                        id: newCentroids.length,
                        color: getKColor(newCentroids.length)
                    });
                }
            }
        } else {
            // Fallback or just random position
            for (let i = 0; i < k; i++) {
                newCentroids.push({
                    id: i,
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10,
                    color: getKColor(i)
                });
            }
        }

        setCentroids(newCentroids);
        setAssignments({});
        setIteration(0);
    }, [k, points]);

    // Step 1: Assign points to nearest centroid
    const assignPoints = useCallback(() => {
        if (centroids.length === 0) return false;
        let changed = false;
        const newAssignments = { ...assignments };

        points.forEach((point, idx) => {
            let minDist = Infinity;
            let closestCentroid = -1;

            centroids.forEach((centroid, cIdx) => {
                const d = distance(point, centroid);
                if (d < minDist) {
                    minDist = d;
                    closestCentroid = cIdx;
                }
            });

            if (newAssignments[idx] !== closestCentroid) {
                newAssignments[idx] = closestCentroid;
                changed = true;
            }
        });

        setAssignments(newAssignments);
        return changed;
    }, [centroids, points, assignments]);

    // Step 2: Update centroids
    const updateCentroids = useCallback(() => {
        if (points.length === 0) return false;

        // Calculate new centroids
        const sums = Array(k).fill(0).map(() => ({ x: 0, y: 0, count: 0 }));

        Object.keys(assignments).forEach(pointIdx => {
            const cIdx = assignments[pointIdx];
            if (cIdx >= 0 && cIdx < k) {
                sums[cIdx].x += points[pointIdx].x;
                sums[cIdx].y += points[pointIdx].y;
                sums[cIdx].count++;
            }
        });

        let maxShift = 0;
        const newCentroids = centroids.map((c, i) => {
            if (sums[i].count === 0) return c; // No change if no points
            const newX = sums[i].x / sums[i].count;
            const newY = sums[i].y / sums[i].count;
            const shift = distance(c, { x: newX, y: newY });
            if (shift > maxShift) maxShift = shift;
            return { ...c, x: newX, y: newY };
        });

        setCentroids(newCentroids);
        return maxShift > 0.05; // Convergence threshold
    }, [assignments, k, points, centroids]);

    // Single Step Execution
    const step = useCallback(() => {
        if (centroids.length === 0) {
            initializeCentroids();
            return;
        }

        if (iteration % 2 === 0) {
            // Assignment Step
            assignPoints();
            setIteration(prev => prev + 1);
        } else {
            // Update Step
            updateCentroids();
            setIteration(prev => prev + 1);
        }
    }, [iteration, assignPoints, updateCentroids, centroids.length, initializeCentroids]);

    // Loop for auto-play
    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(() => {
                step();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, step]);

    // Click handler to add points
    const handlePlaneClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y }]);
    };

    // Sync controls with parent
    useEffect(() => {
        if (setLeftPanelContent) {
            setLeftPanelContent(
                <div className="space-y-6 animate-in slide-in-from-left duration-300">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Clusters (K): {k}</span>
                        </div>
                        <Slider
                            value={[k]}
                            onValueChange={(vals) => setK(vals[0])}
                            min={2} max={6} step={1}
                            className="py-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setPoints([]); setCentroids([]); setAssignments({}); setIteration(0); setIsPlaying(false); }}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Clear
                        </Button>
                        <Button variant="secondary" size="sm" onClick={initializeCentroids}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button variant="neon" className="w-full" onClick={step}>
                            <SkipForward className="mr-2 h-4 w-4" /> Step
                        </Button>
                        <Button variant={isPlaying ? "destructive" : "default"} className="w-full" onClick={() => setIsPlaying(!isPlaying)}>
                            <Play className="mr-2 h-4 w-4" /> {isPlaying ? "Pause" : "Auto Run"}
                        </Button>
                    </div>

                    <Card className="bg-muted/50 border-none">
                        <CardContent className="pt-4 text-xs text-muted-foreground">
                            1. Click to add points.<br />
                            2. Set K.<br />
                            3. 'Reset' to init centroids.<br />
                            4. 'Step' or 'Auto Run'.
                        </CardContent>
                    </Card>
                </div>
            );
        }

        if (setRightPanelContent) {
            setRightPanelContent(
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-primary">
                                {iteration === 0 ? "Ready" : iteration % 2 !== 0 ? "Assigning..." : "Updating Centroids..."}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Total Points: {points.length}</p>
                            <p className="text-xs text-muted-foreground">Iteration: {Math.floor(iteration / 2)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Centroids</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {centroids.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
                                    <span className="font-mono">C{i + 1}: ({c.x.toFixed(0)}, {c.y.toFixed(0)})</span>
                                </div>
                            ))}
                            {centroids.length === 0 && <span className="text-xs text-muted-foreground">No centroids initialized.</span>}
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }, [k, centroids, iteration, isPlaying, points.length, setLeftPanelContent, setRightPanelContent, step, initializeCentroids, assignments]);

    return (
        <div className="w-full h-full relative cursor-crosshair group overflow-hidden" onClick={handlePlaneClick}>
            {/* Background Grid */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Points */}
            <AnimatePresence>
                {points.map((p, i) => {
                    const assignedC = assignments[i];
                    const color = assignedC !== undefined && centroids[assignedC] ? centroids[assignedC].color : "#ffffff";

                    return (
                        <motion.div
                            key={`p-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                backgroundColor: color,
                                scale: 1,
                                opacity: 1
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute w-3 h-3 rounded-full -ml-[6px] -mt-[6px] shadow-[0_0_5px_currentColor] border border-white/20"
                            style={{ backgroundColor: color }}
                        />
                    );
                })}
            </AnimatePresence>

            {/* Centroids */}
            <AnimatePresence>
                {centroids.map((c, i) => (
                    <motion.div
                        key={`c-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            left: `${c.x}%`,
                            top: `${c.y}%`,
                            opacity: 1,
                            scale: 1
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-white rounded-full flex items-center justify-center z-10 shadow-[0_0_15px_currentColor]"
                        style={{ backgroundColor: c.color, boxShadow: `0 0 20px -5px ${c.color}` }}
                    >
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </motion.div>
                ))}
            </AnimatePresence>

            {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                    <div className="flex flex-col items-center text-muted-foreground animate-pulse">
                        <MousePointer2 className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">Click anywhere to add data points</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KMeansLab;
