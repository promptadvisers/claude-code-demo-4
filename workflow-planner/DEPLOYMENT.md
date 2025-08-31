# Deployment Guide

This application uses:
- **GPT-5 Nano (2025-08-07)** for workflow planning conversations
- **Claude Sonnet 4** via Vercel serverless proxy for JSON generation

## Quick Setup for Testing

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy the app:**
   ```bash
   vercel --prod
   ```

3. **Add your API keys to Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add both:
     - `OPENAI_API_KEY=your-openai-api-key`
     - `ANTHROPIC_API_KEY=your-anthropic-api-key`

4. **Test the deployment:**
   - Visit your Vercel URL
   - The Claude proxy will be at: `https://your-app.vercel.app/api/claude-proxy`

### Option 2: Local Development

1. **Start local server:**
   ```bash
   python3 -m http.server 8085
   ```

2. **For Claude API to work locally, you need to run the proxy separately.**
   
   Install Vercel CLI and run:
   ```bash
   vercel dev
   ```
   
   This will run the proxy at `http://localhost:3000/api/claude-proxy`

3. **Update the proxy endpoint in app.js for local development:**
   ```javascript
   const proxyEndpoint = 'http://localhost:3000/api/claude-proxy';
   ```

## API Models Used

- **GPT-5 Nano**: `gpt-5-nano-2025-08-07`
- **Claude Sonnet 4**: `claude-sonnet-4-20250514`

## Files Created

- `/api/claude-proxy.js` - Serverless function to proxy Claude API calls
- `vercel.json` - Vercel configuration with CORS headers
- `.env` - Your API keys (already exists)

## Security Notes

- API keys are never exposed in the browser
- Claude calls go through secure serverless proxy
- CORS is properly configured for browser access