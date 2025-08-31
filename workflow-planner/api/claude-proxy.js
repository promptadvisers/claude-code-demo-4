// Vercel serverless function to proxy Claude API requests
// This bypasses CORS issues and keeps API keys secure

export default async function handler(req, res) {
    // Set CORS headers to allow requests from your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }
    
    try {
        const { system, userPrompt, anthropicApiKey } = req.body;
        
        // Validate required fields
        if (!system || !userPrompt || !anthropicApiKey) {
            res.status(400).json({ 
                error: 'Missing required fields: system, userPrompt, anthropicApiKey' 
            });
            return;
        }
        
        // Make request to Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 64000,
                system: system,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.1
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        
        // Return Claude's response
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Claude proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to call Claude API',
            details: error.message 
        });
    }
}