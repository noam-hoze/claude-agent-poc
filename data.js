// Mock QA Data Model
// This represents the data structure for QA workflow events and metrics

const qaData = {
    // Time-series metrics for the current week
    currentWeek: {
        medianCycleTime: 2.4, // days
        previousWeekCycleTime: 1.6,
        blockedTimePercentage: 41,
        topBlocker: 'environment readiness',
        reopenRate: 12,
        hardwareBenchMultiplier: 2.1,
        topReopenCause: 'missing negative tests on MQTT payload validation',
        testPlanChecklistSpeedup: 18,
        topDelayItems: 3,
        topDelayPercentage: 27
    },

    // Individual work items with event history
    workItems: [
        {
            id: 'QA-101',
            title: 'MQTT payload validation for sensor data',
            labels: ['mqtt', 'validation', 'env'],
            requiresBench: false,
            events: [
                { type: 'created', timestamp: '2026-01-22T09:00:00Z' },
                { type: 'qa_started', timestamp: '2026-01-23T10:00:00Z' },
                { type: 'blocked', timestamp: '2026-01-23T14:00:00Z', reason: 'environment readiness' },
                { type: 'unblocked', timestamp: '2026-01-24T09:00:00Z' },
                { type: 'qa_done', timestamp: '2026-01-25T15:00:00Z' },
                { type: 'reopened', timestamp: '2026-01-26T11:00:00Z', reason: 'missing edge case tests' },
                { type: 'qa_started', timestamp: '2026-01-26T13:00:00Z' },
                { type: 'qa_done', timestamp: '2026-01-27T10:00:00Z' }
            ],
            cycleTime: 3.2,
            blockedTime: 0.8,
            reopened: true
        },
        {
            id: 'QA-102',
            title: 'Hardware bench stress test for new controller',
            labels: ['hardware', 'bench-required', 'stress-test'],
            requiresBench: true,
            hasTestPlan: true,
            events: [
                { type: 'created', timestamp: '2026-01-21T08:00:00Z' },
                { type: 'qa_started', timestamp: '2026-01-22T09:00:00Z' },
                { type: 'blocked', timestamp: '2026-01-22T11:00:00Z', reason: 'bench scheduling' },
                { type: 'unblocked', timestamp: '2026-01-24T14:00:00Z' },
                { type: 'qa_done', timestamp: '2026-01-26T16:00:00Z' }
            ],
            cycleTime: 4.3,
            blockedTime: 2.1,
            reopened: false
        },
        {
            id: 'QA-103',
            title: 'API endpoint validation for telemetry',
            labels: ['api', 'telemetry'],
            requiresBench: false,
            hasTestPlan: true,
            events: [
                { type: 'created', timestamp: '2026-01-23T10:00:00Z' },
                { type: 'qa_started', timestamp: '2026-01-24T09:00:00Z' },
                { type: 'qa_done', timestamp: '2026-01-25T11:00:00Z' }
            ],
            cycleTime: 1.1,
            blockedTime: 0,
            reopened: false
        },
        {
            id: 'QA-104',
            title: 'Sensor calibration verification',
            labels: ['hardware', 'bench-required', 'calibration'],
            requiresBench: true,
            events: [
                { type: 'created', timestamp: '2026-01-20T09:00:00Z' },
                { type: 'qa_started', timestamp: '2026-01-21T10:00:00Z' },
                { type: 'blocked', timestamp: '2026-01-21T15:00:00Z', reason: 'bench scheduling' },
                { type: 'unblocked', timestamp: '2026-01-25T09:00:00Z' },
                { type: 'qa_done', timestamp: '2026-01-27T14:00:00Z' }
            ],
            cycleTime: 6.2,
            blockedTime: 3.8,
            reopened: false
        },
        {
            id: 'QA-105',
            title: 'UI update for dashboard metrics',
            labels: ['ui', 'dashboard'],
            requiresBench: false,
            events: [
                { type: 'created', timestamp: '2026-01-24T08:00:00Z' },
                { type: 'qa_started', timestamp: '2026-01-25T09:00:00Z' },
                { type: 'blocked', timestamp: '2026-01-25T11:00:00Z', reason: 'environment readiness' },
                { type: 'unblocked', timestamp: '2026-01-25T16:00:00Z' },
                { type: 'qa_done', timestamp: '2026-01-26T10:00:00Z' }
            ],
            cycleTime: 1.1,
            blockedTime: 0.2,
            reopened: false
        }
    ],

    // Historical data for trend analysis
    historicalMetrics: {
        weeklyAverageCycleTime: [1.8, 1.9, 1.6, 2.1, 2.4], // last 5 weeks
        weeklyReopenRate: [8, 10, 7, 9, 12], // last 5 weeks
        weeklyBlockedPercentage: [35, 38, 32, 40, 41] // last 5 weeks
    },

    // Common bottlenecks and their frequencies
    bottlenecks: [
        { stage: 'environment readiness', frequency: 12, avgDelay: 0.9 },
        { stage: 'bench scheduling', frequency: 8, avgDelay: 2.3 },
        { stage: 'PR handoff delay', frequency: 15, avgDelay: 1.1 },
        { stage: 'flaky test reruns', frequency: 6, avgDelay: 0.4 }
    ]
};

