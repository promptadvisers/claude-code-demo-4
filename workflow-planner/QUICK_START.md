# 🚀 Your Workflow Planner is Ready!

## Access Your Application

**URL:** http://localhost:8085

The server is currently running. Open the URL above in your browser to start using the application.

## How to Use

1. **Type or Select**: Enter your automation idea in the text box or click one of the suggestion buttons
2. **Engage in Dialogue**: The AI will ask 2-3 clarifying questions about:
   - Your current systems and tools
   - Available APIs
   - Your manual process
3. **Get Your Diagram**: After understanding your needs, the AI will generate a Mermaid workflow diagram
4. **Refine**: You can continue the conversation to modify and improve the diagram

## Test Examples to Try

- "I want to automate lead nurturing for real estate"
- "Help me build an invoice processing pipeline" 
- "Create a workflow for monitoring competitor prices"
- "I need to automate customer onboarding emails"

## Features Implemented

✅ **Interactive Chat** - Maintains conversation context
✅ **Smart Questions** - AI asks relevant clarifying questions
✅ **Visual Diagrams** - Generates Mermaid flowcharts inline
✅ **Iterative Refinement** - Modify diagrams through conversation
✅ **Beautiful UI** - Modern blue/orange gradient theme
✅ **API Integration** - Connected to OpenAI GPT-4o-mini (as GPT-5 nano proxy)

## Server Management

- **Stop Server**: Press Ctrl+C in the terminal
- **Restart Server**: Run `python3 server.py` in the workflow-planner directory
- **Change Port**: Edit PORT variable in server.py if 8085 is occupied

## Technical Details

- API Key is embedded in app.js
- Using GPT-4o-mini model (GPT-5 nano compatible structure)
- Max tokens set to 5000 for comprehensive responses
- Context window maintains last 10 messages

Enjoy building your automation workflows! 🎉