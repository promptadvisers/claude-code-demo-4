## **Making API Calls**

## **Using the Responses API (Recommended)**

Python Example:

python

`from openai import OpenAI`

`client = OpenAI(api_key="your-api-key-here")`

`response = client.responses.create(`  
    `model="gpt-5-nano",`  
    `input="Write a brief summary about renewable energy",`  
    `reasoning={"effort": "minimal"},`  
    `text={"verbosity": "medium"},`  
    `max_output_tokens=200`  
`)`

`print(response.output_text)`

cURL Example:

bash

`curl -s https://api.openai.com/v1/responses \`  
  `-H "Authorization: Bearer $OPENAI_API_KEY" \`  
  `-H "Content-Type: application/json" \`  
  `-d '{`  
    `"model": "gpt-5-nano",`  
    `"input": "Write a brief summary about renewable energy",`  
    `"reasoning": {"effort": "minimal"},`  
    `"text": {"verbosity": "medium"},`  
    `"max_output_tokens": 200`  
  `}'`

## **Using Chat Completions API**

Python Example:

python

`from openai import OpenAI`

`client = OpenAI(api_key="your-api-key-here")`

`response = client.chat.completions.create(`  
    `model="gpt-5-nano",`  
    `messages=[`  
        `{"role": "system", "content": "You are a helpful assistant."},`  
        `{"role": "user", "content": "Explain quantum computing in simple terms."}`  
    `],`  
    `temperature=0.7,`  
    `max_tokens=500`  
`)`

`print(response.choices[0].message.content)`

cURL Example:

bash

`curl -X POST https://api.openai.com/v1/chat/completions \`  
  `-H "Content-Type: application/json" \`  
  `-H "Authorization: Bearer $OPENAI_API_KEY" \`  
  `-d '{`  
    `"model": "gpt-5-nano",`  
    `"messages": [`  
      `{"role": "user", "content": "Hello, world!"}`  
    `],`  
    `"max_tokens": 100`  
  `}'`

## **Key Parameters**

## **Core Parameters**

* model: Use "gpt-5-nano" or "gpt-5-nano-2025-08-07" for the specific snapshot  
* temperature: Controls randomness (0.0-2.0), lower values for more focused outputs  
* max\_tokens / max\_output\_tokens: Limits response length to manage costs

## **GPT-5 Specific Parameters**

* reasoning.effort: Set to "minimal" for fastest responses with GPT-5 Nano  
* text.verbosity: Control response detail with "low", "medium", or "high"

## **Model Capabilities**

Strengths:

* Excellent for summarization and classification tasks  
* Very fast response times  
* Most cost-efficient option in GPT-5 family  
* 400,000 context window  
* 128,000 max output tokens  
* Supports text and image inputs

Best Use Cases:

* High-throughput applications  
* Simple instruction-following  
* Classification tasks  
* Mobile assistants  
* IoT interfaces  
* Educational tools

## **Rate Limits**

Rate limits vary by tier:

| Tier | RPM | TPM | Batch Queue Limit |
| :---- | :---- | :---- | :---- |
| Tier 1 | 500 | 200,000 | 2,000,000 |
| Tier 2 | 5,000 | 2,000,000 | 20,000,000 |
| Tier 3 | 5,000 | 4,000,000 | 40,000,000 |
| Tier 4 | 10,000 | 10,000,000 | 1,000,000,000 |
| Tier 5 | 30,000 | 180,000,000 | 15,000,000,000 |

## **Alternative Providers**

If you prefer using third-party providers, GPT-5 Nano is also available through:

* CometAPI: 20% discount on official pricing  
* AI/ML API: Supports the model with comprehensive documentation  
* Vercel AI Gateway: Direct access without separate provider accounts  
* OpenRouter: API access with provider statistics

## **Security Best Practices**

1. Never expose API keys: Store them in environment variables or secure configuration files  
2. Use HTTPS: All requests should be sent over secure connections  
3. Monitor usage: Regularly check your OpenAI dashboard for usage and billing  
4. Revoke compromised keys: Immediately replace any exposed API keys

## **Getting Started**

1. Set up your OpenAI account and generate an API key  
2. Add credits to your account (minimum $5 recommended for testing)  
3. Choose your preferred API endpoint (Responses API recommended for new projects)  
4. Start with simple requests using reasoning.effort: "minimal" for fastest responses  
5. Adjust parameters based on your specific use case requirements

GPT-5 Nano provides an excellent entry point into the GPT-5 ecosystem, offering substantial capabilities at the lowest cost and highest speed in the family.

