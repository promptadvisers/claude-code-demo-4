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

// Application state
let conversationHistory = [];
let currentStage = 'initial'; // initial, clarifying, ready_for_diagram
let clarificationCount = 0;
let diagramCount = 0;

// DOM Elements
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const chatSection = document.getElementById('chatSection');
const chatContainer = document.getElementById('chatContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');

// Event Listeners
submitBtn.addEventListener('click', handleSubmit);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        userInput.value = btn.dataset.suggestion;
        handleSubmit();
    });
});

// Main submit handler
async function handleSubmit() {
    const input = userInput.value.trim();
    if (!input) return;
    
    // Show chat section if hidden
    if (chatSection.style.display === 'none') {
        chatSection.style.display = 'block';
    }
    
    // Add user message to chat
    addMessage('user', input);
    
    // Clear input
    userInput.value = '';
    
    // Process the input
    await processUserInput(input);
}

// Add message to chat
function addMessage(role, content, isDiagram = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'AI Assistant';
    
    const contentDiv = document.createElement('div');
    
    if (isDiagram) {
        contentDiv.className = 'mermaid-container';
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = content;
        contentDiv.appendChild(mermaidDiv);
        mermaid.init(undefined, mermaidDiv);
    } else {
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Process user input with GPT-5 Nano
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
        
        // Make API call to GPT-5 Nano
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Using GPT-4o-mini as fallback since GPT-5-nano might not be available yet
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

// Get system prompt based on current stage
function getSystemPrompt() {
    const basePrompt = `You are an expert workflow automation consultant specializing in n8n workflows. Your goal is to help users plan and design automation workflows through collaborative dialogue.`;
    
    if (currentStage === 'initial') {
        return `${basePrompt}
        
The user has just described what they want to automate. You need to ask 2-3 clarifying questions to better understand their needs. Focus on:
1. What specific systems or tools they're currently using
2. Whether these systems have APIs or integration capabilities
3. The current manual process they follow
4. The expected volume and frequency of the workflow

Be conversational but concise. After the user provides this information, you'll help them create a detailed workflow diagram.`;
    } else if (currentStage === 'clarifying') {
        return `${basePrompt}
        
Continue gathering information about the user's workflow needs. If they seem unclear or provide incomplete answers, make educated assumptions about their process and confirm with them. For example: "Based on what you've described, it sounds like you need to [assumption]. Is that correct?"

After this round of clarification, you should have enough information to create a workflow diagram.`;
    } else if (currentStage === 'ready_for_diagram' || currentStage === 'diagram_generated') {
        return `${basePrompt}
        
Based on the conversation so far, create a detailed Mermaid diagram showing the workflow the user wants to automate. The diagram should:
1. Show all major steps in the process
2. Include decision points and branches
3. Indicate which systems/APIs are involved at each step
4. Use clear, descriptive labels

Format the diagram as a Mermaid flowchart using this syntax:
\`\`\`mermaid
graph TD
    A[Start] --> B[Step 1]
    B --> C{Decision?}
    C -->|Yes| D[Action 1]
    C -->|No| E[Action 2]
\`\`\`

After presenting the diagram, ask if they'd like to modify any part of it. Be ready to iterate based on their feedback.`;
    }
    
    return basePrompt;
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input
    userInput.focus();
});