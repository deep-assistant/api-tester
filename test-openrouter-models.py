import aiohttp
import asyncio
import time
import os
import textwrap
from typing import Dict, List, Tuple

# OpenRouter models to test
try_completions_config = {
    # Frontier Reasoning Models
    "openai/gpt-5-pro": [],
    "openai/gpt-5.1": [],
    "anthropic/claude-opus-4.5": [],
    "anthropic/claude-sonnet-4.5": [],
    "anthropic/claude-haiku-4.5": [],

    # Specialized Coding Models
    "openai/gpt-5.1-codex": [],
    "kwaipilot/kat-coder-pro:free": [],

    # Advanced Reasoning Models
    "deepseek/deepseek-v3.2": [],
    "google/gemini-3-pro-preview": [],
    "google/gemini-2.5-flash-preview-09-2025": [],
    "moonshotai/kimi-k2-thinking": [],

    # Multimodal Vision Models
    "z-ai/glm-4.6v": [],
    "qwen/qwen3-vl-235b-a22b-instruct": [],
    "nvidia/nemotron-nano-12b-v2-vl": [],

    # Efficient/Open Models
    "mistralai/mistral-large-2512": [],
    "mistralai/ministral-14b-2512": [],
    "amazon/nova-2-lite-v1:free": [],
    "allenai/olmo-3-32b-think:free": [],

    # Specialized/Research Models
    "perplexity/sonar-pro-search": [],
    "prime-intellect/intellect-3": [],
    "minimax/minimax-m2": [],
    "x-ai/grok-4.1-fast": [],

    # Legacy/Popular Models
    "openai/gpt-4o": [],
    "openai/gpt-4o-mini": [],
    "anthropic/claude-3.5-sonnet": [],
    "anthropic/claude-3-opus": [],
    "google/gemini-pro": [],
    "meta-llama/llama-3.3-70b-instruct": [],
    "deepseek/deepseek-chat": [],
    "qwen/qwen-2.5-72b-instruct": [],
}

models = list(try_completions_config.keys())


def format_status(status: str, max_length: int = 40) -> str:
    """Format status for table display"""
    if len(status) <= max_length:
        return status
    return textwrap.shorten(status, width=max_length, placeholder="...")


def build_markdown_table(
    headers: List[str], rows: List[List[str]], alignments: List[str] = None
) -> str:
    """Build a markdown formatted table"""
    if alignments is None:
        alignments = ["left"] * len(headers)

    # Determine maximum content widths per column
    max_len = [len(str(h)) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            max_len[i] = max(max_len[i], len(str(cell)))

    # Build header row
    header_cells = [str(h).ljust(max_len[i]) for i, h in enumerate(headers)]
    header_row = "| " + " | ".join(header_cells) + " |"

    # Build separator row
    sep_cells = []
    for i, align in enumerate(alignments):
        if align == "center":
            sep_cells.append(":" + "-" * (max_len[i] - 2) + ":")
        elif align == "right":
            sep_cells.append("-" * (max_len[i] - 1) + ":")
        else:  # left
            sep_cells.append("-" * max_len[i])
    sep_row = "| " + " | ".join(sep_cells) + " |"

    # Build data rows
    data_rows = []
    for row in rows:
        cells = []
        for i, cell in enumerate(row):
            text = str(cell)
            if alignments[i] == "right":
                cells.append(text.rjust(max_len[i]))
            elif alignments[i] == "center":
                cells.append(text.center(max_len[i]))
            else:
                cells.append(text.ljust(max_len[i]))
        data_rows.append("| " + " | ".join(cells) + " |")

    return "\n".join([header_row, sep_row] + data_rows)


async def test_model(session: aiohttp.ClientSession, model: str, api_key: str) -> Dict:
    """Test a single OpenRouter model"""
    base_url = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")
    url = f"{base_url}/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/link-assistant/api-tester",
        "X-Title": "API Tester - OpenRouter Model Checker",
    }

    payload = {
        "messages": [{"role": "user", "content": "hi"}],
        "model": model,
        "max_tokens": 20,
    }

    start_time = time.time()
    result = {
        "model": model,
        "status": "",
        "response_time": 0.0,
        "is_correct": False,
        "actual_model": "",
    }

    try:
        async with session.post(url, json=payload, headers=headers, timeout=None) as response:
            response_time = time.time() - start_time
            result["response_time"] = round(response_time, 2)

            if response.status == 200:
                data = await response.json()
                response_model = data.get("model", "")
                result["actual_model"] = response_model

                # OpenRouter may return the exact model ID or a variant
                # Check if the response model matches the requested model
                model_base = model.split("/")[1] if "/" in model else model
                result["is_correct"] = (
                    response_model == model or model_base in response_model
                )

                result["status"] = (
                    "Success"
                    if result["is_correct"]
                    else f"Wrong model: {response_model}"
                )

            else:
                result["status"] = f"HTTP {response.status}"
                try:
                    error_data = await response.json()
                    if "error" in error_data and "message" in error_data["error"]:
                        result["status"] += f": {error_data['error']['message']}"
                except:
                    pass

    except Exception as e:
        result["status"] = f"Error: {str(e)}"

    return result


async def main():
    """Main function to test all OpenRouter models"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        api_key = input("Enter OpenRouter API key: ")

    print("\nStarting OpenRouter model tests...")

    async with aiohttp.ClientSession() as session:
        tasks = [test_model(session, model, api_key) for model in models]
        results = await asyncio.gather(*tasks)

        total_time = sum(r["response_time"] for r in results)
        successful = sum(1 for r in results if r["is_correct"])

        # Build results table
        print("\nTest Results:")
        headers = ["Model", "Actual Model", "Status", "Time", "Working"]
        rows = [
            [
                r["model"],
                r["actual_model"] or "N/A",
                format_status(r["status"]),
                f"{r['response_time']:.2f}",
                "🟩" if r["is_correct"] else "🟥",
            ]
            for r in results
        ]
        print(
            build_markdown_table(
                headers, rows, ["left", "left", "left", "right", "center"]
            )
        )

        print(f"\nTotal tested: {len(models)} models")
        print(f"Successful responses: {successful}")
        print(f"Total testing time: {total_time:.2f} sec")

        # Sort working models by speed
        working_models = sorted(
            [(r["model"], r["response_time"]) for r in results if r["is_correct"]],
            key=lambda x: x[1],
        )
        if working_models:
            print("\nWorking models (sorted by speed):")
            for model, resp_time in working_models:
                print(f"- {model}: {resp_time:.2f} sec")


if __name__ == "__main__":
    asyncio.run(main())
