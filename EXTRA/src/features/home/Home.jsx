import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Network, BarChart2, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = ({ onGetStarted }) => {
    return (
        <div className="max-w-4xl w-full space-y-12 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
            >
                <h1 className="text-6xl font-black tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-accent-foreground">
                        DataViz Lab
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Interactive Machine Learning & Data Mining Visualizations. Explore algorithms in real-time with zero setup.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center"
            >
                <Button
                    variant="neon"
                    size="lg"
                    className="h-16 px-10 text-lg rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] transition-all"
                    onClick={() => onGetStarted('labs')}
                >
                    <MousePointer2 className="mr-2 h-5 w-5" />
                    Enter the Labs
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                    { icon: Brain, title: "Classification", desc: "Understand patterns with SVM, KNN, and Decision Trees." },
                    { icon: Network, title: "Clustering", desc: "Visualize groupings with K-Means and DBSCAN." },
                    { icon: BarChart2, title: "Regression", desc: "Predict trends using Linear and Logistic models." }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="p-6 rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm hover:border-primary/50 transition-colors group"
                    >
                        <feature.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