// Example queries with pre-computed responses
const queryDatabase = {
    "what's the single biggest reason tasks are slow this week": {
        answer: "Environment readiness is the single biggest bottleneck this week, accounting for 41% of total work time. This is primarily driven by delayed environment provisioning and configuration issues.",
        evidence: [
            {
                title: "Items Driving the Slowdown",
                metric: "12 items",
                detail: "12 out of 15 items this week were blocked waiting for environment readiness"
            },
            {
                title: "Average Wait Time",
                metric: "0.9 days",
                detail: "Average time spent waiting for environments per item"
            },
            {
                title: "Trend",
                metric: "+9%",
                detail: "Environment-related delays increased 9% from last week"
            }
        ],
        experiments: ['reduce_environment_wait']
    },
    "which mqtt areas cause the most reopens": {
        answer: "MQTT payload validation is the primary cause of reopens, particularly around edge cases in sensor data formatting. 75% of MQTT-related reopens stem from missing negative tests for malformed payloads.",
        evidence: [
            {
                title: "MQTT Reopen Rate",
                metric: "25%",
                detail: "25% of MQTT items are reopened vs 12% overall"
            },
            {
                title: "Top Issue",
                metric: "Payload validation",
                detail: "Missing edge case tests for sensor data formats"
            },
            {
                title: "Impact",
                metric: "+1.8 days",
                detail: "Average additional cycle time when MQTT items are reopened"
            }
        ],
        experiments: ['mqtt_edge_cases']
    },
    "show me the top 5 items driving cycle time": {
        answer: "The top 5 items account for 67% of total cycle time this week. Three require hardware bench access, and two had extended blocked periods due to environment issues.",
        evidence: [
            {
                title: "QA-104",
                metric: "6.2 days",
                detail: "Sensor calibration - 3.8 days blocked on bench scheduling"
            },
            {
                title: "QA-102",
                metric: "4.3 days",
                detail: "Hardware stress test - 2.1 days blocked on bench"
            },
            {
                title: "QA-101",
                metric: "3.2 days",
                detail: "MQTT validation - reopened for edge case tests"
            },
            {
                title: "Pattern",
                metric: "60%",
                detail: "60% of delay time is hardware bench access"
            }
        ],
        experiments: ['bench_scheduling', 'reduce_environment_wait']
    },
    "why are we slow this week": {
        answer: "Three main factors are driving slowdown this week: (1) Environment readiness delays affecting 80% of items, (2) Hardware bench bottleneck with 2.1x multiplier on cycle time, and (3) Increased reopen rate (12% vs 7% baseline) due to missing MQTT edge case tests.",
        evidence: [
            {
                title: "Primary Factor",
                metric: "41%",
                detail: "Time spent blocked on environment readiness"
            },
            {
                title: "Hardware Impact",
                metric: "2.1x slower",
                detail: "Bench-required items take 2.1x longer than simulation-only"
            },
            {
                title: "Quality Issues",
                metric: "12% reopen",
                detail: "Reopen rate up from 7% baseline, mostly MQTT"
            }
        ],
        experiments: ['reduce_environment_wait', 'bench_scheduling', 'mqtt_edge_cases']
    },
    "if we limit wip to 2 per person, what happens historically": {
        answer: "Historical simulation (last 8 weeks) suggests limiting WIP to 2 per person would reduce median cycle time by approximately 15% (from 2.4 to 2.0 days) but might increase queue wait time by 0.5 days. Net effect: ~10% improvement in total lead time.",
        evidence: [
            {
                title: "Cycle Time Impact",
                metric: "-15%",
                detail: "Median cycle time reduction based on historical patterns"
            },
            {
                title: "Queue Time",
                metric: "+0.5 days",
                detail: "Estimated increase in wait time before QA starts"
            },
            {
                title: "Focus Benefit",
                metric: "-23%",
                detail: "Context switching overhead reduction"
            }
        ],
        experiments: ['wip_limit']
    },
    "give me 3 experiments for reducing blocked time": {
        answer: "Based on current bottleneck analysis, here are three high-impact experiments to reduce blocked time: (1) Daily environment readiness bot check + single owner, (2) Separate bench-required work into scheduled queue, (3) Add PR handoff SLA with required QA notes section.",
        evidence: [
            {
                title: "Environment Delays",
                metric: "41%",
                detail: "Current time lost to environment readiness waits"
            },
            {
                title: "Bench Scheduling",
                metric: "2.3 days",
                detail: "Average delay when bench access is needed"
            },
            {
                title: "Handoff Delay",
                metric: "1.1 days",
                detail: "Average time between dev done and QA start"
            }
        ],
        experiments: ['reduce_environment_wait', 'bench_scheduling', 'speed_up_handoffs']
    }
};

