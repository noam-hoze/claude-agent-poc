// Insights generation engine
// This module generates the "Today's Brief" and handles natural language queries

class InsightsEngine {
    constructor(data) {
        this.data = data;
        this.queryDb = queryDatabase;
        this.experiments = experiments;
    }

    // Generate today's brief (6-10 sentences with metrics)
    generateTodaysBrief() {
        const { currentWeek } = this.data;

        const briefItems = [
            {
                text: `Median time from QA-start → QA-done is <span class="metric">${currentWeek.medianCycleTime} days</span>, up from <span class="metric">${currentWeek.previousWeekCycleTime} days</span> last week.`,
                metric: 'Cycle Time',
                drillDown: 'cycle-time-detail'
            },
            {
                text: `<span class="metric">${currentWeek.blockedTimePercentage}%</span> of work time is waiting for <span class="metric">${currentWeek.topBlocker}</span> (most items labeled 'env').`,
                metric: 'Blocked Time',
                drillDown: 'blocked-time-detail'
            },
            {
                text: `Items that require <span class="metric">hardware bench access</span> take <span class="metric">${currentWeek.hardwareBenchMultiplier}× longer</span> than simulation-only items.`,
                metric: 'Hardware Impact',
                drillDown: 'hardware-bench-detail'
            },
            {
                text: `<span class="metric">Reopen rate</span> is <span class="metric">${currentWeek.reopenRate}%</span>; most reopens come from <span class="metric">${currentWeek.topReopenCause}</span>.`,
                metric: 'Quality',
                drillDown: 'reopen-detail'
            },
            {
                text: `<span class="metric">${currentWeek.topDelayItems} items</span> account for <span class="metric">${currentWeek.topDelayPercentage}%</span> of total cycle time this week due to long 'blocked' periods.`,
                metric: 'Top Delays',
                drillDown: 'top-delays-detail'
            },
            {
                text: `When items include a <span class="metric">test plan checklist</span> in the description, they finish <span class="metric">${currentWeek.testPlanChecklistSpeedup}% faster</span> (small sample).`,
                metric: 'Best Practice',
                drillDown: 'test-plan-detail'
            }
        ];

        return briefItems;
    }

    // Handle natural language queries
    handleQuery(query) {
        const normalizedQuery = query.toLowerCase().trim();

        // Try to find exact or close match in query database
        for (const [key, response] of Object.entries(this.queryDb)) {
            if (this.queryMatches(normalizedQuery, key)) {
                return response;
            }
        }

        // If no match, return a helpful fallback
        return this.generateFallbackResponse(query);
    }

    // Check if query matches a known pattern
    queryMatches(query, pattern) {
        const queryWords = new Set(query.split(/\s+/));
        const patternWords = new Set(pattern.split(/\s+/));

        // Calculate word overlap
        let matches = 0;
        for (const word of queryWords) {
            if (patternWords.has(word)) {
                matches++;
            }
        }

        // If more than 50% of query words match, consider it a match
        return matches >= Math.min(queryWords.size * 0.4, 3);
    }

    // Generate fallback response for unrecognized queries
    generateFallbackResponse(query) {
        const suggestions = Object.keys(this.queryDb).slice(0, 3);

        return {
            answer: `I understand you're asking about: "${query}". While I don't have a specific analysis for that query yet, I can help with related questions. Try asking about cycle time, blocked time, reopens, or specific bottlenecks.`,
            evidence: [
                {
                    title: "Current Cycle Time",
                    metric: `${this.data.currentWeek.medianCycleTime} days`,
                    detail: "Median time from QA start to QA done"
                },
                {
                    title: "Top Bottleneck",
                    metric: this.data.currentWeek.topBlocker,
                    detail: `${this.data.currentWeek.blockedTimePercentage}% of time spent blocked`
                },
                {
                    title: "Reopen Rate",
                    metric: `${this.data.currentWeek.reopenRate}%`,
                    detail: "Items requiring rework after completion"
                }
            ],
            experiments: [],
            suggestions: suggestions
        };
    }

    // Get experiment details by ID
    getExperiment(experimentId) {
        return this.experiments[experimentId];
    }

    // Get all experiments
    getAllExperiments() {
        return Object.keys(this.experiments).map(id => ({
            id,
            ...this.experiments[id]
        }));
    }

    // Drill down into brief metrics (for future expansion)
    getDrillDown(drillDownId) {
        const drillDownData = {
            'cycle-time-detail': {
                title: 'Cycle Time Breakdown',
                charts: [
                    { label: 'This Week', value: this.data.currentWeek.medianCycleTime },
                    { label: 'Last Week', value: this.data.currentWeek.previousWeekCycleTime }
                ],
                items: this.data.workItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    cycleTime: item.cycleTime,
                    blockedTime: item.blockedTime
                }))
            },
            'blocked-time-detail': {
                title: 'Blocked Time Analysis',
                charts: this.data.bottlenecks,
                totalPercentage: this.data.currentWeek.blockedTimePercentage
            },
            'hardware-bench-detail': {
                title: 'Hardware Bench Impact',
                benchItems: this.data.workItems.filter(item => item.requiresBench),
                nonBenchItems: this.data.workItems.filter(item => !item.requiresBench),
                multiplier: this.data.currentWeek.hardwareBenchMultiplier
            },
            'reopen-detail': {
                title: 'Reopen Analysis',
                reopenRate: this.data.currentWeek.reopenRate,
                reopenedItems: this.data.workItems.filter(item => item.reopened),
                topCause: this.data.currentWeek.topReopenCause
            },
            'top-delays-detail': {
                title: 'Top Delay Items',
                items: this.data.workItems
                    .sort((a, b) => b.cycleTime - a.cycleTime)
                    .slice(0, 5)
            },
            'test-plan-detail': {
                title: 'Test Plan Impact',
                withTestPlan: this.data.workItems.filter(item => item.hasTestPlan),
                withoutTestPlan: this.data.workItems.filter(item => !item.hasTestPlan),
                speedup: this.data.currentWeek.testPlanChecklistSpeedup
            }
        };

        return drillDownData[drillDownId] || null;
    }
}

// Example queries for the chat interface
const exampleQueries = [
    "What's the single biggest reason tasks are slow this week?",
    "Which MQTT areas cause the most reopens?",
    "Show me the top 5 items driving cycle time",
    "If we limit WIP to 2 per person, what happens historically?",
    "Give me 3 experiments for reducing blocked time",
    "Why are we slow this week?"
];
