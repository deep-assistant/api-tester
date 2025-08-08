import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_API_KEY")  # Get from /api command at https://t.me/DeepGPTBot
OPENAI_API_BASE = os.getenv("OPENAI_BASE_URL") or os.getenv("OPENAI_API_BASE", "https://api.deep.assistant.run.place/v1/")

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_API_BASE
)

def main():
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": "Hi"}],
        model="gpt-4o-mini",
    )
    print(chat_completion.choices[0].message.content)

if __name__ == "__main__":
    main()