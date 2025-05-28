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
  'o3-mini': [],
  'o1-preview': [],
  'o1-mini': [],
  'gpt-4o': [],
  'gpt-4o-mini': [],
  'gpt-3.5-turbo': [],
  'gpt-auto': [],
  'claude-3-opus': [],
  'claude-3-5-sonnet': [],
  'claude-3-5-haiku': [],
  'claude-3-7-sonnet': [],
  'deepseek-chat': [],
  'deepseek-reasoner': [],

  // 'deepseek-ai/DeepSeek-Prover-V2-671B': [],
  // 'deepseek-ai/DeepSeek-R1-Turbo': [],
  // 'meta-llama/Meta-Llama-3-8B-Instruct': [],
  // 'meta-llama/Meta-Llama-3-70B-Instruct': [],
  // 'meta-llama/Meta-Llama-3-405B-Instruct': [],
  // 'meta-llama/Llama-3.1-8B-Instruct': [],
  // 'meta-llama/Meta-Llama-3.1-8B-Instruct': [],
  // 'meta-llama/Meta-Llama-3.1-70B-Instruct': [],
  // 'meta-llama/Meta-Llama-3.1-405B-Instruct': [],
  // 'meta-llama/Llama-3.2-1B-Instruct': [],
  // 'meta-llama/Llama-3.2-3B-Instruct': [],
  // 'meta-llama/Llama-3.2-11B-Vision': [],
  // 'meta-llama/Llama-3.2-11B-Vision-Instruct': [],
  // 'meta-llama/Llama-3.2-90B-Vision': [],
  // 'meta-llama/Llama-3.2-90B-Vision-Instruct': [],
  'meta-llama/Meta-Llama-3.3-70B-Instruct': [],
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': [],
  // 'meta-llama/CodeLlama-70b-hf': [],
  // 'meta-llama/CodeLlama-70b-Instruct-hf': [],
  // 'meta-llama/Meta-CodeLlama-70b-Instruct-hf': [],
  // 'meta-llama/Meta-Llama-4-Scout-17B-16E-Instruct': [],
  // 'accounts/fireworks/models/llama-v3-70b-instruct': [],
  'microsoft/WizardLM-2-7B': [],
  'microsoft/WizardLM-2-8x22B': [],
};

// meta-llama/CodeLlama-70b-Instruct-hf

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
  const baseUrl = process.env.OPENAI_API_BASE || 'https://api.deep-foundation.tech/v1';
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
// Replace manual table printing with markdown table builder
const totalTime = results.reduce((sum, r) => sum + r.responseTime, 0);

console.log('\nTest Results:');
const headers = ['Model', 'Status', 'Time', 'Working'];
const rows = results.map(r => [
  r.model,
  formatStatus(r.status),
  r.responseTime.toFixed(2),
  r.isCorrect ? '🟩' : '🟥'
]);
console.log(buildMarkdownTable(headers, rows, ['left', 'left', 'right', 'center']));

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