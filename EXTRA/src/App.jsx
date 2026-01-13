import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Activity, GitGraph, TrendingUp, Brain, Boxes, Network, Search, Layers } from 'lucide-react';

// Main Views
import Home from '@/features/home/Home';
import About from '@/features/about/About';
import Contact from '@/features/contact/Contact';
import Theory from '@/features/theory/Theory';

// Labs
import KMeansLab from '@/features/kmeans/KMeansLab';
import KNNLab from '@/features/knn/KNNLab';
import RegressionLab from '@/features/regression/RegressionLab';
import LogisticLab from '@/features/logistic/LogisticLab';
import GradientDescentLab from '@/features/gradient_descent/GradientDescentLab';
import PlaceholderLab from '@/features/placeholders/PlaceholderLab';

// Classification Labs
import SVMLab from '@/features/classification/SVMLab';
import DecisionTreeLab from '@/features/classification/DecisionTreeLab';
import NaiveBayesLab from '@/features/classification/NaiveBayesLab';
import RandomForestLab from '@/features/classification/RandomForestLab';

// Clustering Labs
import DBSCANLab from '@/features/clustering/DBSCANLab';
import EMLab from '@/features/clustering/EMLab';

// Association Labs
import AprioriLab from '@/features/association/AprioriLab';
import FPGrowthLab from '@/features/association/FPGrowthLab';

// Dim Reduction Labs
import PCALab from '@/features/dimreduction/PCALab';
import SVDLab from '@/features/dimreduction/SVDLab';

// Ensemble & Specialized Labs
import AdaBoostLab from '@/features/ensemble/AdaBoostLab';
import PageRankLab from '@/features/specialized/PageRankLab';

