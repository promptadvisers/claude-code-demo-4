# Workflow Planner - AI-Powered Automation Assistant

An interactive web application that helps users plan and design automation workflows using AI-powered conversation and visual Mermaid diagrams.

## Features

- **Interactive AI Chat**: Engages in back-and-forth dialogue to understand your automation needs
- **Smart Clarification**: Asks targeted questions about systems, APIs, and processes
- **Visual Workflow Generation**: Automatically creates Mermaid diagrams from conversations
- **Iterative Refinement**: Allows you to refine and modify generated workflows
- **Beautiful UI**: Modern blue/orange theme with smooth animations

## Quick Start

### 1. Configure API Keys
Set up your `.env` file with your OpenAI and Anthropic API keys (see API Configuration section below).

### 2. Start the Server
Since this is a client-side app, serve it over HTTP (required for loading `.env` file):

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js  
npx http-server -p 8000

# Option 3: PHP
php -S localhost:8000
```

### 3. Open Your Browser
Navigate to http://localhost:8000

### 4. Start Planning
Type your automation idea or click a suggestion button

## How It Works

1. **Describe Your Need**: Tell the AI what you want to automate
2. **Answer Questions**: The AI will ask 2-3 clarifying questions about your systems and processes
3. **Review Diagram**: A visual workflow diagram will be generated automatically
4. **Generate JSON**: Click "Let's Build It!" to create production-ready n8n workflow JSON
5. **Download & Import**: Download the JSON file and import it directly into your n8n instance

## Example Prompts

- "I want to automate lead nurturing for real estate"
- "Help me build an invoice processing pipeline"
- "Create a workflow for daily AI news digest"
- "I need to automate customer support ticket routing"

## API Configuration

### Setup Your API Keys

1. Copy the `.env` file and update it with your actual API keys:
   ```bash
   # Get your OpenAI API key from: https://platform.openai.com/api-keys
   OPENAI_API_KEY=your-actual-openai-api-key-here
   
   # Get your Anthropic API key from: https://console.anthropic.com/
   ANTHROPIC_API_KEY=your-actual-anthropic-api-key-here
   ```

2. Save the `.env` file (it's already in `.gitignore` for security)

### Why Both APIs?
- **OpenAI GPT-4**: Powers the conversational workflow planning
- **Claude 4 Sonnet**: Generates production-ready n8n JSON workflows

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