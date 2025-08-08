import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_API_KEY"; // Get from /api command at https://t.me/DeepGPTBot
const OPENAI_API_BASE = process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE || "https://api.deep.assistant.run.place/v1/";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_API_BASE
});

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Hi' }],
    model: 'gpt-4o-mini',
  });
  console.log(chatCompletion.choices[0].message.content);
}

main();