// Experiment definitions
const experiments = {
    reduce_environment_wait: {
        title: "Reduce Environment Wait Time",
        insight: "41% of work time is waiting for environment readiness",
        why: "Environment provisioning and configuration delays are the primary bottleneck, affecting 80% of items this week.",
        action: "Implement daily 'environment readiness' bot check at 8am + assign single owner for bench scheduling. Create shared calendar for environment availability.",
        expectedImpact: "Reduce environment-related blocked time by 50% (from 41% to ~20%). Estimated 15% reduction in median cycle time.",
        measure: "Track: (1) Blocked time percentage, (2) Environment readiness response time, (3) Median cycle time"
    },
    bench_scheduling: {
        title: "Separate Bench-Required Work Earlier",
        insight: "Bench-required tasks take 2.1x longer than simulation-only work",
        why: "Hardware bench access is a major multiplier on cycle time, but we don't identify and schedule these items proactively.",
        action: "Add required label at creation ('bench-needed: yes/no'). Auto-route 'yes' items into a scheduled queue with 2-day advance booking. Create bench utilization dashboard.",
        expectedImpact: "Reduce bench-related delays from 2.3 days to <1 day. Decrease p90 cycle time for bench work by 35%.",
        measure: "Track: (1) Bench queue length, (2) p90 cycle time for bench items, (3) Bench utilization %"
    },
    mqtt_edge_cases: {
        title: "Cut Reopen Loop from MQTT Edge Cases",
        insight: "MQTT items have 25% reopen rate vs 12% overall",
        why: "Reopens cluster around payload validation misses, particularly for malformed sensor data and edge cases.",
        action: "Auto-generate 'MQTT contract edge-case' checklist for any item touching MQTT topics. Include: null values, oversized payloads, malformed JSON, missing required fields.",
        expectedImpact: "Reduce MQTT reopen rate from 25% to <10%. Cut average reopen cycle time addition from 1.8 to 0.5 days.",
        measure: "Track: (1) Reopen rate by component, (2) Bug escape rate, (3) Checklist completion rate"
    },
    speed_up_handoffs: {
        title: "Speed Up PR Handoffs",
        insight: "Items wait ~1 day between 'dev done' and 'qa start'",
        why: "Handoff delays occur because PRs often lack sufficient context for QA to start immediately.",
        action: "Add SLA: PR must include 'QA Notes' section (what changed, test scenarios, edge cases) or it can't move to QA column. Create PR template with required sections.",
        expectedImpact: "Reduce handoff delay from 1.1 days to <0.3 days. Decrease total lead time by ~8%.",
        measure: "Track: (1) Handoff delay (dev done → qa start), (2) PR template completion rate, (3) 'Blocked on clarification' incidents"
    },
    wip_limit: {
        title: "Limit Work-in-Progress to 2 per Person",
        insight: "High WIP correlates with longer cycle times and context switching",
        why: "Team members juggling 3+ items simultaneously leads to context switching overhead and delayed handoffs.",
        action: "Enforce WIP limit of 2 active items per person. Must complete or hand off before pulling new work. Use board swim lanes to visualize.",
        expectedImpact: "Reduce median cycle time by ~15%. Decrease context switching overhead by 23%.",
        measure: "Track: (1) Median cycle time, (2) Time in active states, (3) Handoff frequency"
    }
};
