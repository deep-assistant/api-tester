# Python Example

This example demonstrates how to use the Deep.Assistant API with Python and the OpenAI SDK.

## Setup

1. Configure your API credentials in `.env`:
   ```env
   OPENAI_API_KEY=your_api_key_here
   OPENAI_API_BASE=https://api.deep.assistant.run.place/v1
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Example

```bash
python example.py
# or
python3 example.py
```

## Code Overview

The example uses:
- `openai` - OpenAI Python SDK
- `python-dotenv` - Environment variable loading from .env file
- Standard OpenAI environment variables (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_API_BASE`)

## API Key

Get your API key from the Telegram bot: https://t.me/DeepGPTBot
Use the `/api` command to obtain your key.