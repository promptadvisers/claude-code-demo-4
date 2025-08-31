# Workflow Planner - AI-Powered Automation Assistant

An interactive web application that helps users plan and design automation workflows using AI-powered conversation and visual Mermaid diagrams.

## Features

- **Interactive AI Chat**: Engages in back-and-forth dialogue to understand your automation needs
- **Smart Clarification**: Asks targeted questions about systems, APIs, and processes
- **Visual Workflow Generation**: Automatically creates Mermaid diagrams from conversations
- **Iterative Refinement**: Allows you to refine and modify generated workflows
- **Beautiful UI**: Modern blue/orange theme with smooth animations

## Quick Start

1. **Start the server**:
   ```bash
   python3 server.py
   ```
   Or simply:
   ```bash
   ./server.py
   ```

2. **Open your browser**: Navigate to http://localhost:8080

3. **Start planning**: Type your automation idea or click a suggestion button

## How It Works

1. **Describe Your Need**: Tell the AI what you want to automate
2. **Answer Questions**: The AI will ask 2-3 clarifying questions about your systems and processes
3. **Review Diagram**: A visual workflow diagram will be generated automatically
4. **Iterate**: Provide feedback to refine the workflow until it's perfect

## Example Prompts

- "I want to automate lead nurturing for real estate"
- "Help me build an invoice processing pipeline"
- "Create a workflow for daily AI news digest"
- "I need to automate customer support ticket routing"

## API Configuration

The application uses OpenAI's GPT API. The API key is currently embedded in `app.js`. For production use, implement a backend proxy to secure your API key.

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: OpenAI GPT API (GPT-4o-mini)
- **Visualization**: Mermaid.js for diagram generation
- **Server**: Python HTTP server with CORS support

## Browser Support

Works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

To modify the application:

1. Edit `app.js` for logic changes
2. Edit `styles.css` for styling updates
3. Edit `index.html` for structure changes

The server automatically serves the latest files - just refresh your browser after making changes.

## Notes

- The application maintains conversation context for coherent dialogue
- Maximum output tokens set to 5000 for comprehensive responses
- Diagrams are generated inline and can be refined through conversation
- The UI is fully responsive and works on mobile devices