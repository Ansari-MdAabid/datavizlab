import React from 'react';
import { motion } from 'framer-motion';
import { Info, Code2, Rocket, Palette } from 'lucide-react';

const About = () => {
    return (
        <div className="max-w-4xl w-full p-8 space-y-12">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
            >
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Info className="mr-2 h-4 w-4" />
                    About the Project
                </div>
                <h1 className="text-5xl font-bold tracking-tight">Interactive Learning</h1>
                <p className="text-xl text-muted-foreground">
                    DataViz Lab is an experimental platform designed to make Machine Learning concepts tangible through high-fidelity, real-time visualizations.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                    {
                        icon: Rocket,
                        title: "Performance",
                        desc: "Built with Vite and React for ultra-responsive interaction. No server-side processing for instant feedback."
                    },
                    {
                        icon: Palette,
                        title: "Design System",
                        desc: "Modern aesthetics utilizing glassmorphism, neon glows, and custom CSS animations for a premium experience."
                    },
                    {
                        icon: Code2,
                        title: "Algorithm Implementation",
                        desc: "Native JavaScript implementations of core ML algorithms, optimized for browser-based visualization."
                    },
                    {
                        icon: Info,
                        title: "Educational Goal",
                        desc: "Bridging the gap between mathematical theory and visual understanding for students and researchers."
                    }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, opacity: 0 }}
                        whileInView={{ opacity: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card/20 border border-border/40 p-6 rounded-3xl backdrop-blur-md"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default About;
