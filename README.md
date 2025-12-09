# API Tester

Testing and monitoring tools for AI API gateways, including model availability checking for Deep.Assistant (PiAPI) and OpenRouter.

## Features

- **Model Availability Testing**: Automated testing of model availability across multiple AI providers
- **Dual Provider Support**: Test both PiAPI and OpenRouter models
- **Multiple Languages**: JavaScript and Python implementations
- **GitHub Actions Integration**: Automated scheduled testing with CI/CD workflows
- **Detailed Reporting**: Comprehensive test results with response times and success rates

## Model Testing Scripts

### PiAPI Model Testing

Test Deep.Assistant API Gateway models:

**JavaScript:**
```bash
node test-models.mjs
```

**Python:**
```bash
python model.py
```

### OpenRouter Model Testing

Test OpenRouter models:

**JavaScript:**
```bash
export OPENROUTER_API_KEY="your-api-key"
node test-openrouter-models.mjs
```

**Python:**
```bash
export OPENROUTER_API_KEY="your-api-key"
python test-openrouter-models.py
```

## Usage Examples

This repository also contains usage examples in different programming languages:

- **[JavaScript Example](examples/javascript/)** - Node.js example using the OpenAI SDK
- **[Python Example](examples/python/)** - Python example using the OpenAI SDK

Each example directory contains:
- Complete working code
- Dependencies file (package.json or requirements.txt)
- Environment configuration (.env)
- Detailed README with setup instructions

## Quick Start

### Testing Model Availability

1. Set your API key:
   ```bash
   # For PiAPI
   export OPENAI_API_KEY="your-piapi-key"

   # For OpenRouter
   export OPENROUTER_API_KEY="your-openrouter-key"
   ```

2. Run the test script:
   ```bash
   # Test PiAPI models (JavaScript)
   node test-models.mjs

   # Test OpenRouter models (Python)
   python test-openrouter-models.py
   ```

### Using the Examples

1. Navigate to your preferred language example:
   ```bash
   cd examples/javascript  # or examples/python
   ```

2. Follow the README instructions in that directory

## API Keys

### PiAPI (Deep.Assistant)
Get your API key from the Telegram bot: https://t.me/DeepGPTBot
Use the `/api` command to obtain your key.

### OpenRouter
Get your API key from: https://openrouter.ai/keys
Sign up and create an API key in your account dashboard.

## GitHub Actions Workflows

This repository includes automated testing workflows:

- **PiAPI Model Testing**: Runs every 6 hours to check model availability
- **OpenRouter Model Testing**: Runs every 6 hours to check model availability

Both workflows can be manually triggered from the Actions tab with language selection options.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.