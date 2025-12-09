import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Dynamically load use-m
const { use } = eval(
  await fetch('https://unpkg.com/use-m/use.js').then(u => u.text())
);

// Load environment variables from .env
const dotenv = await use('dotenv@16.1.4');
dotenv.config();

// OpenRouter models to test
const tryCompletionsConfig = {
  // Frontier Reasoning Models
  'openai/gpt-5-pro': [],
  'openai/gpt-5.1': [],
  'anthropic/claude-opus-4.5': [],
  'anthropic/claude-sonnet-4.5': [],
  'anthropic/claude-haiku-4.5': [],

  // Specialized Coding Models
  'openai/gpt-5.1-codex': [],
  'kwaipilot/kat-coder-pro:free': [],

  // Advanced Reasoning Models
  'deepseek/deepseek-v3.2': [],
  'google/gemini-3-pro-preview': [],
  'google/gemini-2.5-flash-preview-09-2025': [],
  'moonshotai/kimi-k2-thinking': [],

  // Multimodal Vision Models
  'z-ai/glm-4.6v': [],
  'qwen/qwen3-vl-235b-a22b-instruct': [],
  'nvidia/nemotron-nano-12b-v2-vl': [],

  // Efficient/Open Models
  'mistralai/mistral-large-2512': [],
  'mistralai/ministral-14b-2512': [],
  'amazon/nova-2-lite-v1:free': [],
  'allenai/olmo-3-32b-think:free': [],

  // Specialized/Research Models
  'perplexity/sonar-pro-search': [],
  'prime-intellect/intellect-3': [],
  'minimax/minimax-m2': [],
  'x-ai/grok-4.1-fast': [],

  // Legacy/Popular Models
  'openai/gpt-4o': [],
  'openai/gpt-4o-mini': [],
  'anthropic/claude-3.5-sonnet': [],
  'anthropic/claude-3-opus': [],
  'google/gemini-pro': [],
  'meta-llama/llama-3.3-70b-instruct': [],
  'deepseek/deepseek-chat': [],
  'qwen/qwen-2.5-72b-instruct': [],
};

const models = Object.keys(tryCompletionsConfig);

function formatStatus(status, maxLength = 50) {
  if (status.length <= maxLength) {
    return status;
  }
  return status.slice(0, maxLength - 3) + '...';
}

// Add a universal markdown table builder function
/**
 * Builds a markdown table string.
 * @param {string[]} headers - Column headers.
 * @param {Array<string[]>} rows - Rows of table data.
 * @param {('left'|'center'|'right')[]} [alignments] - Optional alignment per column.
 * @returns {string} Markdown-formatted table.
 */
function buildMarkdownTable(headers, rows, alignments = []) {
  // Determine maximum content widths per column
  const cols = headers.length;
  const maxLen = Array(cols).fill(0);
  // Measure header widths
  headers.forEach((h, i) => {
    maxLen[i] = Math.max(maxLen[i], String(h).length);
  });
  // Measure rows widths
  rows.forEach(row => {
    row.forEach((cell, i) => {
      const text = cell != null ? String(cell) : '';
      maxLen[i] = Math.max(maxLen[i], text.length);
    });
  });
  // Build padded header cells
  const headerCells = headers.map((h, i) => {
    const text = String(h);
    return text + ' '.repeat(maxLen[i] - text.length);
  });
  // Build separator cells with alignment
  const sepCells = headers.map((_, i) => {
    const align = alignments[i];
    const length = maxLen[i];
    if (align === 'center') {
      const hyphens = '-'.repeat(Math.max(length - 2, 1));
      return `:${hyphens}:`;
    }
    if (align === 'right') {
      const hyphens = '-'.repeat(Math.max(length - 1, 1));
      return `${hyphens}:`;
    }
    // default left
    return '-'.repeat(length);
  });
  // Build padded data rows
  const rowLines = rows.map(row => {
    const cells = row.map((cell, i) => {
      const text = cell != null ? String(cell) : '';
      const diff = maxLen[i] - text.length;
      const align = alignments[i];
      if (align === 'center') {
        const left = Math.floor(diff / 2);
        const right = diff - left;
        return ' '.repeat(left) + text + ' '.repeat(right);
      }
      if (align === 'right') {
        return ' '.repeat(diff) + text;
      }
      // default left
      return text + ' '.repeat(diff);
    });
    return `| ${cells.join(' | ')} |`;
  });
  // Combine all parts
  const headerRow = `| ${headerCells.join(' | ')} |`;
  const sepRow = `| ${sepCells.join(' | ')} |`;
  return [headerRow, sepRow, ...rowLines].join('\n');
}

async function testModel(model, apiKey) {
  const baseUrl = process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1';
  const url = `${baseUrl}/chat/completions`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://github.com/link-assistant/api-tester',
    'X-Title': 'API Tester - OpenRouter Model Checker',
  };
  const payload = {
    messages: [{ role: 'user', content: 'hi' }],
    model,
    max_tokens: 20,
  };

  const startTime = Date.now();
  const result = { model, status: '', responseTime: 0, isCorrect: false, actualModel: '' };

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
      result.actualModel = responseModel;

      // OpenRouter may return the exact model ID or a variant
      // Check if the response model matches the requested model
      result.isCorrect = responseModel === model || responseModel.includes(model.split('/')[1]);

      result.status = result.isCorrect ? 'Success' : `Wrong model: ${responseModel}`;
    } else {
      result.status = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          result.status += `: ${errorData.error.message}`;
        }
        console.error(`Error response for model ${model}:`, errorData);
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  } catch (e) {
    result.status = `Error: ${e.message}`;
  }

  return result;
}

let apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  const rl = readline.createInterface({ input, output });
  apiKey = await rl.question('Enter OpenRouter API key: ');
  rl.close();
}
console.log('\nStarting OpenRouter model tests...');

const results = await Promise.all(models.map(model => testModel(model, apiKey)));
// Replace manual table printing with markdown table builder
const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);

console.log('\nTest Results:');
const headers = ['Model', 'Actual Model', 'Status', 'Time', 'Working'];
const rows = results.map(r => [
  r.model,
  r.actualModel || 'N/A',
  formatStatus(r.status),
  r.responseTime.toFixed(2),
  r.isCorrect ? '🟩' : '🟥'
]);
console.log(buildMarkdownTable(headers, rows, ['left', 'left', 'left', 'right', 'center']));

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
