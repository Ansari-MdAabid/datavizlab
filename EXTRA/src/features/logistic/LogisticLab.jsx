import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper: Sigmoid
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

const LogisticLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [hours, setHours] = useState(5.0);

    // Model Parameters (Trained on some hypothetical data)
    // B0 = -4, B1 = 0.8 => Tipping point at 5 hours
    const b0 = -4;
    const b1 = 0.8;

    const z = b0 + (b1 * hours);
    const probability = sigmoid(z);
    const isPass = probability >= 0.5;

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Study Hours</span>
                        <span className="text-xl font-bold text-primary">{hours.toFixed(1)} hrs</span>
                    </div>
                    <Slider
                        value={[hours]}
                        onValueChange={(vals) => setHours(vals[0])}
                        min={0} max={10} step={0.1}
                        className="py-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        Drag slightly to see how probability shifts. Notice the tipping point around 5 hours.
                    </p>
                </div>

                <Card className="bg-muted/50 border-none">
                    <CardContent className="pt-4 text-xs text-muted-foreground">
                        <strong>Model:</strong><br />
                        P(Pass) = 1 / (1 + e<sup>-(b0 + b1*x)</sup>)<br />
                        b0 = -4, b1 = 0.8
                    </CardContent>
                </Card>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Prediction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={cn(
                                "py-4 px-2 rounded-lg text-center text-white font-bold text-2xl transition-all duration-300 shadow-lg",
                                isPass ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"
                            )}
                        >
                            {isPass ? "PASS" : "FAIL"}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Probability:</span>
                            <span className="font-mono font-bold">{(probability * 100).toFixed(1)}%</span>
                        </div>

                        {/* Probability Bar */}
                        <div className="w-full h-4 bg-secondary rounded-full overflow-hidden relative border border-border">
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-foreground/50 z-10" title="Threshold" />
                            <motion.div
                                className={cn("h-full", isPass ? "bg-green-500" : "bg-red-500")}
                                initial={{ width: 0 }}
                                animate={{ width: `${probability * 100}%` }}
                                transition={{ type: "spring", stiffness: 100 }}
                            />
                        </div>

                        <div className="text-xs text-muted-foreground flex justify-between">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-start gap-2 text-sm p-4 rounded-lg bg-card/50 border border-border">
                    {isPass ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    <div>
                        <p className="font-semibold">{isPass ? "Threshold Met" : "Below Threshold"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Since the probability is {isPass ? ">= 50%" : "< 50%"}, the model classifies this student as <strong>{isPass ? "Class 1 (Pass)" : "Class 0 (Fail)"}</strong>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }, [hours, probability, isPass, z, setLeftPanelContent, setRightPanelContent]);

    // Points for curve
    const curvePoints = [];
    for (let x = 0; x <= 100; x += 1) {
        const h = x / 10;
        const p = sigmoid(b0 + (b1 * h));
        curvePoints.push(`${x},${100 - (p * 100)}`); // Flip Y
    }
    const curvePath = `M ${curvePoints[0]} L ${curvePoints.join(' L ')}`;

    const dotX = (hours / 10) * 100;
    const dotY = 100 - (probability * 100);

    return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-8">
            {/* Graph Container */}
            <div className="w-full max-w-2xl h-64 relative border-l border-b border-foreground/20">

                {/* Grid X */}
                <div className="absolute left-0 right-0 bottom-0 h-px bg-foreground/20 translate-y-1/2" />
                {/* Grid Y - Threshold */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-foreground/10 border-t border-dashed border-foreground/30" />

                {/* SVG Curve */}
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="1" vectorEffect="non-scaling-stroke" />

                    {/* User Dot */}
                    <motion.circle
                        cx={dotX}
                        cy={dotY}
                        r="2"
                        fill={isPass ? "#22c55e" : "#ef4444"}
                        stroke="white"
                        strokeWidth="0.5"
                        animate={{ cx: dotX, cy: dotY, fill: isPass ? "#22c55e" : "#ef4444" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                </svg>

                {/* Labels */}
                <span className="absolute -left-8 top-0 text-xs text-muted-foreground">1.0</span>
                <span className="absolute -left-8 bottom-0 text-xs text-muted-foreground">0.0</span>
                <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">0.5</span>

                <span className="absolute left-0 -bottom-6 text-xs text-muted-foreground">0h</span>
                <span className="absolute right-0 -bottom-6 text-xs text-muted-foreground">10h</span>
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-xs text-muted-foreground">Study Hours</span>
            </div>
        </div>
    );
};

export default LogisticLab;