function App() {
    const [mainView, setMainView] = useState('home');
    const [activeTab, setActiveTab] = useState('kmeans');
    const [leftPanelContent, setLeftPanelContent] = useState(null);
    const [rightPanelContent, setRightPanelContent] = useState(null);

    // Clear panels on tab change
    useEffect(() => {
        setLeftPanelContent(null);
        setRightPanelContent(null);
    }, [activeTab]);

    const renderLabContent = () => {
        switch (activeTab) {
            // Classification
            case 'knn': return <KNNLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'c45': return <DecisionTreeLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'naivebayes': return <NaiveBayesLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'svm': return <SVMLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'randomforest': return <RandomForestLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;

            // Clustering
            case 'kmeans': return <KMeansLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'dbscan': return <DBSCANLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'em': return <EMLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;

            // Association
            case 'apriori': return <AprioriLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'fpgrowth': return <FPGrowthLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;

            // Regression
            case 'regression': return <RegressionLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'logistic': return <LogisticLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;

            // Dimensionality Reduction
            case 'pca': return <PCALab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'svd': return <SVDLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;

            // Ensemble & Specialized
            case 'gradient': return <GradientDescentLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'adaboost': return <AdaBoostLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
            case 'pagerank': return <PageRankLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;

            default: return <KMeansLab setLeftPanelContent={setLeftPanelContent} setRightPanelContent={setRightPanelContent} />;
        }
    };

    const handleUseAlgorithm = (algoId) => {
        setActiveTab(algoId);
        setMainView('labs');
    };

    const renderMainContent = () => {
        switch (mainView) {
            case 'home': return <Home onGetStarted={setMainView} />;
            case 'about': return <About />;
            case 'contact': return <Contact />;
            case 'theory': return <Theory onUseAlgorithm={handleUseAlgorithm} />;
            case 'labs': return renderLabContent();
            default: return <Home onGetStarted={setMainView} />;
        }
    };

    const NavButton = ({ id, label, icon: Icon }) => (
        <Button
            variant={activeTab === id ? 'neon' : 'ghost'}
            className="w-full justify-start h-8 text-sm font-normal"
            onClick={() => setActiveTab(id)}
        >
            {Icon && <Icon className="mr-2 h-3 w-3" />}
            {label}
        </Button>
    );

    const renderLeftPanel = () => (
        <div className="space-y-4">
            <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="py-2 px-0">
                    <CardTitle className="text-lg px-2">Algorithms</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full" defaultValue="clustering">

                        <AccordionItem value="classification" className="border-b border-border/50">
                            <AccordionTrigger className="px-4 text-sm hover:no-underline hover:bg-accent/50 rounded-lg">
                                <span className="flex items-center"><Brain className="mr-2 h-4 w-4 text-primary" /> Classification</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-1 pb-2">
                                <div className="space-y-1">
                                    <NavButton id="knn" label="K-Nearest Neighbors" icon={Activity} />
                                    <NavButton id="c45" label="C4.5 / Decision Tree" />
                                    <NavButton id="naivebayes" label="Naive Bayes" />
                                    <NavButton id="svm" label="SVM" />
                                    <NavButton id="randomforest" label="Random Forest" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="clustering" className="border-b border-border/50">
                            <AccordionTrigger className="px-4 text-sm hover:no-underline hover:bg-accent/50 rounded-lg">
                                <span className="flex items-center"><Boxes className="mr-2 h-4 w-4 text-primary" /> Clustering</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-1 pb-2">
                                <div className="space-y-1">
                                    <NavButton id="kmeans" label="K-Means" icon={GitGraph} />
                                    <NavButton id="dbscan" label="DBSCAN" />
                                    <NavButton id="em" label="Expectation-Maximization" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="regression" className="border-b border-border/50">
                            <AccordionTrigger className="px-4 text-sm hover:no-underline hover:bg-accent/50 rounded-lg">
                                <span className="flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-primary" /> Regression</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-1 pb-2">
                                <div className="space-y-1">
                                    <NavButton id="regression" label="Linear Regression" />
                                    <NavButton id="logistic" label="Logistic Regression" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="association" className="border-b border-border/50">
                            <AccordionTrigger className="px-4 text-sm hover:no-underline hover:bg-accent/50 rounded-lg">
                                <span className="flex items-center"><Network className="mr-2 h-4 w-4 text-primary" /> Association Rules</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-1 pb-2">
                                <div className="space-y-1">
                                    <NavButton id="apriori" label="Apriori" />
                                    <NavButton id="fpgrowth" label="FP-Growth" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="dimreduction" className="border-b border-border/50">
                            <AccordionTrigger className="px-4 text-sm hover:no-underline hover:bg-accent/50 rounded-lg">
                                <span className="flex items-center"><Layers className="mr-2 h-4 w-4 text-primary" /> Dim. Reduction</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-1 pb-2">
                                <div className="space-y-1">
                                    <NavButton id="pca" label="PCA" />
                                    <NavButton id="svd" label="SVD" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="ensemble" className="border-b-0">
                            <AccordionTrigger className="px-4 text-sm hover:no-underline hover:bg-accent/50 rounded-lg">
                                <span className="flex items-center"><Search className="mr-2 h-4 w-4 text-primary" /> Ensemble & Other</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-2 pt-1 pb-2">
                                <div className="space-y-1">
                                    <NavButton id="gradient" label="Gradient Descent" icon={Activity} />
                                    <NavButton id="adaboost" label="AdaBoost / GB" />
                                    <NavButton id="pagerank" label="PageRank" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <Navbar activeView={mainView} setActiveView={setMainView} />
            <MainLayout
                leftPanel={renderLeftPanel()}
                bottomPanel={leftPanelContent || <div className="text-sm text-muted-foreground italic p-4 text-center">Select an algorithm to view controls</div>}
                rightPanel={rightPanelContent}
                showSidebars={mainView === 'labs'}
                noPadding={mainView === 'theory'}
            >
                {renderMainContent()}
            </MainLayout>
        </div>
    );
}

export default App;
