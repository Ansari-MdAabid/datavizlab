import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Database, ArrowRight, TrendingUp, Network, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    parseTransactions,
    runFPGrowthFull,
    sampleDatasets
} from '@/utils/fpGrowthAlgorithm';

const FPGrowthLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [datasetText, setDatasetText] = useState(sampleDatasets.marketBasket);
    const [minSupport, setMinSupport] = useState(40);
    const [minConfidence, setMinConfidence] = useState(60);
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const runAlgorithm = () => {
        setIsLoading(true);
        setHasRun(false);

        // setTimeout allows the UI to render the loading state before the CPU-heavy task starts
        setTimeout(() => {
            try {
                const transactions = parseTransactions(datasetText);
                if (transactions.length === 0) {
                    alert('Please enter valid dataset.');
                    setIsLoading(false);
                    return;
                }

                const output = runFPGrowthFull(transactions, minSupport / 100, minConfidence / 100);
                setResults(output);
                setHasRun(true);
            } catch (err) {
                console.error(err);
                alert('An error occurred. Check the console.');
            } finally {
                setIsLoading(false);
            }
        }, 100);
    };

    const loadSample = (key) => {
        setDatasetText(sampleDatasets[key]);
        setHasRun(false);
    };

    // UI Content for panels
    useEffect(() => {
        setLeftPanelContent(
            <div className="space-y-4 animate-in slide-in-from-left">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Dataset Input
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            value={datasetText}
                            onChange={(e) => { setDatasetText(e.target.value); setHasRun(false); }}
                            className="w-full h-32 p-2 bg-slate-800 border border-slate-600 rounded text-xs font-mono resize-none focus:ring-1 focus:ring-primary"
                            placeholder="Enter transactions (one per line, comma separated)"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {Object.keys(sampleDatasets).map(key => (
                                <Button key={key} size="sm" variant="outline" className="text-[10px] h-7" onClick={() => loadSample(key)}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Algorithm Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Min Support</span>
                                <span className="text-primary font-bold">{minSupport}%</span>
                            </div>
                            <input type="range" min="5" max="100" value={minSupport} onChange={e => setMinSupport(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Min Confidence</span>
                                <span className="text-primary font-bold">{minConfidence}%</span>
                            </div>
                            <input type="range" min="5" max="100" value={minConfidence} onChange={e => setMinConfidence(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                        <Button className="w-full" onClick={runAlgorithm} disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Mining...
                                </span>
                            ) : (
                                <><Play className="w-4 h-4 mr-2" /> Run FP-Growth</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-primary">
                            <Network className="w-4 h-4" />
                            Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasRun ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Transactions</div>
                                    <div className="text-2xl font-bold text-primary">{results.transactionCount}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-slate-800/50 rounded border border-slate-700">
                                        <div className="text-[10px] text-muted-foreground uppercase">Patterns</div>
                                        <div className="text-lg font-bold">{results.patterns.length}</div>
                                    </div>
                                    <div className="p-2 bg-slate-800/50 rounded border border-slate-700">
                                        <div className="text-[10px] text-muted-foreground uppercase">Rules</div>
                                        <div className="text-lg font-bold">{results.rules.length}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic text-center py-4">Run algorithm to see stats</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">FP-Growth Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                        <p>FP-Growth (Frequent Pattern Growth) is an efficient algorithm that mines frequent itemsets without candidate generation.</p>
                        <p>It uses a compact <strong>FP-Tree</strong> structure to compress the database and performs mining via recursive projections.</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-500">
                            <li>Faster than Apriori for large datasets</li>
                            <li>No expensive self-joins</li>
                            <li>Two-pass database scan</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    }, [datasetText, minSupport, minConfidence, results, isLoading, hasRun, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight">FP-Growth Lab</h2>
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 mt-2">
                    <Clock className="w-4 h-4" />
                    High-performance frequent pattern mining
                </p>
            </header>

            <main className="flex-1">
                {!hasRun && !isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                            <Network className="w-12 h-12 text-slate-700 opacity-50" />
                        </motion.div>
                        <p className="mt-4 text-slate-500 text-sm">Configure parameters and hit Run to start mining.</p>
                    </div>
                ) : isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-primary font-medium animate-pulse">Processing Tree & Mining Patterns...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        {/* Patterns Section */}
                        <Card className="flex flex-col bg-slate-900/50 border-slate-800">
                            <CardHeader className="border-b border-slate-800/50 pb-3">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Frequent Patterns
                                    </div>
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{results.patterns.length} found</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <div className="max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
                                    <div className="grid gap-2">
                                        {results.patterns.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800 transition-colors group">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.pattern.map((p, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] border border-slate-600 group-hover:border-primary/50 transition-colors">
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-primary">{(item.support * 100).toFixed(1)}%</span>
                                                    <span className="text-[10px] text-muted-foreground">Support</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rules Section */}
                        <Card className="flex flex-col bg-slate-900/50 border-slate-800">
                            <CardHeader className="border-b border-slate-800/50 pb-3">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold">
                                        <ArrowRight className="w-5 h-5 text-green-500" />
                                        Association Rules
                                    </div>
                                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">{results.rules.length} generated</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <div className="max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
                                    <div className="grid gap-3">
                                        {results.rules.map((rule, idx) => (
                                            <div key={idx} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-primary/30 transition-all shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {rule.antecedent.map((a, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded text-[10px] font-bold border border-slate-700">{a}</span>
                                                        ))}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                                                    <div className="flex flex-wrap gap-1">
                                                        {rule.consequent.map((c, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold border border-primary/20">{c}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-700/50 mt-2 font-mono text-[10px]">
                                                    <div className="flex flex-col">
                                                        <span className="text-muted-foreground uppercase text-[8px]">Support</span>
                                                        <span className="text-slate-200 font-bold">{(rule.support * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-muted-foreground uppercase text-[8px]">Confidence</span>
                                                        <span className="text-primary font-bold">{(rule.confidence * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-muted-foreground uppercase text-[8px]">Lift</span>
                                                        <span className={`font-bold ${rule.lift > 1 ? 'text-green-400' : 'text-slate-400'}`}>{rule.lift.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FPGrowthLab;
