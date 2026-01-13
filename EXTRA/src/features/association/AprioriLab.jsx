import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Database, ArrowRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    parseTransactions,
    generateFrequentItemsets,
    generateAssociationRules,
    sampleDatasets
} from '@/utils/aprioriAlgorithm';

const AprioriLab = ({ setLeftPanelContent, setRightPanelContent }) => {
    const [datasetText, setDatasetText] = useState(sampleDatasets.marketBasket);
    const [minSupport, setMinSupport] = useState(40);
    const [minConfidence, setMinConfidence] = useState(60);
    const [frequentItemsets, setFrequentItemsets] = useState({});
    const [rules, setRules] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const runApriori = () => {
        const trans = parseTransactions(datasetText);

        if (trans.length === 0) {
            alert('Please enter valid transaction data');
            return;
        }

        const itemsets = generateFrequentItemsets(trans, minSupport / 100);
        const associationRules = generateAssociationRules(itemsets, trans, minConfidence / 100);

        setTransactions(trans);
        setFrequentItemsets(itemsets);
        setRules(associationRules);
        setHasRun(true);
    };

    const loadSample = (sampleName) => {
        setDatasetText(sampleDatasets[sampleName]);
        setHasRun(false);
    };

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
                    <CardContent className="space-y-3">
                        <textarea
                            value={datasetText}
                            onChange={(e) => {
                                setDatasetText(e.target.value);
                                setHasRun(false);
                            }}
                            className="w-full h-32 p-2 bg-slate-800 border border-slate-600 rounded text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter transactions (one per line, items comma-separated)"
                        />

                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => loadSample('marketBasket')}>Market Basket</Button>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => loadSample('grocery')}>Grocery</Button>
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => loadSample('restaurant')}>Restaurant</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-xs text-muted-foreground flex justify-between mb-2">
                                <span>Min Support</span>
                                <span className="font-bold text-primary">{minSupport}%</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={minSupport}
                                onChange={(e) => {
                                    setMinSupport(parseInt(e.target.value));
                                    setHasRun(false);
                                }}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground flex justify-between mb-2">
                                <span>Min Confidence</span>
                                <span className="font-bold text-primary">{minConfidence}%</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={minConfidence}
                                onChange={(e) => {
                                    setMinConfidence(parseInt(e.target.value));
                                    setHasRun(false);
                                }}
                                className="w-full"
                            />
                        </div>

                        <Button className="w-full" onClick={runApriori}>
                            <Play className="w-4 h-4 mr-2" />
                            Run Apriori Algorithm
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );

        setRightPanelContent(
            <div className="space-y-4 animate-in slide-in-from-right">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Algorithm Info</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 text-muted-foreground">
                        <p><strong>Apriori</strong> uses a join and prune approach to find frequent itemsets.</p>
                        <p>Results will appear in the center panel for better visibility.</p>
                    </CardContent>
                </Card>
                {hasRun && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Transactions:</span>
                                <span className="font-bold">{transactions.length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Itemsets:</span>
                                <span className="font-bold">{Object.values(frequentItemsets).flat().length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Rules:</span>
                                <span className="font-bold">{rules.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }, [datasetText, minSupport, minConfidence, hasRun, transactions, frequentItemsets, rules, setLeftPanelContent, setRightPanelContent]);

    return (
        <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Apriori Algorithm</h2>
                <p className="text-muted-foreground text-sm">Discover frequent patterns and association rules</p>
            </div>

            {!hasRun ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-muted-foreground">Input data and run the algorithm to see results here</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Frequent Itemsets */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Frequent Itemsets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
                                {Object.keys(frequentItemsets).length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No frequent itemsets found.</p>
                                ) : (
                                    Object.entries(frequentItemsets).map(([size, itemsets]) => (
                                        <div key={size} className="mb-4 last:mb-0">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                                {size}-Itemsets
                                            </h4>
                                            <div className="space-y-1">
                                                {itemsets.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between p-2 bg-slate-800/50 rounded text-sm">
                                                        <span>{'{' + item.itemset.join(', ') + '}'}</span>
                                                        <span className="font-mono text-primary">{(item.support * 100).toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Association Rules */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ArrowRight className="w-5 h-5 text-primary" />
                                    Association Rules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
                                <AnimatePresence mode="popLayout">
                                    {rules.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No rules generated.</p>
                                    ) : (
                                        rules.map((rule, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-3 mb-2 rounded-lg border ${rule.confidence >= 0.8 ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-800/50 border-slate-700'}`}
                                            >
                                                <div className="flex items-center gap-2 text-sm font-bold mb-2">
                                                    <span>{'{' + rule.antecedent.join(', ') + '}'}</span>
                                                    <ArrowRight className="w-4 h-4 opacity-50" />
                                                    <span className="text-primary">{'{' + rule.consequent.join(', ') + '}'}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                    <div className="flex flex-col">
                                                        <span>Support</span>
                                                        <span className="text-white">{(rule.support * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>Conf</span>
                                                        <span className="text-white">{(rule.confidence * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>Lift</span>
                                                        <span className="text-white">{rule.lift.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AprioriLab;
