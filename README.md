# API Tester

Testing examples for Deep.Assistant API Gateway that demonstrate OpenAI-compatible usage.

## Setup

1. Copy the `.env` file and configure your API credentials:
   ```bash
   cp .env .env.local  # optional: create local copy
   ```

2. Set your API key and base URL in `.env`:
   ```env
   OPENAI_API_KEY=your_api_key_here
   OPENAI_API_BASE=https://api.deep.assistant.run.place/v1
   ```

## JavaScript Example

Install dependencies:
```bash
npm install
```

Run the JavaScript example:
```bash
npm start
# or
node example.js
```

## Python Example

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the Python example:
```bash
python example.py
```

## API Key

Get your API key from the Telegram bot: https://t.me/DeepGPTBot
Use the `/api` command to obtain your key.