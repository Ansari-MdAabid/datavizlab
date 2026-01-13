import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Settings, Eye, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainLayout = ({ leftPanel, rightPanel, children, showSidebars = true, noPadding = false }) => {
    const [mobileTab, setMobileTab] = useState('visual'); // 'controls', 'visual', 'math'

    return (
        <div className="flex flex-col xl:flex-row h-screen w-full overflow-hidden bg-background pt-16 xl:pt-20 pb-16 xl:pb-0">
            {/* Left Sidebar (Controls) */}
            {showSidebars && (
                <aside className={cn(
                    "w-full xl:w-80 border-b xl:border-b-0 xl:border-r border-border bg-card/30 backdrop-blur-xl p-4 flex-col gap-4 overflow-y-auto z-10",
                    mobileTab === 'controls' ? "flex flex-1" : "hidden xl:flex"
                )}>
                    <h2 className="text-xl font-bold text-primary mb-4 hidden xl:block">Controls</h2>
                    <h2 className="text-lg font-bold text-primary mb-2 xl:hidden text-center">Algorithm Controls</h2>
                    {leftPanel}
                </aside>
            )}

            {/* Main Content (Visual) */}
            <main className={cn(
                "flex-1 relative flex items-center justify-center p-4 xl:p-8 overflow-hidden",
                mobileTab === 'visual' ? "flex" : "hidden xl:flex"
            )}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
                <div className={cn(
                    "z-0 w-full h-full flex flex-col items-center justify-start border border-border/50 rounded-xl bg-black/20 backdrop-blur-sm shadow-2xl relative overflow-y-auto custom-scrollbar",
                    !noPadding && "p-4 xl:p-12"
                )}>
                    {children}
                </div>
            </main>

            {/* Right Sidebar (Math/Info) */}
            {showSidebars && (
                <aside className={cn(
                    "w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-border bg-card/30 backdrop-blur-xl p-4 flex-col gap-4 overflow-y-auto z-10",
                    mobileTab === 'math' ? "flex flex-1" : "hidden xl:flex"
                )}>
                    <h2 className="text-xl font-bold text-accent-foreground mb-4 hidden xl:block">Live Math</h2>
                    <h2 className="text-lg font-bold text-accent-foreground mb-2 xl:hidden text-center">Live Statistics</h2>
                    {rightPanel}
                </aside>
            )}

            {/* Mobile Tab Bar */}
            {showSidebars && (
                <div className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border flex items-center justify-around z-50 px-2">
                    <Button
                        variant={mobileTab === 'controls' ? 'secondary' : 'ghost'}
                        className="flex-1 flex flex-col gap-1 h-full rounded-none"
                        onClick={() => setMobileTab('controls')}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px] uppercase font-bold">Controls</span>
                    </Button>
                    <Button
                        variant={mobileTab === 'visual' ? 'secondary' : 'ghost'}
                        className="flex-1 flex flex-col gap-1 h-full rounded-none"
                        onClick={() => setMobileTab('visual')}
                    >
                        <Eye className="w-5 h-5" />
                        <span className="text-[10px] uppercase font-bold">Visual</span>
                    </Button>
                    <Button
                        variant={mobileTab === 'math' ? 'secondary' : 'ghost'}
                        className="flex-1 flex flex-col gap-1 h-full rounded-none"
                        onClick={() => setMobileTab('math')}
                    >
                        <Calculator className="w-5 h-5" />
                        <span className="text-[10px] uppercase font-bold">Math</span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
