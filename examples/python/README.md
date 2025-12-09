# Python Example

This directory contains examples for using different APIs with Python.

## Examples

1. **Deep.Assistant API** (`example.py`) - OpenAI-compatible API gateway
2. **Midjourney API via Legnext** (`midjourney_example.py`) - Generate images using Midjourney

## Setup

1. Copy the example environment file and configure your API credentials:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your API credentials:
   ```env
   # For Deep.Assistant API
   OPENAI_API_KEY=YOUR_TOKEN_HERE
   OPENAI_API_BASE=https://api.deep.assistant.run.place/v1

   # For Legnext Midjourney API
   LEGNEXT_API_KEY=YOUR_LEGNEXT_API_KEY
   LEGNEXT_API_BASE=https://api.legnext.ai/api
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Examples

### Deep.Assistant API Example

```bash
python example.py
# or
python3 example.py
```

This example uses:
- `openai` - OpenAI Python SDK
- `python-dotenv` - Environment variable loading from .env file
- Standard OpenAI environment variables (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_API_BASE`)

### Midjourney API Example

```bash
python midjourney_example.py
# or
python3 midjourney_example.py
```

This example demonstrates:
- Creating an image generation job with a text prompt
- Polling for job completion
- Retrieving the generated image URL

The example uses:
- `requests` - HTTP client for API requests
- `python-dotenv` - Environment variable loading from .env file
- Legnext API for unofficial Midjourney access

## API Keys

- **Deep.Assistant API Key**: Get from the Telegram bot at https://t.me/DeepGPTBot (use `/api` command)
- **Legnext API Key**: Get from https://legnext.ai/app/api-keys