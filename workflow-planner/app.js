// Configuration
const API_KEY = 'your-openai-api-key-here'; // Replace with your OpenAI API key
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Initialize Mermaid
mermaid.initialize({ 
    startOnLoad: true,
    theme: 'default',
    themeVariables: {
        primaryColor: '#2563eb',
        primaryTextColor: '#fff',
        primaryBorderColor: '#1e40af',
        lineColor: '#fb923c',
        secondaryColor: '#fb923c',
        tertiaryColor: '#fbbf24'
    }
});

// Playful loading messages
const loadingMessages = [
    "The AI workflow builder is thinking... 🤔",
    "Analyzing your automation needs... 🔍",
    "Crafting the perfect workflow... ✨",
    "Consulting the automation spirits... 🔮",
    "Building something amazing... 🚀",
    "Almost there, just dotting the i's... ✏️",
    "Optimizing for maximum efficiency... ⚡",
    "Putting the pieces together... 🧩"
];

// Application state
let conversationHistory = [];
let currentStage = 'initial';
let clarificationCount = 0;
let diagramCount = 0;
let currentLoadingMessageIndex = 0;
let loadingInterval = null;

// DOM Elements
const container = document.querySelector('.container');
const inputSection = document.getElementById('inputSection') || document.querySelector('.input-section');
const chatInterface = document.getElementById('chatInterface');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const backBtn = document.getElementById('backBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');
const diagramModal = document.getElementById('diagramModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const downloadPng = document.getElementById('downloadPng');
const downloadSvg = document.getElementById('downloadSvg');

// Event Listeners
submitBtn.addEventListener('click', handleInitialSubmit);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleInitialSubmit();
    }
});

sendBtn.addEventListener('click', handleChatSubmit);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSubmit();
    }
});

backBtn.addEventListener('click', () => {
    // Go back to initial screen
    chatInterface.style.display = 'none';
    inputSection.style.display = 'block';
    document.querySelector('.main-title').style.display = 'block';
    // Clear conversation
    conversationHistory = [];
    currentStage = 'initial';
    clarificationCount = 0;
    diagramCount = 0;
    chatMessages.innerHTML = '';
    userInput.value = '';
});

suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        userInput.value = btn.dataset.suggestion;
        handleInitialSubmit();
    });
});

// Modal event listeners
modalClose.addEventListener('click', () => {
    diagramModal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === diagramModal) {
        diagramModal.classList.remove('active');
    }
});

downloadPng.addEventListener('click', downloadDiagramAsPng);
downloadSvg.addEventListener('click', downloadDiagramAsSvg);

// Handle initial form submission
function handleInitialSubmit() {
    const input = userInput.value.trim();
    if (!input) return;
    
    // Switch to chat interface
    inputSection.style.display = 'none';
    document.querySelector('.main-title').style.display = 'none';
    chatInterface.style.display = 'flex';
    
    // Add user message to chat
    addMessage('user', input);
    
    // Clear input
    userInput.value = '';
    
    // Process the input
    processUserInput(input);
}

// Handle chat submission
function handleChatSubmit() {
    const input = chatInput.value.trim();
    if (!input) return;
    
    // Add user message to chat
    addMessage('user', input);
    
    // Clear input
    chatInput.value = '';
    
    // Process the input
    processUserInput(input);
}

// Track diagram retry attempts
let diagramRetryCount = 0;
const MAX_DIAGRAM_RETRIES = 3;

