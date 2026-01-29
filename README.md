# QA Productivity Dashboard

A **chat-first QA Productivity Dashboard** that provides auto-generated daily briefs and queryable insights for QA team metrics.

## Features

### 1. Today's Brief (Auto-Generated)
- 6-10 short sentences with metrics and clickable drill-downs
- Real-time insights on cycle time, blocked time, reopen rates
- Identifies top bottlenecks and delays
- Shows impact of best practices (e.g., test plan checklists)

### 2. Ask a Question (Chat Interface)
- Natural language query interface
- Pre-populated example prompts for common questions
- Intelligent query matching and response generation

### 3. Evidence Cards
- Visual metric cards supporting each answer
- Clear display of key performance indicators
- Trend indicators and comparisons

### 4. Suggested Experiments (One-Click)
- Data-driven experiment suggestions
- One-click activation with "Run this for 1 week" buttons
- Clear explanation of:
  - Insight: What the data shows
  - Why: Root cause analysis
  - What to try: Specific action steps
  - Expected impact: Predicted improvements
  - How we'll measure: Success metrics

## Getting Started

### Quick Start
Simply open `index.html` in a web browser. No build step or dependencies required!

```bash
# Clone the repository
git clone https://github.com/noam-hoze/claude-agent-poc.git
cd claude-agent-poc

# Open in browser
open index.html
# or
python -m http.server 8000
# then visit http://localhost:8000
```

### Project Structure

```
.
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── data.js            # Mock QA data model
├── insights.js        # Insights generation engine
├── app.js             # Main application logic
├── README.md          # This file
└── CLAUDE.md          # Project context for AI assistants
```

## Example Queries

Try asking questions like:

- "What's the single biggest reason tasks are slow this week?"
- "Which MQTT areas cause the most reopens?"
- "Show me the top 5 items driving cycle time"
- "If we limit WIP to 2 per person, what happens historically?"
- "Give me 3 experiments for reducing blocked time"
- "Why are we slow this week?"

## Data Model

The dashboard uses a realistic QA workflow data model with:

- **Work Items**: Individual QA tasks with event history
- **Events**: created, qa_started, blocked, unblocked, reopened, qa_done
- **Metrics**: cycle time, blocked time, reopen rate, etc.
- **Labels**: Environment tags, hardware requirements, test types
- **Bottlenecks**: Common delay points with frequency and impact

### Sample Work Item Structure

```javascript
{
    id: 'QA-101',
    title: 'MQTT payload validation for sensor data',
    labels: ['mqtt', 'validation', 'env'],
    requiresBench: false,
    events: [
        { type: 'created', timestamp: '2026-01-22T09:00:00Z' },
        { type: 'qa_started', timestamp: '2026-01-23T10:00:00Z' },
        // ... more events
    ],
    cycleTime: 3.2,
    blockedTime: 0.8,
    reopened: true
}
```

## Available Experiments

The dashboard suggests 5 evidence-based experiments:

1. **Reduce Environment Wait Time** - Address 41% blocked time on environment readiness
2. **Separate Bench-Required Work Earlier** - Tackle 2.1x cycle time multiplier for hardware bench items
3. **Cut Reopen Loop from MQTT Edge Cases** - Reduce 25% MQTT reopen rate
4. **Speed Up PR Handoffs** - Eliminate ~1 day handoff delay
5. **Limit Work-in-Progress** - Reduce context switching with WIP limits

## Current Metrics (Mock Data)

- **Median Cycle Time**: 2.4 days (↑ from 1.6 days last week)
- **Blocked Time**: 41% of work time
- **Reopen Rate**: 12%
- **Hardware Bench Multiplier**: 2.1x slower
- **Top Bottleneck**: Environment readiness

## Customization

### Adding New Queries

Edit `data.js` to add new query patterns:

```javascript
const queryDatabase = {
    "your new query pattern": {
        answer: "Your detailed answer here...",
        evidence: [ /* evidence cards */ ],
        experiments: ['experiment_id']
    }
};
```

### Adding New Experiments

Define new experiments in `data.js`:

```javascript
const experiments = {
    your_experiment_id: {
        title: "Experiment Title",
        insight: "What the data shows",
        why: "Root cause explanation",
        action: "Specific steps to take",
        expectedImpact: "Predicted improvements",
        measure: "Success metrics"
    }
};
```

### Connecting Real Data

Replace the mock data in `data.js` with your actual QA workflow data:

1. Connect to your issue tracking system (Jira, GitHub Issues, etc.)
2. Extract work item events and metrics
3. Calculate cycle times, blocked times, and reopen rates
4. Update the `qaData` object with real values

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS with CSS Grid and Flexbox
- **Data**: Mock JSON data (easily replaceable with API calls)
- **No Dependencies**: No build tools or external libraries required

## Future Enhancements

- [ ] Connect to real QA tracking systems
- [ ] Interactive charts and visualizations
- [ ] Historical trend analysis
- [ ] Custom experiment tracking
- [ ] Team performance comparisons
- [ ] Export reports to PDF/CSV
- [ ] Email notifications for key metrics
- [ ] Mobile app version

## Contributing

This project follows standard coding practices outlined in `CLAUDE.md`:

- Write clear, maintainable code
- Include comments for complex logic
- Follow existing code patterns
- Write tests for new features
- Keep PRs focused on single features

## License

MIT License - feel free to use and modify for your team's needs.

## Support

For issues or questions, please open a GitHub issue in the repository.

---

**Built with ❤️ for QA teams** - Making productivity insights accessible and actionable.
