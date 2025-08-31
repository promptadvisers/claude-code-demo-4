# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains documentation for:
1. n8n workflow design principles and best practices
2. GPT-5 Nano API integration examples

## Key Resources

### n8n Workflow Development

When working with n8n workflows in this context, follow these core principles:

- **Naming**: Use descriptive node names that explain their function
- **Configuration**: Use centralized configuration nodes early in workflows
- **Control Flow**: Prefer Switch nodes over IF nodes for conditional logic
- **Cost Optimization**: Start with cheaper AI models (Gemini Flash, GPT-4o-mini) before expensive ones
- **Testing**: Pin data during development, limit items for testing, use page size=1 for debugging
- **Error Handling**: Implement retry logic (3-5 retries with 5-second delays) and use Error Trigger nodes
- **Performance**: Structure workflows for parallel execution where possible
- **Security**: Use environment variables for credentials, never hardcode them

### GPT-5 Nano Integration

When implementing GPT-5 Nano API calls:

- **Model**: Use `gpt-5-nano` or `gpt-5-nano-2025-08-07`
- **Endpoints**: Prefer the Responses API for new projects
- **Parameters**: Set `reasoning.effort: "minimal"` for fastest responses
- **Context**: 400,000 token context window, 128,000 max output tokens
- **Best For**: Summarization, classification, high-throughput applications

#### Python Example (Responses API - Recommended)

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key-here")

response = client.responses.create(
    model="gpt-5-nano",
    input="Your prompt here",
    reasoning={"effort": "minimal"},  # Fastest responses
    text={"verbosity": "medium"},      # Control detail level: low/medium/high
    max_output_tokens=200
)

print(response.output_text)
```

#### Python Example (Chat Completions API)

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key-here")

response = client.chat.completions.create(
    model="gpt-5-nano",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Your prompt here"}
    ],
    temperature=0.7,  # 0.0-2.0, lower = more focused
    max_tokens=500
)

print(response.choices[0].message.content)
```

#### cURL Example

```bash
curl -s https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5-nano",
    "input": "Your prompt here",
    "reasoning": {"effort": "minimal"},
    "text": {"verbosity": "medium"},
    "max_output_tokens": 200
  }'
```

## Development Notes

- This is primarily a documentation repository without executable code
- Focus on maintaining and improving documentation clarity
- When adding examples, ensure they follow the established patterns in the existing documentation