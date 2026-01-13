import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PCALab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [angle, setAngle] = useState(0); // Degrees

    // Fake data blob
    const initialPoints = Array.from({ length: 20 }).map((_, i) => ({
        x: 30 + Math.random() * 40 + (i * 1.5),
        y: 30 + Math.random() * 40 + (i * 1.5)
    }));
    const [points, setPoints] = useState(initialPoints);

    // Calculate Variance
    const rad = (angle * Math.PI) / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);

    let variance = 0;
    points.forEach(p => {
        const cx = p.x - 50;
        const cy = p.y - 50;
        const projection = cx * ux + cy * uy;
        variance += projection * projection;
    });

    const maxVar = 1500 * points.length; // rough normalization
    const varPercent = Math.min(100, (variance / maxVar) * 100);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints([...points, { x, y }]);
    };

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Rotation Angle</span>
                            <span className="font-mono text-sm">{angle}°</span>
                        </div>
                        <Slider value={[angle]} onValueChange={v => setAngle(v[0])} min={0} max={180} step={1} />
                    </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setPoints(initialPoints)}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span>Captured Variance</span>
                            <span>{varPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${varPercent}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }, [angle, varPercent, points, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-[500px] aspect-square bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl cursor-crosshair" onClick={handleCanvasClick}>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    {/* Rotating Line */}
                    <line
                        x1="50" y1="50"
                        x2={50 + Math.cos(rad) * 100}
                        y2={50 + Math.sin(rad) * 100}
                        stroke="rgba(255,255,255,0.2)" strokeWidth="1"
                    />
                    <line
                        x1="50" y1="50"
                        x2={50 - Math.cos(rad) * 100}
                        y2={50 - Math.sin(rad) * 100}
                        stroke="rgba(255,255,255,0.2)" strokeWidth="1"
                    />

                    {/* Principal Component Line (Highlighted) */}
                    <line
                        x1={50 - Math.cos(rad) * 40} y1={50 - Math.sin(rad) * 40}
                        x2={50 + Math.cos(rad) * 40} y2={50 + Math.sin(rad) * 40}
                        stroke="#3b82f6" strokeWidth="2"
                        strokeDasharray="4"
                    />

                    {points.map((p, i) => {
                        const cx = p.x - 50;
                        const cy = p.y - 50;
                        const projLen = cx * ux + cy * uy;
                        const px = 50 + projLen * ux;
                        const py = 50 + projLen * uy;

                        return (
                            <g key={i}>
                                <circle cx={p.x} cy={p.y} r="2" fill="white" opacity="0.8" />
                                <line x1={p.x} y1={p.y} x2={px} y2={py} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                                <circle cx={px} cy={py} r="1.5" fill="#3b82f6" />
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default PCALab;
