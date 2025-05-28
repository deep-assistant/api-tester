import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Dynamically load use-m
const { use } = eval(
  await fetch('https://unpkg.com/use-m/use.js').then(u => u.text())
);

// Load environment variables from .env
const dotenv = await use('dotenv@16.1.4');
dotenv.config();

const tryCompletionsConfig = {
  // 'o3-mini': [],
  // 'o1-preview': [],
  // 'o1-mini': [],
  // 'gpt-4o': [],
  // 'gpt-4o-mini': [],
  'gpt-3.5-turbo': [],
  // 'gpt-auto': [],
  // 'claude-3-opus': [],
  // 'claude-3-5-sonnet': [],
  // 'claude-3-5-haiku': [],
  // 'claude-3-7-sonnet': [],
  // 'deepseek-chat': [],
  // 'deepseek-reasoner': [],
};

const models = Object.keys(tryCompletionsConfig);

function formatStatus(status, maxLength = 40) {
  if (status.length <= maxLength) {
    return status;
  }
  return status.slice(0, maxLength - 3) + '...';
}

async function testModel(model, apiKey) {
  const baseUrl = process.env.API_BASE || 'https://api.deep-foundation.tech/v1';
  const url = `${baseUrl}/chat/completions`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  const payload = {
    messages: [{ role: 'user', content: 'hi' }],
    model,
    max_tokens: 20,
  };

  const startTime = Date.now();
  const result = { model, status: '', responseTime: 0, isCorrect: false };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const responseTime = (Date.now() - startTime) / 1000;
    result.responseTime = Number(responseTime.toFixed(2));

    if (response.ok) {
      const data = await response.json();
      const responseModel = data.model || '';
      result.isCorrect = responseModel === model;
      result.status = result.isCorrect ? 'Success' : `Wrong model: ${responseModel}`;
    } else {
      result.status = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          result.status += `: ${errorData.error.message}`;
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  } catch (e) {
    result.status = `Error: ${e.message}`;
  }

  return result;
}

let apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  const rl = readline.createInterface({ input, output });
  apiKey = await rl.question('Enter API key: ');
  rl.close();
}
console.log('\nStarting model tests...');

const results = await Promise.all(models.map(model => testModel(model, apiKey)));
let totalTime = 0;

// Calculate column widths
const maxModelLen = Math.max(...models.map(m => m.length)) + 2;
const maxStatusLen = Math.max(...results.map(r => formatStatus(r.status).length)) + 2;

console.log('\nTest Results:');
console.log('-'.repeat(maxModelLen + maxStatusLen + 23));
console.log(`| Model${' '.repeat(maxModelLen - 5)} | Status${' '.repeat(maxStatusLen - 6)} | Time   | Working |`);
console.log('-'.repeat(maxModelLen + maxStatusLen + 23));

for (const res of results) {
  totalTime += res.responseTime;
  const working = res.isCorrect ? 'Yes' : 'No';
  const formattedStatus = formatStatus(res.status, maxStatusLen - 2);
  console.log(`| ${res.model}${' '.repeat(maxModelLen - res.model.length)} | ${formattedStatus}${' '.repeat(maxStatusLen - formattedStatus.length)} | ${res.responseTime.toFixed(2).padEnd(7)} | ${working.padEnd(8)} |`);
}

console.log('-'.repeat(maxModelLen + maxStatusLen + 23));
console.log(`\nTotal tested: ${models.length} models`);
console.log(`Successful responses: ${results.filter(r => r.isCorrect).length}`);
console.log(`Total testing time: ${totalTime.toFixed(2)} sec`);

const workingModels = results.filter(r => r.isCorrect).sort((a, b) => a.responseTime - b.responseTime);
if (workingModels.length > 0) {
  console.log('\nWorking models (sorted by speed):');
  for (const { model, responseTime } of workingModels) {
    console.log(`- ${model}: ${responseTime.toFixed(2)} sec`);
  }
} 