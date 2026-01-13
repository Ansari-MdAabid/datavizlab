import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Image as ImageIcon } from 'lucide-react';

const SVDLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [components, setComponents] = useState(10);

    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-6 animate-in slide-in-from-left">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Singular Values (k)</span>
                            <span className="font-mono text-sm">{components}</span>
                        </div>
                        <Slider value={[components]} onValueChange={v => setComponents(v[0])} min={1} max={50} step={1} />
                        <p className="text-xs text-muted-foreground mt-2">
                            Lower 'k' keeps only the most important features (blurrier image). Higher 'k' restores detail.
                        </p>
                    </div>
                </div>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardContent className="pt-6 text-center space-y-2">
                        <div className="text-xl font-bold">Compression Ratio</div>
                        <div className="text-3xl font-mono text-primary">{(100 - (components / 50) * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Space Saved</div>
                    </CardContent>
                </Card>
            </div>
        );
    }, [components, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-8">
            <div className="relative w-64 h-64 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
                {/* Simulated Blur based on slider */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
                    style={{ filter: `blur(${Math.max(0, (50 - components) / 2)}px)` }}
                />
                <ImageIcon className="w-32 h-32 text-white/50 relative z-10 mix-blend-overlay" />
                <div className="absolute bottom-2 right-2 font-mono text-xs text-white/80 bg-black/50 px-2 rounded">
                    k={components}
                </div>
            </div>
            <div className="text-sm text-muted-foreground">Original Image (50x50 matrix) vs Reconstructed (Rank k)</div>
        </div>
    );
};

export default SVDLab;