// Add message to chat with markdown support
function addMessage(role, content, isDiagram = false, messageId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    if (messageId) messageDiv.id = messageId;
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'AI Assistant';
    
    const contentDiv = document.createElement('div');
    
    if (isDiagram) {
        // Create clickable diagram container
        const containerDiv = document.createElement('div');
        containerDiv.className = 'mermaid-container';
        containerDiv.id = 'diagram-' + Date.now();
        
        // Try to render the diagram with error handling
        const renderResult = renderMermaidDiagram(content, containerDiv);
        
        if (renderResult.success) {
            containerDiv.title = 'Click to view full diagram';
            // Make it clickable only if successful
            containerDiv.addEventListener('click', () => openDiagramModal(content));
        } else {
            // Handle diagram error
            handleDiagramError(content, containerDiv, renderResult.error);
        }
        
        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(containerDiv);
    } else {
        contentDiv.className = 'message-content';
        // Parse markdown to HTML
        const htmlContent = marked.parse(content);
        contentDiv.innerHTML = htmlContent;
        
        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
    
    return messageDiv;
}

// Render Mermaid diagram with error handling
function renderMermaidDiagram(content, containerDiv) {
    try {
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = content;
        containerDiv.appendChild(mermaidDiv);
        
        // Attempt to parse and render
        mermaid.init(undefined, mermaidDiv);
        
        // Check if rendering was successful
        const svgElement = mermaidDiv.querySelector('svg');
        if (!svgElement) {
            throw new Error('Diagram rendering failed - no SVG generated');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Mermaid rendering error:', error);
        return { success: false, error: error.message };
    }
}

// Handle diagram rendering errors
function handleDiagramError(diagramCode, containerDiv, errorMessage) {
    diagramRetryCount++;
    
    if (diagramRetryCount <= MAX_DIAGRAM_RETRIES) {
        // Show error state with auto-retry message
        containerDiv.innerHTML = `
            <div class="diagram-error">
                <p><strong>📊 Diagram Error Detected</strong></p>
                <p>Automatically fixing the diagram syntax...</p>
                <p class="error-detail">Attempt ${diagramRetryCount} of ${MAX_DIAGRAM_RETRIES}</p>
                <div class="error-spinner"></div>
            </div>
        `;
        containerDiv.classList.add('error-state');
        
        // Automatically request a fixed version
        requestDiagramFix(diagramCode, errorMessage, containerDiv);
    } else {
        // Show final error with manual retry option
        containerDiv.innerHTML = `
            <div class="diagram-error">
                <p><strong>⚠️ Unable to render diagram</strong></p>
                <p>The diagram syntax needs manual correction.</p>
                <button class="retry-diagram-btn" onclick="retryDiagramManually('${encodeURIComponent(diagramCode)}', this.parentElement.parentElement)">
                    Try Again
                </button>
            </div>
        `;
        containerDiv.classList.add('error-state');
        diagramRetryCount = 0; // Reset for next diagram
    }
}

// Request AI to fix the diagram
async function requestDiagramFix(brokenDiagram, errorMessage, containerDiv) {
    const fixPrompt = `The Mermaid diagram has a syntax error. Please fix it and return ONLY the corrected Mermaid code, nothing else.

Error message: ${errorMessage}

Broken diagram:
\`\`\`mermaid
${brokenDiagram}
\`\`\`

Common fixes:
- Ensure all node IDs are defined before being referenced
- Use proper syntax for node shapes: [] for rectangles, {} for diamonds
- Escape special characters in labels
- Use proper arrow syntax: -->, --->, -.->
- Ensure proper indentation and spacing

Return ONLY the fixed Mermaid code without any explanation or markdown fences.`;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a Mermaid diagram syntax expert. Fix syntax errors and return only valid Mermaid code.' },
                    { role: 'user', content: fixPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            let fixedDiagram = data.choices[0].message.content;
            
            // Clean up the response (remove markdown fences if present)
            fixedDiagram = fixedDiagram.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '').trim();
            
            // Try rendering the fixed diagram
            containerDiv.innerHTML = '';
            containerDiv.classList.remove('error-state');
            const renderResult = renderMermaidDiagram(fixedDiagram, containerDiv);
            
            if (renderResult.success) {
                // Success! Make it clickable
                containerDiv.title = 'Click to view full diagram';
                containerDiv.addEventListener('click', () => openDiagramModal(fixedDiagram));
                diagramRetryCount = 0; // Reset counter
                
                // Add success message
                addMessage('assistant', '✅ Diagram syntax has been automatically corrected and is now displaying properly.');
            } else {
                // Still broken, try again or show final error
                handleDiagramError(fixedDiagram, containerDiv, renderResult.error);
            }
        }
    } catch (error) {
        console.error('Error requesting diagram fix:', error);
        // Show error state
        containerDiv.innerHTML = `
            <div class="diagram-error">
                <p><strong>⚠️ Could not auto-fix diagram</strong></p>
                <p>Please try rephrasing your request.</p>
            </div>
        `;
        containerDiv.classList.add('error-state');
    }
}

