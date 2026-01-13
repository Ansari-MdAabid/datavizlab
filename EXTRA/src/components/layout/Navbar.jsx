import React from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Home, Beaker, Info, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'labs', label: 'Labs', icon: Beaker },
        { id: 'theory', label: 'Theory', icon: BrainCircuit },
        { id: 'about', label: 'About', icon: Info },
        { id: 'contact', label: 'Contact', icon: Mail },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 xl:h-20 border-b border-border/40 bg-background/60 backdrop-blur-2xl px-4 xl:px-8 flex items-center justify-between">
            <div
                className="flex items-center gap-2 xl:gap-3 cursor-pointer group"
                onClick={() => setActiveView('home')}
            >
                <div className="h-8 w-8 xl:h-10 xl:w-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110 transition-transform">
                    <BrainCircuit className="text-primary-foreground h-5 w-5 xl:h-6 xl:w-6" />
                </div>
                <div>
                    <h1 className="text-lg xl:text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
                        DataViz Lab
                    </h1>
                    <p className="text-[8px] xl:text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-60">
                        Interactive Science
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 xl:gap-2 p-1 bg-card/20 border border-border/30 rounded-2xl backdrop-blur-md overflow-x-auto max-w-[50vw] xl:max-w-none scrollbar-hide">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                        size="sm"
                        className={cn(
                            "h-8 xl:h-10 px-3 xl:px-6 rounded-xl transition-all",
                            activeView === item.id
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                        onClick={() => setActiveView(item.id)}
                    >
                        <item.icon className={cn("xl:mr-2 h-4 w-4", activeView === item.id ? "text-primary" : "opacity-60")} />
                        <span className="hidden xl:inline">{item.label}</span>
                    </Button>
                ))}
            </div>


        </nav>
    );
};

export default Navbar;
