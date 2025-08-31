const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envFile.split('\n').forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...values] = line.split('=');
                envVars[key.trim()] = values.join('=').trim().replace(/^['"]|['"]$/g, '');
            }
        });
        return envVars;
    }
    return {};
}

const env = loadEnv();
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle Claude proxy
    if (req.url === '/api/claude-proxy' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const { system, userPrompt, anthropicApiKey } = requestData;

                console.log('🔥 Proxy received Claude API request:', {
                    systemLength: system?.length || 0,
                    userPromptLength: userPrompt?.length || 0,
                    hasApiKey: !!anthropicApiKey
                });

                // Validate required fields
                if (!system || !userPrompt || !anthropicApiKey) {
                    console.log('❌ Missing required fields in Claude request');
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Missing required fields: system, userPrompt, anthropicApiKey'
                    }));
                    return;
                }

                // Prepare Claude API request
                const claudeRequest = JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 64000,
                    system: system,
                    messages: [{
                        role: 'user',
                        content: userPrompt
                    }],
                    temperature: 0.1
                });

                const options = {
                    hostname: 'api.anthropic.com',
                    port: 443,
                    path: '/v1/messages',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': anthropicApiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Length': Buffer.byteLength(claudeRequest)
                    }
                };

                const claudeReq = https.request(options, (claudeRes) => {
                    let responseData = '';
                    claudeRes.on('data', chunk => {
                        responseData += chunk;
                    });

                    claudeRes.on('end', () => {
                        console.log('📡 Claude API response status:', claudeRes.statusCode);
                        if (claudeRes.statusCode === 200) {
                            try {
                                const parsedResponse = JSON.parse(responseData);
                                console.log('📋 Claude API response data:', {
                                    contentItems: parsedResponse.content?.length || 0,
                                    responseLength: parsedResponse.content?.[0]?.text?.length || 0
                                });
                            } catch (e) {
                                console.log('📋 Claude API response (unparseable):', responseData.substring(0, 200));
                            }
                        } else {
                            console.log('❌ Claude API error response:', responseData.substring(0, 500));
                        }
                        res.writeHead(claudeRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(responseData);
                    });
                });

                claudeReq.on('error', (error) => {
                    console.error('Claude API error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: 'Failed to call Claude API',
                        details: error.message
                    }));
                });

                claudeReq.write(claudeRequest);
                claudeReq.end();

            } catch (error) {
                console.error('Proxy error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Internal server error',
                    details: error.message
                }));
            }
        });
        return;
    }

    // Serve static files for other requests
    const staticPath = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, staticPath);
    
    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };

        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Claude proxy available at: http://localhost:${PORT}/api/claude-proxy`);
});