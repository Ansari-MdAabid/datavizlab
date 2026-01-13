import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, Boxes, TrendingUp, Network, Layers, Search, PlayCircle, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const algorithmData = [
    {
        category: "Classification",
        icon: Brain,
        algorithms: [
            {
                id: "knn",
                title: "K-Nearest Neighbors",
                theory: "K-Nearest Neighbors (KNN) is a simple, effective, and non-parametric supervised learning algorithm. It operates on the principle of similarity: it assumes that similar things exist in close proximity. To classify a new data point, the algorithm calculates the distance (typically Euclidean, Manhattan, or Minkowski) between that point and all other points in the dataset. It then selects the 'K' points that are closest. The final classification is determined by a majority vote among these neighbors. KNN is often called a 'Lazy Learner' because it doesn't build a statistical model during training; instead, it stores the entire dataset and performs all calculations at the time of prediction."
            },
            {
                id: "c45",
                title: "C4.5 / Decision Tree",
                theory: "A Decision Tree is a flowchart-like structure used for classification and regression. The C4.5 algorithm is a famous evolution of ID3. It builds trees by recursively splitting the data based on the attribute that provides the highest 'Information Gain Ratio'. Information Gain is based on the concept of Entropy—a measure of impurity or randomness in the data. By choosing splits that minimize entropy, the tree effectively separates the classes. C4.5 handles both continuous and discrete attributes and includes a 'pruning' phase where branches that don't contribute significantly to accuracy are removed to prevent overfitting. The result is a highly interpretable model that mimics human decision-making."
            },
            {
                id: "naivebayes",
                title: "Naive Bayes",
                theory: "Naive Bayes is a probabilistic classifier based on Bayes' Theorem. The 'Naive' part comes from the strong assumption that all features in a dataset are independent of each other given the class label—an assumption that rarely holds true in the real world but often produces surprisingly good results. The algorithm calculates the posterior probability for each class based on the prior probability and the likelihood of the observed features. It is exceptionally fast and requires relatively little training data, making it a go-to choice for high-dimensional problems like spam filtering, sentiment analysis, and document classification."
            },
            {
                id: "svm",
                title: "Support Vector Machines",
                theory: "Support Vector Machines (SVM) aim to find the optimal 'hyperplane' that separates data points of different classes with the maximum possible 'margin'. Points closest to this boundary are called 'Support Vectors'. SVM is highly powerful because it can handle non-linear data using the 'Kernel Trick', which projects the data into a higher-dimensional space where a linear separation becomes possible. By maximizing the margin, SVM ensures that the model is robust and generalizes well to new, unseen data, making it one of the most reliable algorithms for complex classification tasks."
            },
            {
                id: "randomforest",
                title: "Random Forest",
                theory: "Random Forest is an ensemble learning method that builds a 'forest' of many independent Decision Trees. It uses a technique called 'Bagging' (Bootstrap Aggregating), where each tree is trained on a random sample of the data with replacement. Additionally, at each split in a tree, only a random subset of features is considered. This double randomness ensures that the trees are decorrelated. The final prediction is made by averaging the results (for regression) or taking a majority vote (for classification). This significantly reduces variance compared to a single decision tree, providing a highly accurate and stable model that is resistant to overfitting."
            }
        ]
    },
    {
        category: "Clustering",
        icon: Boxes,
        algorithms: [
            {
                id: "kmeans",
                title: "K-Means",
                theory: "K-Means is the most popular unsupervised clustering algorithm. It partitions data into 'K' distinct clusters. The process starts by randomly placing K centroids. It then alternates between two steps: 1) Assignment: Every data point is assigned to its nearest centroid based on Euclidean distance. 2) Update: Each centroid is moved to the center (mean) of all points assigned to it. This process repeats until the centroids no longer move or a limit is reached. The goal is to minimize the sum of squared distances within each cluster. While fast and scalable, it requires the user to specify 'K' in advance and is sensitive to the initial placement of centroids."
            },
            {
                id: "dbscan",
                title: "DBSCAN",
                theory: "Density-Based Spatial Clustering of Applications with Noise (DBSCAN) finds clusters based on the density of data points. Unlike K-Means, it doesn't require you to specify the number of clusters. Instead, it uses two parameters: 'Epsilon' (the radius to search for neighbors) and 'MinPoints' (the minimum points required to form a dense region). Points that have enough neighbors are 'Core Points', while those that don't but are near one are 'Border Points'. All other points are considered 'Noise' or outliers. This allows DBSCAN to discover clusters of arbitrary shapes and naturally handle data with significant noise."
            },
            {
                id: "em",
                title: "Expectation-Maximization",
                theory: "The Expectation-Maximization (EM) algorithm is a powerful tool for finding maximum likelihood estimates in models with 'latent' (hidden) variables. In clustering, it is most commonly used for Gaussian Mixture Models (GMM). Unlike 'hard' clustering like K-Means, EM provides 'soft' clustering, giving each point a probability of belonging to each cluster. It works in two steps: The 'E-step' calculates the expected value of the latent variables (the probability of cluster membership), and the 'M-step' updates the parameters of the clusters (mean, variance) to maximize the likelihood of the data given the memberships. It iterates until convergence, providing a sophisticated statistical approach to grouping data."
            }
        ]
    },
    {
        category: "Regression",
        icon: TrendingUp,
        algorithms: [
            {
                id: "regression",
                title: "Linear Regression",
                theory: "Linear Regression is the fundamental statistical method for modeling the relationship between a dependent variable and one or more independent variables. It assumes a linear relationship, represented by the equation y = mx + c. The goal is to find the line that minimizes the sum of the squared differences (residuals) between the observed and predicted values—a method known as 'Ordinary Least Squares'. It provides powerful insights into how much the dependent variable changes per unit change in the predictors. It's widely used for forecasting, trend analysis, and establishing cause-effect relationships in various fields like economics and science."
            },
            {
                id: "logistic",
                title: "Logistic Regression",
                theory: "Despite its name, Logistic Regression is primarily used for binary classification. It models the probability that a given input belongs to a certain category. Instead of a straight line, it uses the 'Sigmoid Function' (Logistic function), which takes any real-valued number and maps it to a value between 0 and 1. This output represents the probability. The 'log-odds' of the probability is modeled as a linear combination of the input features. It's a cornerstone for tasks like predicting if a customer will churn, if an email is spam, or if a tumor is malignant, providing a clear probabilistic interpretation of its decisions."
            }
        ]
    },
    {
        category: "Association Rules",
        icon: Network,
        algorithms: [
            {
                id: "apriori",
                title: "Apriori",
                theory: "The Apriori algorithm is designed for frequent itemset mining and association rule learning. It's famous for 'Market Basket Analysis'—finding products that are often bought together. It works on the 'Apriori Property': if an itemset is frequent, then all its subsets must also be frequent. The algorithm proceeds in levels, first finding frequent individual items, then pairs, triplets, and so on. At each stage, it 'prunes' any itemsets that don't meet a minimum 'Support' threshold. From these frequent itemsets, it generates rules (e.g., if bread, then butter) and evaluates them using metrics like 'Confidence' and 'Lift'."
            },
            {
                id: "fpgrowth",
                title: "FP-Growth",
                theory: "Frequent Pattern Growth (FP-Growth) is an improvement over Apriori. Apriori can be slow because it requires scanning the entire database multiple times to generate candidate sets. FP-Growth avoids this by compressing the database into a complex data structure called an 'FP-tree'. This tree stores the frequency and relationships of items in a compact way. The algorithm then extracts frequent patterns directly from the tree structure using a divide-and-conquer approach. It is generally much faster and more memory-efficient than Apriori, especially for large datasets with many frequent patterns."
            }
        ]
    },
    {
        category: "Dim. Reduction",
        icon: Layers,
        algorithms: [
            {
                id: "pca",
                title: "PCA",
                theory: "Principal Component Analysis (PCA) is the gold standard for dimensionality reduction. It transforms high-dimensional data into a smaller set of variables called 'Principal Components' that still capture most of the original information (variance). It works by calculating the covariance matrix of the data and finding its eigenvectors and eigenvalues. The eigenvectors define the new axes (dimensions), and the eigenvalues tell us how much variance is explained by each axis. By keeping only the top components, we can significantly reduce the complexity of the data while removing noise, making it easier to visualize and faster for other algorithms to process."
            },
            {
                id: "svd",
                title: "SVD",
                theory: "Singular Value Decomposition (SVD) is a powerful matrix factorization method. It decomposes any matrix A into three simpler matrices: A = UΣVᵀ. 'U' and 'V' are orthogonal matrices representing rotations, and 'Σ' is a diagonal matrix containing 'Singular Values' that represent scaling. SVD is the mathematical foundation for many techniques, including PCA, Latent Semantic Analysis (for text mining), and Recommender Systems. In dimensionality reduction, we discard small singular values to create a low-rank approximation of the original matrix, effectively capturing the most important underlying patterns while compressing the data."
            }
        ]
    },
    {
        category: "Ensemble & Other",
        icon: Search,
        algorithms: [
            {
                id: "gradient",
                title: "Gradient Descent",
                theory: "Gradient Descent is the 'engine' behind optimization in machine learning. It's an iterative process used to find the minimum of a 'Loss Function'—a surface that represents the error of a model. Think of it as a person trying to find the bottom of a foggy valley by always stepping in the direction of the steepest downward slope. This slope is the 'Gradient'. The size of each step is determined by the 'Learning Rate'. If the rate is too high, we might overshoot the minimum; if it's too low, it takes forever to converge. Variants like Stochastic Gradient Descent (SGD) and Adam are used to train almost all modern Neural Networks."
            },
            {
                id: "adaboost",
                title: "AdaBoost",
                theory: "Adaptive Boosting (AdaBoost) is an ensemble method that turns 'Weak Learners' into a 'Strong Learner'. Unlike Random Forest, which builds trees in parallel, AdaBoost builds them sequentially. Each new model (often a 'Stump'—a decision tree with only one split) is trained to focus specifically on the errors made by the previous models. Data points that were misclassified are given higher 'weights' in the next round. Finally, all models are combined through a weighted vote, where models with higher accuracy have more say. This iterative focusing on difficult cases makes AdaBoost incredibly powerful for classification tasks."
            },
            {
                id: "pagerank",
                title: "PageRank",
                theory: "PageRank is the original algorithm used by Google to rank web pages. It treats the web as a massive graph of nodes (pages) and edges (links). The core idea is that a page is important if important pages link to it. It models a 'Random Surfer' who clicks links with a certain probability (the Damping Factor) and occasionally jumps to a random page. The PageRank score of a page is the probability that this surfer will end up there. It uses a sophisticated iterative process based on eigenvector centrality to calculate these scores. While the web graph has evolved, the concept of ranking nodes based on connectivity remains central to graph theory and social network analysis."
            }
        ]
    }
];

