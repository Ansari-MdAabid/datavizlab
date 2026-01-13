/**
 * FP-Growth Algorithm Implementation (Clean Version)
 */

import { parseTransactions, calculateSupport, calculateConfidence, calculateLift } from './aprioriAlgorithm.js';

/**
 * FP-Tree Node
 */
class FPNode {
    constructor(item, count = 0, parent = null) {
        this.item = item;
        this.count = count;
        this.parent = parent;
        this.children = new Map();
        this.nodeLink = null;
    }

    increment(count = 1) {
        this.count += count;
    }

    addChild(item, count = 1) {
        if (this.children.has(item)) {
            this.children.get(item).increment(count);
        } else {
            this.children.set(item, new FPNode(item, count, this));
        }
        return this.children.get(item);
    }
}

/**
 * FP-Tree structure
 */
class FPTree {
    constructor() {
        this.root = new FPNode(null, 0, null);
        this.headerTable = new Map(); // item -> first node link
        this.itemCounts = new Map(); // item -> frequency
    }

    addTransaction(transaction, count = 1) {
        let currentNode = this.root;
        transaction.forEach(item => {
            currentNode = currentNode.addChild(item, count);

            // Update node link if needed
            if (!this.headerTable.has(item)) {
                this.headerTable.set(item, currentNode);
            } else {
                let node = this.headerTable.get(item);
                if (node !== currentNode) { // Avoid adding the same node multiple times (though transaction logic should prevent this)
                    while (node.nodeLink && node.nodeLink !== currentNode) {
                        node = node.nodeLink;
                    }
                    if (!node.nodeLink) {
                        node.nodeLink = currentNode;
                    }
                }
            }
        });
    }

    getPath(node) {
        const path = [];
        let curr = node.parent;
        while (curr && curr.item !== null) {
            path.unshift(curr.item);
            curr = curr.parent;
        }
        return path;
    }

    toVisualizationData() {
        const nodes = [];
        const links = [];
        let idCount = 0;

        const traverse = (node, parentId = null, depth = 0) => {
            const id = idCount++;
            nodes.push({ id, item: node.item || 'root', count: node.count, depth });
            if (parentId !== null) links.push({ source: parentId, target: id });
            node.children.forEach(child => traverse(child, id, depth + 1));
        };

        traverse(this.root);
        return { nodes, links };
    }
}

/**
 * Main FP-Growth mining entry point
 */
export function runFPGrowthFull(transactions, minSupport, minConfidence) {
    const transactionCount = transactions.length;
    const minCount = Math.ceil(minSupport * transactionCount);

    // 1. Get frequencies
    const frequencies = new Map();
    transactions.forEach(t => t.forEach(item => frequencies.set(item, (frequencies.get(item) || 0) + 1)));

    // 2. Filter & Sort Frequent Items
    const frequentItems = Array.from(frequencies.entries())
        .filter(([_, count]) => count >= minCount)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) // secondary sort for consistency
        .map(([item]) => item);

    // 3. Build Initial Tree
    const tree = new FPTree();
    frequentItems.forEach(item => tree.itemCounts.set(item, frequencies.get(item)));

    transactions.forEach(t => {
        const sortedItems = t
            .filter(item => frequencies.get(item) >= minCount)
            .sort((a, b) => frequencies.get(b) - frequencies.get(a) || a.localeCompare(b));
        if (sortedItems.length > 0) tree.addTransaction(sortedItems);
    });

    // 4. Mine Patterns
    const patternCountLookup = new Map();
    const mine = (currTree, suffix = []) => {
        const items = Array.from(currTree.itemCounts.keys()).sort((a, b) => {
            // Sort by count asc for mining order (bottom-up in header table)
            return currTree.itemCounts.get(a) - currTree.itemCounts.get(b);
        });

        items.forEach(item => {
            const freq = currTree.itemCounts.get(item);
            const newPattern = [item, ...suffix].sort();
            const patternKey = newPattern.join(',');

            patternCountLookup.set(patternKey, freq);

            // Conditional Pattern Base
            const condPatternBase = [];
            let node = currTree.headerTable.get(item);
            while (node) {
                const path = currTree.getPath(node);
                if (path.length > 0) {
                    condPatternBase.push({ path, count: node.count });
                }
                node = node.nodeLink;
            }

            // Conditional Tree
            const itemCounts = new Map();
            condPatternBase.forEach(entry => {
                entry.path.forEach(pItem => itemCounts.set(pItem, (itemCounts.get(pItem) || 0) + entry.count));
            });

            const frequentInCond = Array.from(itemCounts.entries())
                .filter(([_, count]) => count >= minCount)
                .map(([item]) => item);

            if (frequentInCond.length > 0) {
                const condTree = new FPTree();
                frequentInCond.forEach(fItem => condTree.itemCounts.set(fItem, itemCounts.get(fItem)));

                condPatternBase.forEach(entry => {
                    const filteredPath = entry.path.filter(pItem => frequentInCond.includes(pItem));
                    if (filteredPath.length > 0) {
                        condTree.addTransaction(filteredPath, entry.count);
                    }
                });
                mine(condTree, [item, ...suffix]);
            }
        });
    };

    mine(tree);

    // 5. Generate Rules
    const resultsPatterns = Array.from(patternCountLookup.entries()).map(([key, count]) => ({
        pattern: key.split(','),
        count,
        support: count / transactionCount
    })).sort((a, b) => b.support - a.support);

    const rules = [];
    resultsPatterns.filter(p => p.pattern.length >= 2).forEach(p => {
        const items = p.pattern;
        const totalCount = p.count;
        const n = items.length;

        for (let i = 1; i < (1 << n) - 1; i++) {
            const antecedent = [];
            const consequent = [];
            for (let j = 0; j < n; j++) {
                if ((i >> j) & 1) antecedent.push(items[j]);
                else consequent.push(items[j]);
            }

            const antKey = antecedent.sort().join(',');
            const consKey = consequent.sort().join(',');
            const antCount = patternCountLookup.get(antKey);
            const consCount = patternCountLookup.get(consKey);

            if (antCount) {
                const conf = totalCount / antCount;
                if (conf >= minConfidence) {
                    const supp = totalCount / transactionCount;
                    const lift = consCount ? (conf / (consCount / transactionCount)) : 0;
                    rules.push({
                        antecedent: antecedent.sort(),
                        consequent: consequent.sort(),
                        support: supp,
                        confidence: conf,
                        lift
                    });
                }
            }
        }
    });

    return {
        tree: tree.toVisualizationData(),
        patterns: resultsPatterns,
        rules: rules.sort((a, b) => b.confidence - a.confidence),
        transactionCount
    };
}

export { sampleDatasets, parseTransactions } from './aprioriAlgorithm.js';