// Manual retry function (accessible from onclick)
window.retryDiagramManually = function(encodedDiagram, containerDiv) {
    const diagramCode = decodeURIComponent(encodedDiagram);
    diagramRetryCount = 0; // Reset counter
    containerDiv.innerHTML = '';
    containerDiv.classList.remove('error-state');
    handleDiagramError(diagramCode, containerDiv, 'Manual retry requested');
}

// Open diagram in modal
function openDiagramModal(diagramCode) {
    modalBody.innerHTML = '';
    
    // Try to render in modal with error handling
    const renderResult = renderMermaidDiagram(diagramCode, modalBody);
    
    if (!renderResult.success) {
        // Show error in modal
        modalBody.innerHTML = `
            <div class="diagram-error">
                <p><strong>⚠️ Unable to display diagram</strong></p>
                <p>The diagram has syntax errors that need to be corrected.</p>
                <p class="error-detail">${renderResult.error}</p>
            </div>
        `;
    }
    
    // Show modal regardless
    diagramModal.classList.add('active');
}

// Download diagram as PNG
async function downloadDiagramAsPng() {
    const diagramElement = modalBody.querySelector('.mermaid svg');
    if (!diagramElement) return;
    
    try {
        const dataUrl = await domtoimage.toPng(diagramElement);
        const link = document.createElement('a');
        link.download = 'workflow-diagram.png';
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error downloading PNG:', error);
        alert('Failed to download diagram as PNG. Please try again.');
    }
}

