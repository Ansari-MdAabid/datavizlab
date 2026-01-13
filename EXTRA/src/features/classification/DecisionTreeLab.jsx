import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const DecisionTreeLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [points, setPoints] = useState([
        { x: 30, y: 30, label: 1 }, { x: 70, y: 70, label: -1 }
    ]);
    const [activeClass, setActiveClass] = useState(1);

    // Simple Split Logic (mocking ID3/C4.5)
    // For viz: Just find the best axis-aligned split that separates the classes mostly
    const split = React.useMemo(() => {
        if (points.length < 2) return null;

        // Cheat: Find midpoint between the mean of class 1 and mean of class 2
        const c1 = points.filter(p => p.label === 1);
        const c2 = points.filter(p => p.label === -1);
        if (c1.length === 0 || c2.length === 0) return null;

        const m1x = c1.reduce((s, p) => s + p.x, 0) / c1.length;
        const m2x = c2.reduce((s, p) => s + p.x, 0) / c2.length;
        const m1y = c1.reduce((s, p) => s + p.y, 0) / c1.length;
        const m2y = c2.reduce((s, p) => s + p.y, 0) / c2.length;

        // Pick axis with bigger separation
        if (Math.abs(m1x - m2x) > Math.abs(m1y - m2y)) {
            return { axis: 'x', val: (m1x + m2x) / 2 };
        } else {
            return { axis: 'y', val: (m1y + m2y) / 2 };
        }
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
                <Button variant="outline" className="w-full" onClick={() => setPoints([])}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>
        );
        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardContent className="pt-4 text-center">
                        {split ? (
                            <>
                                <div className="text-xl font-bold">Split Node</div>
                                <div className="font-mono mt-2 p-2 bg-secondary rounded">
                                    {split.axis.toUpperCase()} &gt; {split.val.toFixed(1)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    Separates Red vs Blue
                                </div>
                            </>
                        ) : (
                            <div className="text-muted-foreground text-sm">Add both classes to see a split.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }, [activeClass, split, points, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full max-w-[500px] aspect-square bg-slate-900 border border-slate-700 rounded-lg overflow-hidden cursor-crosshair" onClick={handleCanvasClick}>
                {/* Split Line */}
                {split && (
                    <div
                        className="absolute bg-white/30"
                        style={{
                            left: split.axis === 'x' ? `${split.val}%` : 0,
                            top: split.axis === 'y' ? `${split.val}%` : 0,
                            width: split.axis === 'x' ? '1px' : '100%',
                            height: split.axis === 'y' ? '1px' : '100%'
                        }}
                    />
                )}

                {/* Regions Hints */}
                {split && split.axis === 'x' && (
                    <>
                        <div className="absolute top-2 left-2 text-xs opacity-50">&lt; {split.val.toFixed(0)}</div>
                        <div className="absolute top-2 right-2 text-xs opacity-50">&gt; {split.val.toFixed(0)}</div>
                    </>
                )}

                {points.map((p, i) => (
                    <div key={i}
                        className={`absolute w-2 h-2 rounded-full ${p.label === 1 ? 'bg-cyan-500' : 'bg-pink-500'}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default DecisionTreeLab;