const Theory = ({ onUseAlgorithm }) => {
    const [selectedAlgo, setSelectedAlgo] = useState(algorithmData[0].algorithms[0]);

    return (
        <div className="flex h-full w-full overflow-hidden bg-background/50 rounded-xl border border-border/50">
            {/* Left Sidebar - Algorithm List */}
            <aside className="w-80 border-r border-border bg-card/20 backdrop-blur-xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border/40">
                    <h2 className="text-xl font-bold tracking-tight">Theory Lab</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Foundations & Logic</p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {algorithmData.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-2">
                            <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary/70">
                                <cat.icon className="h-3 w-3" />
                                {cat.category}
                            </div>
                            <div className="space-y-1">
                                {cat.algorithms.map((algo) => (
                                    <button
                                        key={algo.id}
                                        onClick={() => setSelectedAlgo(algo)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group",
                                            selectedAlgo.id === algo.id
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-card hover:text-foreground"
                                        )}
                                    >
                                        <span className="truncate">{algo.title}</span>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-transform",
                                            selectedAlgo.id === algo.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                        )} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Right Pane - Theory Detail */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedAlgo.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-y-auto custom-scrollbar p-12"
                    >
                        <div className="max-w-3xl mx-auto space-y-10">
                            <div className="flex items-center justify-between border-b border-border/40 pb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Algorithm Deep Dive</span>
                                    </div>
                                    <h1 className="text-5xl font-black tracking-tighter">{selectedAlgo.title}</h1>
                                </div>
                                <Button
                                    variant="neon"
                                    onClick={() => onUseAlgorithm(selectedAlgo.id)}
                                    className="h-14 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all text-base"
                                >
                                    <PlayCircle className="mr-3 h-5 w-5" />
                                    Launch experiment
                                </Button>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <div className="p-10 rounded-[2.5rem] bg-card/30 border border-border/50 backdrop-blur-md shadow-inner relative overflow-hidden group">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                                        The Concept
                                    </h3>
                                    <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                        {selectedAlgo.theory}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Theory;
