# JavaScript Example

This example demonstrates how to use the Deep.Assistant API with JavaScript/Node.js and the OpenAI SDK.

## Setup

1. Copy the example environment file and configure your API credentials:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your API credentials:
   ```env
   OPENAI_API_KEY=YOUR_TOKEN_HERE
   OPENAI_API_BASE=https://api.deep.assistant.run.place/v1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Example

```bash
npm start
# or
node example.js
```

## Code Overview

The example uses:
- `openai` - OpenAI JavaScript SDK
- `dotenv` - Environment variable loading from .env file
- Standard OpenAI environment variables (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_API_BASE`)

## API Key

Get your API key from the Telegram bot: https://t.me/DeepGPTBot
Use the `/api` command to obtain your key.