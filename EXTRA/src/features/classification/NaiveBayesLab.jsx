import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const NaiveBayesLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [points, setPoints] = useState([
        { x: 30, y: 30, label: 1 }, { x: 35, y: 35, label: 1 }, { x: 25, y: 35, label: 1 },
        { x: 70, y: 70, label: -1 }, { x: 75, y: 75, label: -1 }, { x: 70, y: 80, label: -1 }
    ]);
    const [activeClass, setActiveClass] = useState(1);

    // Compute Gaussian stats (Mean & Variance) for X and Y per class
    const stats = useMemo(() => {
        const getStats = (pList) => {
            if (pList.length === 0) return null;
            const meanX = pList.reduce((s, p) => s + p.x, 0) / pList.length;
            const meanY = pList.reduce((s, p) => s + p.y, 0) / pList.length;
            // Approx radius using std dev
            const varX = pList.reduce((s, p) => s + Math.pow(p.x - meanX, 2), 0) / pList.length;
            const varY = pList.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0) / pList.length;
            const rx = Math.sqrt(varX) * 2.5 || 5; // 2.5 sigma
            const ry = Math.sqrt(varY) * 2.5 || 5;
            return { cx: meanX, cy: meanY, rx, ry };
        };

        return {
            c1: getStats(points.filter(p => p.label === 1)),
            c2: getStats(points.filter(p => p.label === -1))
        };
    }, [points]);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y, label: activeClass }]);
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
                <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                    <p><strong>Gaussian Naive Bayes</strong> fits a probability distribution to each class.</p>
                    <p className="mt-2 text-xs">More points &rarr; More accurate mean/variance.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setPoints([])}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Clear
                </Button>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardHeader><CardTitle className="text-sm">Probabilities</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-xs">
                        {stats.c1 && (
                            <div className="border-l-2 border-cyan-500 pl-2">
                                <div className="font-bold">Class A</div>
                                <div>Mean: ({stats.c1.cx.toFixed(0)}, {stats.c1.cy.toFixed(0)})</div>
                            </div>
                        )}
                        {stats.c2 && (
                            <div className="border-l-2 border-pink-500 pl-2">
                                <div className="font-bold">Class B</div>
                                <div>Mean: ({stats.c2.cx.toFixed(0)}, {stats.c2.cy.toFixed(0)})</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }, [activeClass, stats, points, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full max-w-[500px] aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden cursor-crosshair" onClick={handleCanvasClick}>
                {/* Class A Gaussian */}
                {stats.c1 && (
                    <motion.div
                        initial={false}
                        animate={{
                            left: `${stats.c1.cx}%`, top: `${stats.c1.cy}%`,
                            width: `${stats.c1.rx * 2}%`, height: `${stats.c1.ry * 2}%`
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 border border-cyan-500/50 bg-cyan-500/10 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300"
                    />
                )}

                {/* Class B Gaussian */}
                {stats.c2 && (
                    <motion.div
                        initial={false}
                        animate={{
                            left: `${stats.c2.cx}%`, top: `${stats.c2.cy}%`,
                            width: `${stats.c2.rx * 2}%`, height: `${stats.c2.ry * 2}%`
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 border border-pink-500/50 bg-pink-500/10 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.1)] transition-all duration-300"
                    />
                )}

                {/* Points */}
                {points.map((p, i) => (
                    <div key={i}
                        className={`absolute w-1.5 h-1.5 rounded-full ${p.label === 1 ? 'bg-cyan-500' : 'bg-pink-500'}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default NaiveBayesLab;
