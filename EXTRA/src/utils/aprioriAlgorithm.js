/**
 * Apriori Algorithm Implementation
 * Generates frequent itemsets and association rules from transaction data
 */

/**
 * Parse transaction data from text input
 * @param {string} text - Transactions as text (one per line, items comma-separated)
 * @returns {Array<Array<string>>} Array of transactions
 */
export function parseTransactions(text) {
    return text
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line =>
            line.split(',')
                .map(item => item.trim())
                .filter(item => item)
        );
}

/**
 * Calculate support for an itemset
 * @param {Array<string>} itemset - Items to check
 * @param {Array<Array<string>>} transactions - All transactions
 * @returns {number} Support value (0-1)
 */
export function calculateSupport(itemset, transactions) {
    const count = transactions.filter(transaction =>
        itemset.every(item => transaction.includes(item))
    ).length;
    return count / transactions.length;
}

/**
 * Generate candidate itemsets of size k from frequent itemsets of size k-1
 * @param {Array<Array<string>>} frequentItemsets - Frequent itemsets of size k-1
 * @param {number} k - Size of candidates to generate
 * @returns {Array<Array<string>>} Candidate itemsets
 */
function generateCandidates(frequentItemsets, k) {
    const candidates = [];
    const n = frequentItemsets.length;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const itemset1 = frequentItemsets[i];
            const itemset2 = frequentItemsets[j];

            // Join step: merge if first k-2 items are the same
            const merged = [...new Set([...itemset1, ...itemset2])];
            if (merged.length === k) {
                // Check if candidate already exists
                const exists = candidates.some(c =>
                    c.length === merged.length &&
                    c.every(item => merged.includes(item))
                );
                if (!exists) {
                    candidates.push(merged.sort());
                }
            }
        }
    }

    return candidates;
}

/**
 * Generate all frequent itemsets using Apriori algorithm
 * @param {Array<Array<string>>} transactions - Transaction data
 * @param {number} minSupport - Minimum support threshold (0-1)
 * @returns {Object} Object with frequent itemsets grouped by size
 */
export function generateFrequentItemsets(transactions, minSupport) {
    if (!transactions || transactions.length === 0) {
        return {};
    }

    const result = {};

    // Get all unique items (1-itemsets)
    const allItems = [...new Set(transactions.flat())];
    let currentItemsets = allItems.map(item => [item]);

    let k = 1;

    while (currentItemsets.length > 0) {
        // Filter itemsets that meet minimum support
        const frequentItemsets = currentItemsets
            .map(itemset => ({
                itemset,
                support: calculateSupport(itemset, transactions)
            }))
            .filter(({ support }) => support >= minSupport);

        if (frequentItemsets.length === 0) break;

        result[k] = frequentItemsets;

        // Generate candidates for next iteration
        k++;
        currentItemsets = generateCandidates(
            frequentItemsets.map(({ itemset }) => itemset),
            k
        );
    }

    return result;
}

/**
 * Calculate confidence for a rule
 * @param {Array<string>} antecedent - Left side of rule
 * @param {Array<string>} consequent - Right side of rule
 * @param {Array<Array<string>>} transactions - All transactions
 * @returns {number} Confidence value (0-1)
 */
export function calculateConfidence(antecedent, consequent, transactions) {
    const antecedentSupport = calculateSupport(antecedent, transactions);
    if (antecedentSupport === 0) return 0;

    const ruleSupport = calculateSupport([...antecedent, ...consequent], transactions);
    return ruleSupport / antecedentSupport;
}

/**
 * Calculate lift for a rule
 * @param {Array<string>} antecedent - Left side of rule
 * @param {Array<string>} consequent - Right side of rule
 * @param {Array<Array<string>>} transactions - All transactions
 * @returns {number} Lift value
 */
export function calculateLift(antecedent, consequent, transactions) {
    const ruleSupport = calculateSupport([...antecedent, ...consequent], transactions);
    const consequentSupport = calculateSupport(consequent, transactions);

    if (consequentSupport === 0) return 0;
    return ruleSupport / consequentSupport;
}

/**
 * Generate all possible subsets of an itemset (excluding empty set and full set)
 * @param {Array<string>} itemset - Items to generate subsets from
 * @returns {Array<Array<string>>} All non-empty proper subsets
 */
function generateSubsets(itemset) {
    const subsets = [];
    const n = itemset.length;

    // Generate all subsets using binary counting
    for (let i = 1; i < (1 << n) - 1; i++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                subset.push(itemset[j]);
            }
        }
        subsets.push(subset);
    }

    return subsets;
}

/**
 * Generate association rules from frequent itemsets
 * @param {Object} frequentItemsets - Frequent itemsets grouped by size
 * @param {Array<Array<string>>} transactions - All transactions
 * @param {number} minConfidence - Minimum confidence threshold (0-1)
 * @returns {Array<Object>} Association rules with metrics
 */
export function generateAssociationRules(frequentItemsets, transactions, minConfidence) {
    const rules = [];

    // Generate rules from itemsets of size 2 or more
    Object.entries(frequentItemsets).forEach(([size, itemsets]) => {
        if (parseInt(size) < 2) return;

        itemsets.forEach(({ itemset, support }) => {
            // Generate all possible antecedent-consequent splits
            const subsets = generateSubsets(itemset);

            subsets.forEach(antecedent => {
                const consequent = itemset.filter(item => !antecedent.includes(item));

                if (consequent.length === 0) return;

                const confidence = calculateConfidence(antecedent, consequent, transactions);

                if (confidence >= minConfidence) {
                    const lift = calculateLift(antecedent, consequent, transactions);

                    rules.push({
                        antecedent,
                        consequent,
                        support,
                        confidence,
                        lift
                    });
                }
            });
        });
    });

    // Sort by confidence (descending)
    return rules.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Sample datasets for demonstration
 */
export const sampleDatasets = {
    marketBasket: `Milk, Bread, Butter
Bread, Diapers, Beer, Eggs
Milk, Diapers, Beer, Cola
Bread, Milk, Diapers, Beer
Bread, Milk, Diapers, Cola`,

    simple: `A, B, C
A, B
A, C
B, C
A, B, C`,

    grocery: `Bread, Milk
Bread, Diapers, Beer, Eggs
Milk, Diapers, Beer, Cola
Bread, Milk, Diapers, Beer
Bread, Milk, Diapers, Cola
Bread, Milk
Milk, Diapers, Beer
Bread, Diapers, Cola`,

    restaurant: `Burger, Fries, Coke
Pizza, Salad, Water
Burger, Fries, Shake
Pizza, Fries, Coke
Burger, Salad, Coke
Pizza, Fries, Shake
Burger, Fries, Coke
Pizza, Salad, Coke`
};