// Download diagram as SVG
function downloadDiagramAsSvg() {
    const svgElement = modalBody.querySelector('.mermaid svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.download = 'workflow-diagram.svg';
    link.href = svgUrl;
    link.click();
    
    URL.revokeObjectURL(svgUrl);
}

// Show/hide loading with playful messages inline in chat
let thinkingMessageElement = null;

function showLoading(show) {
    if (show) {
        sendBtn.disabled = true;
        chatInput.disabled = true;
        
        // Add thinking message to chat
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant thinking-message';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'message-label';
        labelDiv.textContent = 'AI Assistant';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Start with first loading message and typing dots
        currentLoadingMessageIndex = 0;
        contentDiv.innerHTML = `<em>${loadingMessages[currentLoadingMessageIndex]}<span class="typing-dots"><span></span><span></span><span></span></span></em>`;
        
        messageDiv.appendChild(labelDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Store reference to remove later
        thinkingMessageElement = messageDiv;
        
        // Auto-scroll to show thinking message
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Start cycling through loading messages
        loadingInterval = setInterval(() => {
            currentLoadingMessageIndex = (currentLoadingMessageIndex + 1) % loadingMessages.length;
            if (thinkingMessageElement) {
                const content = thinkingMessageElement.querySelector('.message-content');
                if (content) {
                    content.innerHTML = `<em>${loadingMessages[currentLoadingMessageIndex]}<span class="typing-dots"><span></span><span></span><span></span></span></em>`;
                }
            }
        }, 2000);
    } else {
        sendBtn.disabled = false;
        chatInput.disabled = false;
        
        // Remove thinking message
        if (thinkingMessageElement && thinkingMessageElement.parentNode) {
            thinkingMessageElement.remove();
            thinkingMessageElement = null;
        }
        
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    }
}

// Process user input with GPT-4
async function processUserInput(input) {
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: input });
    
    // Determine the appropriate system prompt based on stage
    let systemPrompt = getSystemPrompt();
    
    try {
        showLoading(true);
        
        // Prepare messages for API call
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10) // Keep last 10 messages for context
        ];
        
        // Make API call
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 5000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantResponse = data.choices[0].message.content;
        
        // Add assistant response to history
        conversationHistory.push({ role: 'assistant', content: assistantResponse });
        
        // Check if response contains a Mermaid diagram
        const mermaidMatch = assistantResponse.match(/```mermaid\n([\s\S]*?)```/);
        
        if (mermaidMatch) {
            // Extract the diagram and the rest of the message
            const diagramCode = mermaidMatch[1];
            const textBefore = assistantResponse.substring(0, mermaidMatch.index);
            const textAfter = assistantResponse.substring(mermaidMatch.index + mermaidMatch[0].length);
            
            if (textBefore.trim()) {
                addMessage('assistant', textBefore.trim());
            }
            
            // Add the diagram
            addMessage('assistant', diagramCode, true);
            
            if (textAfter.trim()) {
                addMessage('assistant', textAfter.trim());
            }
            
            // Add educational explanation as a second message
            setTimeout(() => {
                addEducationalExplanation(diagramCode);
            }, 1000);
            
            currentStage = 'diagram_generated';
            diagramCount++;
        } else {
            // Regular text response
            addMessage('assistant', assistantResponse);
            
            // Update stage based on clarification count
            if (currentStage === 'initial' || currentStage === 'clarifying') {
                clarificationCount++;
                if (clarificationCount >= 2) {
                    currentStage = 'ready_for_diagram';
                } else {
                    currentStage = 'clarifying';
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('assistant', `Sorry, I encountered an error: ${error.message}. Please try again.`);
    } finally {
        showLoading(false);
    }
}

// Add educational explanation after diagram
async function addEducationalExplanation(diagramCode) {
    const explanationPrompt = `
Based on the workflow diagram that was just created, write a first-person explanation directly to the user explaining:
1. Why I chose this specific workflow design for their needs
2. The intentional design decisions I made and why each step matters
3. How I applied n8n best practices in this design
4. What specific benefits they'll get from this approach

Write as "I" speaking directly to "you" - be conversational, educational, and confident about the design choices. Explain your reasoning behind using certain nodes, the order of operations, and why this structure will be effective for their use case. Maximum 3-4 paragraphs.

Example tone: "I designed this workflow to start with X because... I chose to use a Switch node here instead of IF nodes because... I placed the error handling at this point because..."`;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a workflow automation expert speaking directly to a user. Use first person (I) and explain your design decisions confidently and personally.' },
                    ...conversationHistory.slice(-5),
                    { role: 'user', content: explanationPrompt }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const explanation = data.choices[0].message.content;
            
            // Add explanation as a separate message
            addMessage('assistant', `💡 **My design rationale for this workflow:**\n\n${explanation}`);
            
            // Add Build It button after explanation
            setTimeout(() => {
                addBuildItButton();
            }, 500);
        }
    } catch (error) {
        console.error('Error getting explanation:', error);
    }
}

// Add Build It button after explanation
function addBuildItButton() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = 'AI Assistant';
    
    const buildItContainer = document.createElement('div');
    buildItContainer.className = 'build-it-container';
    
    const description = document.createElement('div');
    description.className = 'build-it-description';
    description.textContent = 'Ready to turn this workflow design into actual n8n JSON code?';
    
    const buildItBtn = document.createElement('button');
    buildItBtn.className = 'build-it-btn';
    buildItBtn.textContent = "Let's Build It! 🚀";
    buildItBtn.id = 'buildWorkflowBtn';
    
    // Add click event listener
    buildItBtn.addEventListener('click', handleBuildItClick);
    
    buildItContainer.appendChild(description);
    buildItContainer.appendChild(buildItBtn);
    
    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(buildItContainer);
    
    chatMessages.appendChild(messageDiv);
    
    // Auto-scroll to show button
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Handle Build It button click (placeholder for Claude 4 Sonnet integration)
function handleBuildItClick() {
    console.log('Build It clicked - will integrate Claude 4 Sonnet');
    
    // Disable button to prevent multiple clicks
    const buildBtn = document.getElementById('buildWorkflowBtn');
    if (buildBtn) {
        buildBtn.disabled = true;
        buildBtn.textContent = 'Building workflow... 🔨';
    }
    
    // TODO: Implement Claude 4 Sonnet integration here
    // For now, show a placeholder message
    addMessage('assistant', '⚙️ **Building your n8n workflow...**\n\nI\'m now using Claude 4 Sonnet to generate the complete n8n JSON workflow based on our design. This will take just a moment...');
    
    // Placeholder for the actual implementation
    setTimeout(() => {
        addMessage('assistant', '🚧 **Integration Coming Soon**\n\nThe Claude 4 Sonnet integration for JSON generation will be implemented in the next step. This will generate a downloadable n8n workflow file.');
        
        // Re-enable button
        if (buildBtn) {
            buildBtn.disabled = false;
            buildBtn.textContent = "Let's Build It! 🚀";
        }
    }, 2000);
}

