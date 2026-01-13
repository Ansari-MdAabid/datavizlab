import React from 'react';
import { cn } from '@/lib/utils';

const MainLayout = ({ leftPanel, rightPanel, children, showSidebars = true, noPadding = false }) => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background pt-20">
            {/* Left Sidebar */}
            {showSidebars && (
                <aside className="w-80 border-r border-border bg-card/30 backdrop-blur-xl p-4 flex flex-col gap-4 overflow-y-auto z-10">
                    <h2 className="text-xl font-bold text-primary mb-4">Controls</h2>
                    {leftPanel}
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
                <div className={cn(
                    "z-0 w-full h-full flex flex-col items-center justify-start border border-border/50 rounded-xl bg-black/20 backdrop-blur-sm shadow-2xl relative overflow-y-auto custom-scrollbar",
                    !noPadding && "p-8 md:p-12"
                )}>
                    {children}
                </div>
            </main>

            {/* Right Sidebar */}
            {showSidebars && (
                <aside className="w-80 border-l border-border bg-card/30 backdrop-blur-xl p-4 flex flex-col gap-4 overflow-y-auto z-10">
                    <h2 className="text-xl font-bold text-accent-foreground mb-4">Live Math</h2>
                    {rightPanel}
                </aside>
            )}
        </div>
    );
};

export default MainLayout;
