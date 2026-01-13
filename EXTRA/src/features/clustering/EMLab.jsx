import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, SkipForward, MousePointer2, Info, Activity, Zap, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper: Matrix operations for 2x2 covariance confidence ellipses
const getEllipseProps = (cov, mean) => {
    const a = cov[0][0];
    const b = cov[0][1];
    const c = cov[1][0];
    const d = cov[1][1];

    // Eigenvalues of [[a, b], [c, d]]
    const trace = a + d;
    const det = a * d - b * c;
    const disc = Math.sqrt(Math.max(0, Math.pow(trace, 2) / 4 - det));
    const lambda1 = trace / 2 + disc;
    const lambda2 = trace / 2 - disc;

    // Angle of rotation
    let theta = 0;
    if (Math.abs(b) < 1e-9) {
        theta = a >= d ? 0 : Math.PI / 2;
    } else {
        theta = Math.atan2(lambda1 - a, b);
    }

    return {
        cx: mean.x,
        cy: mean.y,
        rx1: Math.sqrt(Math.max(0, lambda1)), // 1-sigma
        ry1: Math.sqrt(Math.max(0, lambda2)),
        rx2: Math.sqrt(Math.max(0, lambda1)) * 2, // 2-sigma
        ry2: Math.sqrt(Math.max(0, lambda2)) * 2,
        angle: (theta * 180) / Math.PI,
    };
};

const EMLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [points, setPoints] = useState([
        { x: 30, y: 30 }, { x: 32, y: 33 }, { x: 28, y: 35 }, { x: 35, y: 31 },
        { x: 70, y: 70 }, { x: 75, y: 72 }, { x: 68, y: 78 }, { x: 72, y: 68 },
        { x: 50, y: 50 }
    ]);
    const [k, setK] = useState(2);
    const [clusters, setClusters] = useState([]);
    const [iteration, setIteration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [responsibilities, setResponsibilities] = useState([]); // [pointIdx][clusterIdx]
    const [stepType, setStepType] = useState('init'); // 'init', 'e-step', 'm-step'

    const clusterColors = ['#00f2ff', '#ff0055', '#7000ff', '#ffcc00', '#00ff99'];

    // Initialize clusters using points as initial means
    const initialize = useCallback(() => {
        if (points.length < k) return;

        const newClusters = [];
        const indices = new Set();
        while (indices.size < k) {
            indices.add(Math.floor(Math.random() * points.length));
        }

        const selectedPoints = Array.from(indices).map(idx => points[idx]);

        selectedPoints.forEach((p, i) => {
            newClusters.push({
                mean: { x: p.x + (Math.random() - 0.5) * 5, y: p.y + (Math.random() - 0.5) * 5 },
                cov: [[20, 0], [0, 20]],
                weight: 1 / k,
                color: clusterColors[i % clusterColors.length]
            });
        });

        setClusters(newClusters);
        setIteration(0);
        setResponsibilities([]);
        setStepType('e-step');
    }, [k, points]);

    // Multivariate Gaussian PDF
    const gaussianPdf = (p, cluster) => {
        const dx = p.x - cluster.mean.x;
        const dy = p.y - cluster.mean.y;
        const [[a, b], [c, d]] = cluster.cov;

        const det = a * d - b * c;
        if (det < 1e-6) return 0; // Prevent division by zero/singularity

        const inv = [
            [d / det, -b / det],
            [-c / det, a / det]
        ];

        const exponent = -0.5 * (
            dx * (dx * inv[0][0] + dy * inv[1][0]) +
            dy * (dx * inv[0][1] + dy * inv[1][1])
        );

        return (1 / (2 * Math.PI * Math.sqrt(det))) * Math.exp(exponent);
    };

    const runEStep = useCallback(() => {
        if (clusters.length === 0) return;

        const newResps = points.map(p => {
            const weights = clusters.map(c => c.weight * gaussianPdf(p, c));
            const sum = weights.reduce((a, b) => a + b, 0);

            if (sum < 1e-10) return clusters.map(() => 1 / k);
            return weights.map(w => w / sum);
        });

        setResponsibilities(newResps);
        setStepType('m-step');
    }, [clusters, points, k]);

    const runMStep = useCallback(() => {
        if (responsibilities.length === 0) return;

        const n = points.length;
        const newClusters = clusters.map((c, j) => {
            let sumResp = 0;
            let mean = { x: 0, y: 0 };

            responsibilities.forEach((resp, i) => {
                sumResp += resp[j];
                mean.x += resp[j] * points[i].x;
                mean.y += resp[j] * points[i].y;
            });

            if (sumResp < 1e-3) return c; // Avoid cluster collapse

            mean.x /= sumResp;
            mean.y /= sumResp;

            let cov = [[0, 0], [0, 0]];
            responsibilities.forEach((resp, i) => {
                const dx = points[i].x - mean.x;
                const dy = points[i].y - mean.y;
                cov[0][0] += resp[j] * dx * dx;
                cov[0][1] += resp[j] * dx * dy;
                cov[1][0] += resp[j] * dy * dx;
                cov[1][1] += resp[j] * dy * dy;
            });

            cov[0][0] = (cov[0][0] / sumResp) + 0.5; // Regularization for stability
            cov[0][1] /= sumResp;
            cov[1][0] /= sumResp;
            cov[1][1] = (cov[1][1] / sumResp) + 0.5;

            return {
                ...c,
                mean,
                cov,
                weight: sumResp / n
            };
        });

        setClusters(newClusters);
        setIteration(prev => prev + 1);
        setStepType('e-step');
    }, [responsibilities, points, clusters]);

    const handleStep = useCallback(() => {
        if (stepType === 'e-step') runEStep();
        else if (stepType === 'm-step') runMStep();
        else initialize();
    }, [stepType, runEStep, runMStep, initialize]);

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(handleStep, 800);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, handleStep]);

    // Helper: Blend colors based on responsibilities
    const getBlendedColor = useCallback((resps) => {
        if (!resps || !clusters.length) return '#64748b';
        let r = 0, g = 0, b = 0;
        let total = 0;
        resps.forEach((resp, i) => {
            if (!clusters[i]) return;
            const hex = clusters[i].color;
            const rr = parseInt(hex.slice(1, 3), 16);
            const gg = parseInt(hex.slice(3, 5), 16);
            const bb = parseInt(hex.slice(5, 7), 16);
            r += rr * resp;
            g += gg * resp;
            b += bb * resp;
            total += resp;
        });
        if (total < 0.1) return '#64748b';
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }, [clusters]);

    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPoints(p => [...p, { x, y }]);
    };

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        GMM Config
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-black uppercase tracking-tighter opacity-70">Components (K)</label>
                                <span className="text-lg font-black text-primary">{k}</span>
                            </div>
                            <Slider
                                value={[k]}
                                onValueChange={v => setK(v[0])}
                                min={2}
                                max={5}
                                step={1}
                                className="py-4"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                            setPoints([]);
                            setClusters([]);
                            setResponsibilities([]);
                            setIteration(0);
                            setStepType('init');
                        }}>
                            Clear Points
                        </Button>
                        <Button variant="secondary" size="sm" className="rounded-xl" onClick={initialize}>
                            Reset GMM
                        </Button>
                    </div>
                </div>

                <div className="p-1 rounded-2xl bg-black/20 border border-white/5 overflow-hidden">
                    <Button
                        variant={isPlaying ? "destructive" : "neon"}
                        className="w-full h-14 rounded-xl shadow-lg transition-all"
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={points.length < k}
                    >
                        {isPlaying ? <Zap className="mr-2 h-4 w-4 fill-white animate-pulse" /> : <Play className="mr-2 h-4 w-4" />}
                        {isPlaying ? "HALT PROCESSING" : "START AUTO-LOOP"}
                    </Button>
                </div>

                <Button variant="ghost" className="w-full h-12 rounded-xl border border-border/50" onClick={handleStep} disabled={points.length < k}>
                    <SkipForward className="mr-2 h-4 w-4" /> Manual Step
                </Button>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-widest opacity-60 flex items-center gap-2">
                            <Layers className="h-3 w-3" />
                            EM Pipeline State
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-black text-primary tracking-tighter uppercase italic">
                            {stepType === 'e-step' ? 'Expectation' : stepType === 'm-step' ? 'Maximization' : 'Ready'}
                            <span className="block text-[10px] not-italic font-black text-muted-foreground tracking-widest mt-1">Iteration #{iteration}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-black/20 text-[11px] leading-relaxed text-muted-foreground border border-white/5">
                            {points.length < k ? `Add at least ${k} points to start.` :
                                stepType === 'e-step' ? "Calculating degrees of membership for each point across all distributions." :
                                    "Updating Gaussian parameters (mean, covariance, weight) based on expectations."
                            }
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Info className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        The <strong>soft blending</strong> of colors shows how much each point is "claimed" by the different Gaussian components.
                    </p>
                </div>
            </div>
        );
    }, [k, iteration, isPlaying, stepType, points.length, setLeftPanelContent, setRightPanelContent, handleStep, initialize]);

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-slate-950/40 backdrop-blur-sm relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <motion.div
                layout
                className="relative w-full max-w-[650px] aspect-square bg-slate-900/40 border border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden cursor-crosshair group"
                onClick={handleCanvasClick}
            >
                <svg className="w-full h-full p-6" viewBox="0 0 100 100">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Confidence Ellipses */}
                    <AnimatePresence>
                        {clusters.map((c, i) => {
                            const props = getEllipseProps(c.cov, c.mean);
                            if (isNaN(props.cx) || isNaN(props.cy) || isNaN(props.rx1) || isNaN(props.ry1)) return null;

                            return (
                                <g key={`cluster-${i}`}>
                                    {/* 2-sigma boundary */}
                                    <motion.ellipse
                                        initial={{
                                            cx: props.cx,
                                            cy: props.cy,
                                            rx: 0,
                                            ry: 0,
                                            opacity: 0,
                                            rotate: props.angle
                                        }}
                                        animate={{
                                            cx: props.cx,
                                            cy: props.cy,
                                            rx: props.rx2,
                                            ry: props.ry2,
                                            rotate: props.angle,
                                            opacity: 0.15,
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        fill={c.color}
                                        stroke={c.color}
                                        strokeWidth="0.2"
                                        strokeDasharray="1 1"
                                        style={{
                                            originX: `${props.cx}px`,
                                            originY: `${props.cy}px`
                                        }}
                                    />
                                    {/* 1-sigma boundary */}
                                    <motion.ellipse
                                        initial={{
                                            cx: props.cx,
                                            cy: props.cy,
                                            rx: 0,
                                            ry: 0,
                                            opacity: 0,
                                            rotate: props.angle
                                        }}
                                        animate={{
                                            cx: props.cx,
                                            cy: props.cy,
                                            rx: props.rx1,
                                            ry: props.ry1,
                                            rotate: props.angle,
                                            opacity: 0.3,
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        fill={c.color}
                                        stroke={c.color}
                                        strokeWidth="0.5"
                                        style={{
                                            originX: `${props.cx}px`,
                                            originY: `${props.cy}px`
                                        }}
                                    />
                                    {/* Mean point */}
                                    <motion.circle
                                        initial={{ cx: props.cx, cy: props.cy, opacity: 0 }}
                                        animate={{ cx: c.mean.x, cy: c.mean.y, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        r="1"
                                        fill="white"
                                        className="shadow-xl"
                                        filter="url(#glow)"
                                    />
                                </g>
                            );
                        })}
                    </AnimatePresence>

                    {/* Data Points */}
                    {points.map((p, i) => {
                        const pointColor = getBlendedColor(responsibilities[i]);

                        return (
                            <motion.g
                                key={`point-${i}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="1.2"
                                    fill={pointColor}
                                    className="transition-colors duration-700 hover:r-[1.5]"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="0.3"
                                />
                                {responsibilities[i] && (
                                    <circle
                                        cx={p.x} cy={p.y} r="2.5"
                                        fill="none"
                                        stroke={pointColor}
                                        strokeWidth="0.1"
                                        className="opacity-40"
                                    />
                                )}
                            </motion.g>
                        );
                    })}

                    {points.length === 0 && (
                        <text x="50" y="50" textAnchor="middle" className="fill-white/20 text-[3px] font-black uppercase tracking-widest pointer-events-none">
                            Populate Canvas to Begin Simulation
                        </text>
                    )}
                </svg>

                {/* Status Bar */}
                <div className="absolute bottom-6 right-8 left-8 flex justify-between items-center px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full animate-pulse", stepType !== 'init' ? 'bg-green-500' : 'bg-yellow-500')} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Engine: Active</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Density Model v2.0</span>
                </div>
            </motion.div>
        </div>
    );
};

export default EMLab;
