import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Settings, Eye, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainLayout = ({ leftPanel, rightPanel, bottomPanel, children, showSidebars = true, noPadding = false }) => {
    const [mobileTab, setMobileTab] = useState('visual'); // 'controls', 'visual', 'math'

    return (
        <div className="flex flex-col xl:flex-row h-screen w-full overflow-hidden bg-background pt-16 xl:pt-20 pb-16 xl:pb-0">
            {/* Left Sidebar (Navigation Only) */}
            {showSidebars && (
                <aside className={cn(
                    "w-full xl:w-80 border-b xl:border-b-0 xl:border-r border-border bg-card/30 backdrop-blur-xl p-4 flex-col gap-4 overflow-y-auto z-10",
                    mobileTab === 'controls' ? "flex flex-1" : "hidden xl:flex"
                )}>
                    <h2 className="text-xl font-bold text-primary mb-4 hidden xl:block">Algorithms</h2>
                    <h2 className="text-lg font-bold text-primary mb-2 xl:hidden text-center">Select Algorithm</h2>
                    {leftPanel}

                    {/* On Mobile, show controls below navigation in the same tab */}
                    <div className="xl:hidden mt-8 pt-8 border-t border-border">
                        <h2 className="text-lg font-bold text-primary mb-2 text-center">Controls</h2>
                        {bottomPanel}
                    </div>
                </aside>
            )}

            {/* Main Content (Visual + Bottom Controls) */}
            <main className={cn(
                "flex-1 relative flex flex-col items-center justify-start p-4 xl:p-8 overflow-hidden gap-4",
                mobileTab === 'visual' ? "flex" : "hidden xl:flex"
            )}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

                {/* Visualization Area */}
                <div className={cn(
                    "z-0 w-full flex-1 flex flex-col items-center justify-start border border-border/50 rounded-xl bg-black/20 backdrop-blur-sm shadow-2xl relative overflow-y-auto custom-scrollbar",
                    !noPadding && "p-4 xl:p-12"
                )}>
                    {children}
                </div>

                {/* Bottom Controls Area (Desktop Only - on mobile it's in the Controls tab) */}
                <div className="w-full hidden xl:block bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-6 shadow-lg animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="flex items-center gap-2 mb-4 border-b border-border/30 pb-2">
                        <Settings className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Experiment Controls</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bottomPanel}
                    </div>
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
