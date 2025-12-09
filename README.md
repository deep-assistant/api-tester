# API Tester

Testing examples for Deep.Assistant API Gateway that demonstrate OpenAI-compatible usage.

## Examples

This repository contains examples in different programming languages:

- **[JavaScript Example](examples/javascript/)** - Node.js example using the OpenAI SDK
- **[Python Example](examples/python/)** - Python example using the OpenAI SDK

Each example directory contains:
- Complete working code
- Dependencies file (package.json or requirements.txt)
- Environment configuration (.env)
- Detailed README with setup instructions

## Quick Start

1. Navigate to your preferred language example:
   ```bash
   cd examples/javascript  # or examples/python
   ```

2. Follow the README instructions in that directory

## API Key

Get your API key from the Telegram bot: https://t.me/DeepGPTBot
Use the `/api` command to obtain your key.

## Model Availability Testing

This repository includes automated model availability checkers for both Python and JavaScript that can be run locally or via GitHub Actions.

### Supported Models

The following models are tested:
- `o3-mini`, `o1-preview`, `o1-mini`
- `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`, `gpt-auto`
- `claude-3-opus`, `claude-3-5-sonnet`, `claude-3-5-haiku`, `claude-3-7-sonnet`
- `deepseek-chat`, `deepseek-reasoner`

### Local Testing

#### Python

```bash
# Install dependencies
pip install -r requirements.txt

# Set your API key
export OPENAI_API_KEY="your-api-key-here"

# Test all models
python check_models.py

# Test specific models
python check_models.py gpt-4o claude-3-5-sonnet
```

#### JavaScript

```bash
# Install dependencies
npm install

# Set your API key
export OPENAI_API_KEY="your-api-key-here"

# Test all models
node check_models.js

# Test specific models
node check_models.js gpt-4o claude-3-5-sonnet
```

### GitHub Actions

The repository includes three GitHub Actions workflows for automated model testing:

1. **Check Models - Python** (`.github/workflows/check-models-python.yml`)
   - Tests models using Python
   - Runs daily at 6:00 UTC
   - Can be manually triggered with specific models

2. **Check Models - JavaScript** (`.github/workflows/check-models-javascript.yml`)
   - Tests models using JavaScript
   - Runs daily at 6:00 UTC
   - Can be manually triggered with specific models

3. **Check All Models** (`.github/workflows/check-all-models.yml`)
   - Tests models using both Python and JavaScript
   - Runs daily at 6:00 UTC
   - Provides a combined summary of results

#### Manual Workflow Execution

You can manually trigger any workflow from the GitHub Actions tab:

1. Go to the **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Optionally specify models to test (e.g., `gpt-4o claude-3-5-sonnet`)
5. Click **Run workflow** to start

#### Required Secrets

To use GitHub Actions, you need to configure the following secret:

- `OPENAI_API_KEY` - Your Deep.Assistant API key (get from [@DeepGPTBot](https://t.me/DeepGPTBot) using `/api` command)

#### Optional Variables

- `OPENAI_API_BASE` - Custom API base URL (defaults to `https://api.deep.assistant.run.place/v1`)

#### Setting up Secrets

1. Go to your repository **Settings**
2. Navigate to **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `OPENAI_API_KEY` with your API key

### Output Format

The model checkers provide detailed output including:
- Total models tested
- Available models count
- Unavailable models count
- Detailed status for each model
- Error messages for failures

Example output:
```
============================================================
MODEL AVAILABILITY TEST RESULTS
============================================================

Total models tested: 13
Available models: 10
Unavailable models: 3

✓ AVAILABLE MODELS:
  - gpt-4o
  - gpt-4o-mini
  - claude-3-5-sonnet
  ...

✗ UNAVAILABLE MODELS:
  - model-name: HTTP 404: Model not found
    Error: The model 'model-name' does not exist

============================================================
```