// Get system prompt based on current stage
function getSystemPrompt() {
    const basePrompt = `You are an expert workflow automation consultant specializing in n8n workflows. Your goal is to help users plan and design automation workflows through collaborative dialogue. Always be friendly, encouraging, and educational.`;
    
    const designPrinciples = `
Key n8n design principles to follow:
- Use descriptive node names that explain their function
- Prefer Switch nodes over IF nodes for conditional logic
- Start with cheaper AI models before expensive ones
- Implement retry logic (3-5 retries with delays) for external APIs
- Use centralized configuration nodes early in workflows
- Group related fields using dot notation
- Build in human oversight for critical decisions`;
    
    if (currentStage === 'initial') {
        return `${basePrompt}
        
The user has just described what they want to automate. You need to ask 2-3 clarifying questions to better understand their needs. Focus on:
1. What specific systems or tools they're currently using
2. Whether these systems have APIs or integration capabilities
3. The current manual process they follow
4. The expected volume and frequency of the workflow

Be conversational but concise. After the user provides this information, you'll help them create a detailed workflow diagram.

${designPrinciples}`;
    } else if (currentStage === 'clarifying') {
        return `${basePrompt}
        
Continue gathering information about the user's workflow needs. If they seem unclear or provide incomplete answers, make educated assumptions about their process and confirm with them. For example: "Based on what you've described, it sounds like you need to [assumption]. Is that correct?"

After this round of clarification, you should have enough information to create a workflow diagram.

${designPrinciples}`;
    } else if (currentStage === 'ready_for_diagram' || currentStage === 'diagram_generated') {
        return `${basePrompt}
        
Based on the conversation so far, create a detailed Mermaid diagram showing the workflow the user wants to automate. 

CRITICAL MERMAID SYNTAX RULES:
- Every node ID must be defined before it's referenced
- Use only alphanumeric characters for node IDs (no spaces or special chars)
- Node shapes: [text] for rectangles, {text} for diamonds, ([text]) for rounded
- Arrow types: --> for solid, -.-> for dotted, ==> for thick
- For text with special characters, wrap in quotes: ["Text with (parentheses)"]
- Escape quotes in labels: [\\"Quoted text\\"]
- Keep node IDs simple: A, B, C or Step1, Step2, Step3

The diagram should:
1. Show all major steps in the process
2. Include decision points and branches
3. Indicate which systems/APIs are involved at each step
4. Use clear, descriptive labels
5. Follow n8n best practices

CORRECT EXAMPLE:
\`\`\`mermaid
graph TD
    Start[Daily Trigger] --> Fetch[Fetch YouTube Data]
    Fetch --> Check{New Videos?}
    Check -->|Yes| Process[Process Video Data]
    Check -->|No| End1[End Workflow]
    Process --> Save[Save to Database]
    Save --> Notify[Send Notification]
    Notify --> End2[End Workflow]
\`\`\`

AVOID THESE COMMON ERRORS:
- Don't use undefined node IDs
- Don't use spaces in node IDs (use Step1 not "Step 1")
- Don't forget to close brackets/braces
- Don't use special characters in IDs

After presenting the diagram, ask if they'd like to modify any part of it. Be ready to iterate based on their feedback.

${designPrinciples}`;
    }
    
    return basePrompt;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input
    userInput.focus();
    
    // Set up marked options for better formatting
    marked.setOptions({
        breaks: true,
        gfm: true
    });
});