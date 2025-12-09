#!/usr/bin/env python3
"""
Model availability checker for GitHub Actions.
Tests Deep.Assistant API models and reports their availability.
"""
import os
import sys
import json
import asyncio
import aiohttp
from typing import Dict, List, Any


# Model configurations
MODELS = [
    "o3-mini",
    "o1-preview",
    "o1-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "gpt-auto",
    "claude-3-opus",
    "claude-3-5-sonnet",
    "claude-3-5-haiku",
    "claude-3-7-sonnet",
    "deepseek-chat",
    "deepseek-reasoner",
]


async def test_model(session: aiohttp.ClientSession, model: str, api_key: str) -> Dict[str, Any]:
    """Test a single model for availability."""
    url = f"{os.getenv('OPENAI_API_BASE', 'https://api.deep.assistant.run.place/v1')}/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "messages": [{"role": "user", "content": "Test"}],
        "model": model,
        "max_tokens": 10
    }

    result = {
        "model": model,
        "available": False,
        "status": "",
        "error": None
    }

    try:
        async with session.post(
            url,
            json=payload,
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=60)
        ) as response:
            if response.status == 200:
                data = await response.json()
                response_model = data.get("model", "")

                # Check if the returned model matches the requested model
                if response_model == model:
                    result["available"] = True
                    result["status"] = "Available"
                else:
                    result["status"] = f"Wrong model returned: {response_model}"
                    result["error"] = f"Expected {model}, got {response_model}"
            else:
                result["status"] = f"HTTP {response.status}"
                try:
                    error_data = await response.json()
                    if 'error' in error_data and 'message' in error_data['error']:
                        result["error"] = error_data['error']['message']
                        result["status"] = f"HTTP {response.status}: {result['error']}"
                except:
                    result["error"] = f"HTTP error {response.status}"

    except asyncio.TimeoutError:
        result["status"] = "Timeout"
        result["error"] = "Request timed out after 60 seconds"
    except Exception as e:
        result["status"] = "Error"
        result["error"] = str(e)

    return result


async def test_all_models(api_key: str, models: List[str] = None) -> Dict[str, Any]:
    """Test all models or a specific subset."""
    if models is None:
        models = MODELS

    print(f"Testing {len(models)} model(s)...")

    async with aiohttp.ClientSession() as session:
        tasks = [test_model(session, model, api_key) for model in models]
        results = await asyncio.gather(*tasks)

    # Organize results
    available = []
    unavailable = []

    for result in results:
        if result["available"]:
            available.append(result["model"])
        else:
            unavailable.append({
                "model": result["model"],
                "status": result["status"],
                "error": result["error"]
            })

    return {
        "total": len(models),
        "available": available,
        "unavailable": unavailable,
        "results": results
    }


def print_results(summary: Dict[str, Any]) -> None:
    """Print test results in a readable format."""
    print("\n" + "=" * 60)
    print("MODEL AVAILABILITY TEST RESULTS")
    print("=" * 60)

    print(f"\nTotal models tested: {summary['total']}")
    print(f"Available models: {len(summary['available'])}")
    print(f"Unavailable models: {len(summary['unavailable'])}")

    if summary['available']:
        print("\n✓ AVAILABLE MODELS:")
        for model in summary['available']:
            print(f"  - {model}")

    if summary['unavailable']:
        print("\n✗ UNAVAILABLE MODELS:")
        for item in summary['unavailable']:
            print(f"  - {item['model']}: {item['status']}")
            if item['error']:
                print(f"    Error: {item['error']}")

    print("\n" + "=" * 60)


def main():
    """Main entry point."""
    # Get API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    # Parse command line arguments for specific models
    models_to_test = MODELS
    if len(sys.argv) > 1:
        # Test specific models passed as arguments
        models_to_test = sys.argv[1:]
        print(f"Testing specific models: {', '.join(models_to_test)}")

    # Run tests
    summary = asyncio.run(test_all_models(api_key, models_to_test))

    # Print results
    print_results(summary)

    # Output JSON for GitHub Actions
    if os.getenv("GITHUB_ACTIONS"):
        output_file = os.getenv("GITHUB_OUTPUT")
        if output_file:
            with open(output_file, "a") as f:
                f.write(f"available_count={len(summary['available'])}\n")
                f.write(f"unavailable_count={len(summary['unavailable'])}\n")
                f.write(f"total_count={summary['total']}\n")

    # Exit with error code if any models are unavailable
    if summary['unavailable']:
        print(f"\n⚠ Warning: {len(summary['unavailable'])} model(s) unavailable")
        sys.exit(1)
    else:
        print("\n✓ All models are available!")
        sys.exit(0)


if __name__ == "__main__":
    main()
