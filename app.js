// Main application logic
class QADashboardApp {
    constructor() {
        this.insightsEngine = new InsightsEngine(qaData);
        this.activeExperiments = new Set();
        this.init();
    }

    init() {
        this.renderDate();
        this.renderTodaysBrief();
        this.renderExamplePrompts();
        this.setupEventListeners();
    }

    // Render current date
    renderDate() {
        const dateDisplay = document.getElementById('dateDisplay');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', options);
    }

    // Render Today's Brief section
    renderTodaysBrief() {
        const briefContainer = document.getElementById('todaysBrief');
        const briefItems = this.insightsEngine.generateTodaysBrief();

        briefItems.forEach(item => {
            const briefElement = document.createElement('div');
            briefElement.className = 'brief-item';
            briefElement.innerHTML = `
                <div>${item.text}</div>
                <div class="context">📊 ${item.metric}</div>
            `;

            // Add click handler for drill-down (future feature)
            briefElement.addEventListener('click', () => {
                this.handleBriefDrillDown(item.drillDown);
            });

            briefContainer.appendChild(briefElement);
        });
    }

    // Render example prompts
    renderExamplePrompts() {
        const promptsContainer = document.getElementById('examplePrompts');

        exampleQueries.forEach(query => {
            const promptElement = document.createElement('button');
            promptElement.className = 'example-prompt';
            promptElement.textContent = query;
            promptElement.addEventListener('click', () => {
                this.handleExamplePromptClick(query);
            });
            promptsContainer.appendChild(promptElement);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        sendButton.addEventListener('click', () => {
            this.handleSendMessage();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });
    }

    // Handle example prompt click
    handleExamplePromptClick(query) {
        const chatInput = document.getElementById('chatInput');
        chatInput.value = query;
        this.handleSendMessage();
    }

    // Handle sending a chat message
    handleSendMessage() {
        const chatInput = document.getElementById('chatInput');
        const query = chatInput.value.trim();

        if (!query) return;

        // Add user message to chat
        this.addChatMessage(query, 'user');

        // Clear input
        chatInput.value = '';

        // Show loading state
        const loadingId = this.addChatMessage('Analyzing...', 'assistant', true);

        // Simulate processing delay for realism
        setTimeout(() => {
            // Remove loading message
            this.removeChatMessage(loadingId);

            // Get response from insights engine
            const response = this.insightsEngine.handleQuery(query);

            // Add assistant response
            this.addChatMessage(response.answer, 'assistant');

            // Show evidence cards
            this.renderEvidence(response.evidence);

            // Show experiment suggestions
            if (response.experiments && response.experiments.length > 0) {
                this.renderExperiments(response.experiments);
            }

            // Show query suggestions if available
            if (response.suggestions) {
                const suggestionText = `\n\n💡 You might also want to ask:\n${response.suggestions.map(s => `• ${s}`).join('\n')}`;
                this.addChatMessage(suggestionText, 'assistant');
            }
        }, 800);
    }

    // Add a message to chat history
    addChatMessage(text, sender, isLoading = false) {
        const chatHistory = document.getElementById('chatHistory');
        const messageElement = document.createElement('div');
        const messageId = 'msg-' + Date.now();

        messageElement.id = messageId;
        messageElement.className = `chat-message ${sender}`;
        if (isLoading) {
            messageElement.classList.add('loading');
        }

        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div>${text}</div>
            <div class="timestamp">${timestamp}</div>
        `;

        chatHistory.appendChild(messageElement);

        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;

        return messageId;
    }

    // Remove a chat message
    removeChatMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }

    // Render evidence cards
    renderEvidence(evidenceData) {
        const evidenceSection = document.getElementById('evidenceSection');
        const evidenceCards = document.getElementById('evidenceCards');

        // Clear previous evidence
        evidenceCards.innerHTML = '';

        if (!evidenceData || evidenceData.length === 0) {
            evidenceSection.style.display = 'none';
            return;
        }

        // Show section
        evidenceSection.style.display = 'block';

        // Create cards
        evidenceData.forEach(evidence => {
            const card = document.createElement('div');
            card.className = 'evidence-card';
            card.innerHTML = `
                <h3>${evidence.title}</h3>
                <div class="metric-value">${evidence.metric}</div>
                <div class="detail">${evidence.detail}</div>
            `;
            evidenceCards.appendChild(card);
        });

        // Scroll to evidence section
        evidenceSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Render experiment suggestions
    renderExperiments(experimentIds) {
        const experimentsSection = document.getElementById('experimentsSection');
        const experimentCards = document.getElementById('experimentCards');

        // Clear previous experiments
        experimentCards.innerHTML = '';

        if (!experimentIds || experimentIds.length === 0) {
            experimentsSection.style.display = 'none';
            return;
        }

        // Show section
        experimentsSection.style.display = 'block';

        // Create cards
        experimentIds.forEach(experimentId => {
            const experiment = this.insightsEngine.getExperiment(experimentId);
            if (!experiment) return;

            const isActive = this.activeExperiments.has(experimentId);

            const card = document.createElement('div');
            card.className = 'experiment-card';
            card.innerHTML = `
                <h3>${experiment.title}</h3>
                <div class="insight"><strong>Insight:</strong> ${experiment.insight}</div>
                <div class="why"><strong>Why:</strong> ${experiment.why}</div>
                <div class="action"><strong>What to try:</strong> ${experiment.action}</div>
                <div class="impact"><strong>Expected impact:</strong> ${experiment.expectedImpact}</div>
                <div class="impact"><strong>How we'll measure:</strong> ${experiment.measure}</div>
                <button
                    class="experiment-button ${isActive ? 'activated' : ''}"
                    data-experiment-id="${experimentId}"
                >
                    ${isActive ? '✓ Running for 1 week' : 'Run this for 1 week'}
                </button>
                ${isActive ? '<span class="experiment-status">Active</span>' : ''}
            `;

            // Add click handler for experiment button
            const button = card.querySelector('.experiment-button');
            button.addEventListener('click', () => {
                this.handleExperimentActivation(experimentId, button);
            });

            experimentCards.appendChild(card);
        });

        // Scroll to experiments section
        experimentsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Handle experiment activation
    handleExperimentActivation(experimentId, button) {
        if (this.activeExperiments.has(experimentId)) {
            // Already active - show message
            this.addChatMessage(
                `The "${this.insightsEngine.getExperiment(experimentId).title}" experiment is already running. Check back in a few days for results.`,
                'assistant'
            );
            return;
        }

        // Activate experiment
        this.activeExperiments.add(experimentId);
        button.classList.add('activated');
        button.textContent = '✓ Running for 1 week';

        // Add status badge
        const card = button.closest('.experiment-card');
        if (!card.querySelector('.experiment-status')) {
            const status = document.createElement('span');
            status.className = 'experiment-status';
            status.textContent = 'Active';
            button.after(status);
        }

        // Add confirmation message
        const experiment = this.insightsEngine.getExperiment(experimentId);
        this.addChatMessage(
            `✅ Experiment "${experiment.title}" is now active. I'll track the metrics and report back in one week with results.`,
            'assistant'
        );
    }

    // Handle brief item drill-down
    handleBriefDrillDown(drillDownId) {
        const drillDownData = this.insightsEngine.getDrillDown(drillDownId);

        if (!drillDownData) {
            this.addChatMessage(
                'Detailed breakdown coming soon! For now, try asking specific questions about this metric.',
                'assistant'
            );
            return;
        }

        // For now, just show a message. Future: could show detailed modal or chart
        this.addChatMessage(
            `📊 Drill-down for ${drillDownData.title} - detailed view coming soon! Try asking questions about this metric for more insights.`,
            'assistant'
        );
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new QADashboardApp();
    console.log('QA Dashboard initialized successfully');
});
