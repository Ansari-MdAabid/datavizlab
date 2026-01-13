import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const SVMLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const initialPoints = [
        { id: 1, x: 20, y: 80, label: 1 },
        { id: 2, x: 30, y: 70, label: 1 },
        { id: 4, x: 70, y: 30, label: -1 },
        { id: 5, x: 80, y: 20, label: -1 },
    ];

    const [points, setPoints] = useState(initialPoints);
    const [nextId, setNextId] = useState(10);
    const [activeClass, setActiveClass] = useState(1); // 1 (Cyan) or -1 (Pink)

    const svmResult = useMemo(() => {
        const class1 = points.filter(p => p.label === 1);
        const class2 = points.filter(p => p.label === -1);

        if (class1.length === 0 || class2.length === 0) return null;

        // Centroids
        const c1x = class1.reduce((sum, p) => sum + p.x, 0) / class1.length;
        const c1y = class1.reduce((sum, p) => sum + p.y, 0) / class1.length;
        const c2x = class2.reduce((sum, p) => sum + p.x, 0) / class2.length;
        const c2y = class2.reduce((sum, p) => sum + p.y, 0) / class2.length;

        // Midpoint
        const mx = (c1x + c2x) / 2;
        const my = (c1y + c2y) / 2;

        // Slope of line connecting centroids
        let mConnect = (c2y - c1y) / (c2x - c1x);
        if (mConnect === 0) mConnect = 0.001; // Avoid divide by zero

        // Slope of separating hyperplane (perpendicular)
        const m = -1 / mConnect;

        // Equation: y - my = m(x - mx) => y = mx - m*mx + my
        const b = my - (m * mx);

        // Margin calculation
        const dist = (p) => Math.abs(m * p.x - p.y + b) / Math.sqrt(m * m + 1);

        const margin1 = Math.min(...class1.map(dist));
        const margin2 = Math.min(...class2.map(dist));
        const margin = Math.min(margin1, margin2);

        return { m, b, margin, mx, my };
    }, [points]);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPoints([...points, { id: nextId, x, y, label: activeClass }]);
        setNextId(nextId + 1);
    };

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-4 animate-in slide-in-from-left">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Add Data Points</p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={activeClass === 1 ? 'default' : 'outline'}
                            className={activeClass === 1 ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-500 text-cyan-500'}
                            onClick={() => setActiveClass(1)}
                        >
                            Class A (Cyan)
                        </Button>
                        <Button
                            size="sm"
                            variant={activeClass === -1 ? 'default' : 'outline'}
                            className={activeClass === -1 ? 'bg-pink-500 hover:bg-pink-600' : 'border-pink-500 text-pink-500'}
                            onClick={() => setActiveClass(-1)}
                        >
                            Class B (Pink)
                        </Button>
                    </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Interactive Mode</p>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        <li><strong>Click</strong> on the canvas to add points.</li>
                        <li>Observe how the <strong>Hyperplane</strong> shifts to separate the classes.</li>
                    </ul>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setPoints(initialPoints)}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Data
                </Button>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardHeader><CardTitle className="text-sm">Model Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Data Points:</span>
                            <span className="font-mono">{points.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Margin Width:</span>
                            <span className="font-mono">{svmResult ? (svmResult.margin * 2).toFixed(1) : "0.0"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }, [svmResult, activeClass, points, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-[500px] aspect-square bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden shadow-2xl cursor-crosshair" onClick={handleCanvasClick}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '10% 10%' }} />

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {svmResult && (
                        <>
                            <line
                                x1="0" y1={svmResult.m * 0 + svmResult.b}
                                x2="100" y2={svmResult.m * 100 + svmResult.b}
                                stroke="white" strokeWidth="0.5"
                            />
                            <path d={`
                            M 0 ${svmResult.m * 0 + svmResult.b - svmResult.margin * Math.sqrt(svmResult.m * svmResult.m + 1)}
                            L 100 ${svmResult.m * 100 + svmResult.b - svmResult.margin * Math.sqrt(svmResult.m * svmResult.m + 1)}
                            L 100 ${svmResult.m * 100 + svmResult.b + svmResult.margin * Math.sqrt(svmResult.m * svmResult.m + 1)}
                            L 0 ${svmResult.m * 0 + svmResult.b + svmResult.margin * Math.sqrt(svmResult.m * svmResult.m + 1)}
                            Z
                         `} fill="white" fillOpacity="0.05" />
                        </>
                    )}

                    {points.map((p) => (
                        <motion.circle
                            key={p.id}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            cx={p.x} cy={p.y}
                            r="3"
                            fill={p.label === 1 ? "#06b6d4" : "#ec4899"}
                            stroke="white" strokeWidth="0.5"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default SVMLab;
