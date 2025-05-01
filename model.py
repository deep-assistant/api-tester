import aiohttp
import asyncio
import time
import os
import textwrap

try_completions_config = {
    "o3-mini": [],
    "o1-preview": [],
    "o1-mini": [],
    "gpt-4o": [],
    "gpt-4o-mini": [],
    "gpt-3.5-turbo": [],
    "gpt-auto": [],
    "claude-3-opus": [],
    "claude-3-5-sonnet": [],
    "claude-3-5-haiku": [],
    "claude-3-7-sonnet": [],
    "deepseek-chat": [],
    "deepseek-reasoner": [],
}

models = list(try_completions_config.keys())

def format_status(status, max_length=40):
    """Форматирует статус для отображения в таблице"""
    if len(status) <= max_length:
        return status
    return textwrap.shorten(status, width=max_length, placeholder="...")

async def test_model(session, model, api_key):
    url = f"{os.getenv('API_BASE', 'https://api.deep-foundation.tech/v1')}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messages": [{"role": "user", "content": "Да"}],
        "model": model,
        "max_tokens": 10
    }

    start_time = time.time()
    result = {"model": model, "status": "", "response_time": 0.0, "is_correct": False}

    try:
        async with session.post(
            url,
            json=payload,
            headers=headers,
            timeout=None
        ) as response:

            response_time = time.time() - start_time
            result["response_time"] = round(response_time, 2)

            if response.status == 200:
                data = await response.json()
                response_model = data.get("model", "")
                
                result["is_correct"] = response_model == model
                result["status"] = "Success" if result["is_correct"] else f"Wrong model: {response_model}"
                
            else:
                result["status"] = f"HTTP {response.status}"
                try:
                    error_data = await response.json()
                    if 'error' in error_data and 'message' in error_data['error']:
                        result["status"] += f": {error_data['error']['message']}"
                except:
                    pass

    except Exception as e:
        result["status"] = f"Error: {str(e)}"
    
    return result

async def main():
    api_key = input("Введите API ключ: ")
    print("\nНачинаем проверку моделей...")

    async with aiohttp.ClientSession() as session:
        tasks = [test_model(session, model, api_key) for model in models]
        results = await asyncio.gather(*tasks)

        working_models = []
        total_time = 0.0

        # Определяем максимальную ширину колонок
        max_model_len = max(len(model) for model in models) + 2
        max_status_len = max(len(format_status(res['status'])) for res in results) + 2
        
        # Заголовок таблицы
        print("\nРезультаты тестирования:")
        print("-" * (max_model_len + max_status_len + 23))
        print(f"| {'Модель':<{max_model_len}} | {'Статус':<{max_status_len}} | {'Время':<7} | {'Рабочая':<8} |")
        print("-" * (max_model_len + max_status_len + 23))

        for res in results:
            total_time += res["response_time"]
            working = "Да" if res["is_correct"] else "Нет"
            formatted_status = format_status(res['status'], max_status_len-2)
            print(f"| {res['model']:<{max_model_len}} | {formatted_status:<{max_status_len}} | {res['response_time']:<7.2f} | {working:<8} |")

        print("-" * (max_model_len + max_status_len + 23))
        print(f"\nИтого проверено: {len(models)} моделей")
        print(f"Корректных ответов: {len([r for r in results if r['is_correct']])}")  # Исправленная строка
        print(f"Общее время тестирования: {total_time:.2f} сек")

        working_models = sorted([(r['model'], r['response_time']) for r in results if r['is_correct']], key=lambda x: x[1])
        if working_models:
            print("\nРабочие модели (отсортировано по скорости):")
            for model, resp_time in working_models:
                print(f"- {model}: {resp_time:.2f} сек")

if __name__ == "__main__":
    asyncio.run(main())
