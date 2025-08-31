#!/usr/bin/env python3
"""
Test script to verify OpenAI API connectivity
"""

import urllib.request
import urllib.error
import json

API_KEY = 'your-openai-api-key-here'  # Replace with your OpenAI API key
API_ENDPOINT = 'https://api.openai.com/v1/chat/completions'

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {API_KEY}'
}

data = {
    'model': 'gpt-4o-mini',
    'messages': [
        {'role': 'system', 'content': 'You are a helpful assistant.'},
        {'role': 'user', 'content': 'Say "API is working!" in 5 words or less.'}
    ],
    'temperature': 0.7,
    'max_tokens': 50
}

print("Testing OpenAI API connection...")
try:
    req = urllib.request.Request(API_ENDPOINT, 
                                 data=json.dumps(data).encode('utf-8'),
                                 headers=headers)
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"✅ Success! Response: {result['choices'][0]['message']['content']}")
        
except urllib.error.HTTPError as e:
    error_data = e.read().decode('utf-8')
    print(f"❌ Error {e.code}: {error_data}")
except Exception as e:
    print(f"❌ Connection error: {e}")