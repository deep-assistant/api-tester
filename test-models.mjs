import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Dynamically load use-m
const { use } = eval(
  await fetch('https://unpkg.com/use-m/use.js').then(u => u.text())
);

// Load environment variables from .env
const dotenv = await use('dotenv@16.1.4');
dotenv.config();

// Model detection function based on Python version
function detectModel(model) {
  if (!model) return null;
  
  // Define GPT model mappings
  const GPTModels = {
    'o4-mini': 'o4-mini',
    'o4-mini-high': 'o4-mini-high',
    'o4-mini-deep-research': 'o4-mini-deep-research',
    'o3-mini': 'o3-mini',
    'o3-mini-high': 'o3-mini-high',
    'o3': 'o3',
    'o3-pro': 'o3-pro',
    'o3-deep-research': 'o3-deep-research',
    'o1': 'o1',
    'o1-pro': 'o1-pro',
    'o1-preview': 'o1-preview',
    'o1-mini': 'o1-mini',
    'gpt-4.5': 'gpt-4.5',
    'gpt-4.1': 'gpt-4.1',
    'gpt-4.1-mini': 'gpt-4.1-mini',
    'gpt-4.1-nano': 'gpt-4.1-nano',
    'gpt-4o': 'gpt-4o',
    'gpt-4o-realtime-preview': 'gpt-4o-realtime-preview',
    'gpt-4o-transcribe': 'gpt-4o-transcribe',
    'gpt-4o-search-preview': 'gpt-4o-search-preview',
    'gpt-4o-audio-preview': 'gpt-4o-audio-preview',
    'chatgpt-4o-latest': 'chatgpt-4o-latest',
    'gpt-4o-mini': 'gpt-4o-mini',
    'gpt-4o-mini-tts': 'gpt-4o-mini-tts',
    'gpt-4o-mini-realtime-preview': 'gpt-4o-mini-realtime-preview',
    'gpt-4o-mini-transcribe': 'gpt-4o-mini-transcribe',
    'gpt-4o-mini-search-preview': 'gpt-4o-mini-search-preview',
    'gpt-4o-mini-audio-preview': 'gpt-4o-mini-audio-preview',
    'gpt-4': 'gpt-4',
    'gpt-4-turbo': 'gpt-4-turbo',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'computer-use-preview': 'computer-use-preview',
    'codex-mini-latest': 'codex-mini-latest',
    'gpt-image-1': 'gpt-image-1',
    'dall-e-3': 'dall-e-3',
    'dall-e-2': 'dall-e-2',
    'tts-1': 'tts-1',
    'tts-1-hd': 'tts-1-hd',
    'whisper-1': 'whisper-1',
    'claude-3-opus': 'claude-3-opus',
    'claude-4-opus': 'claude-4-opus',
    'claude-3-5-sonnet': 'claude-3-5-sonnet',
    'claude-3-5-haiku': 'claude-3-5-haiku',
    'claude-3-7-sonnet': 'claude-3-7-sonnet',
    'claude-4-sonnet': 'claude-4-sonnet',
    'deepseek-chat': 'deepseek-chat',
    'deepseek-reasoner': 'deepseek-reasoner',
    'gpt-auto': 'gpt-auto',
    'microsoft/WizardLM-2-7B': 'microsoft/WizardLM-2-7B',
    'microsoft/WizardLM-2-8x22B': 'microsoft/WizardLM-2-8x22B',
  };
  
  // Check exact matches first
  for (const [key, value] of Object.entries(GPTModels)) {
    if (model.includes(value)) {
      return value;
    }
  }
  
  // Special cases (order matters - check more specific patterns first)
  if (model.includes('gpt-4o-plus')) return 'gpt-4o';
  if (model.includes('gpt-4o-2024')) return 'gpt-4o';  // Handle gpt-4o-2024-11-20
  if (model.includes('deepseek-r1')) return 'deepseek-reasoner';
  if (model.includes('gpt-4-gizmo')) return 'gpt-4-unofficial';
  if (model.includes('o1-2024-12-17')) return 'o1-preview';  // Handle o1-preview versions
  // if (model.includes('microsoft/phi-4')) return 'microsoft/WizardLM-2-7B';  // Do not handle phi-4 mapping
  if (model.includes('Llama-3.1-405B')) return 'meta-llama/Meta-Llama-3.1-405B-Instruct';
  if (model.includes('Llama-3.1-70B')) return 'meta-llama/Meta-Llama-3.1-70B-Instruct';
  if (model.includes('Llama-3.1-8B')) return 'meta-llama/Meta-Llama-3.1-8B-Instruct';
  if (model.includes('Llama-3.3-70B')) return 'meta-llama/Meta-Llama-3.3-70B-Instruct';
  if (model.includes('auto')) return 'gpt-auto';
  
  return null;
}

const tryCompletionsConfig = {
  'o4-mini': [],
  'o4-mini-high': [],
  'o4-mini-deep-research': [],
  
  'o3-mini': [],
  'o3-mini-high': [],
  'o3': [],
  'o3-pro': [],
  'o3-deep-research': [],
  'o1': [],
  'o1-pro': [],
  'o1-preview': [],
  'o1-mini': [],
  'gpt-4.5': [],
  'gpt-4.1': [],
  'gpt-4.1-mini': [],
  'gpt-4.1-nano': [],
  'gpt-4o': [],
  'gpt-4o-realtime-preview': [],
  'gpt-4o-transcribe': [],
  'gpt-4o-search-preview': [],
  'gpt-4o-audio-preview': [],
  'chatgpt-4o-latest': [],
  'gpt-4o-mini': [],
  'gpt-4o-mini-tts': [],
  'gpt-4o-mini-realtime-preview': [],
  'gpt-4o-mini-transcribe': [],
  'gpt-4o-mini-search-preview': [],
  'gpt-4o-mini-audio-preview': [],
  'gpt-4': [],
  'gpt-4-turbo': [],
  'gpt-3.5-turbo': [],
  'gpt-auto': [],
  'computer-use-preview': [],
  'codex-mini-latest': [],
  'gpt-image-1': [],
  'dall-e-3': [],
  'dall-e-2': [],
  'tts-1': [],
  'tts-1-hd': [],
  'whisper-1': [],
  'claude-3-opus': [],
  'claude-4-opus': [],
  'claude-3-5-sonnet': [],
  'claude-3-5-haiku': [],
  'claude-3-7-sonnet': [],
  'claude-4-sonnet': [],
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
  const baseUrl = process.env.OPENAI_API_BASE || 'https://api.deep.assistant.run.place/v1';
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
      
      // Use detectModel to normalize both requested and response models
      const normalizedRequestModel = detectModel(model) || model;
      const normalizedResponseModel = detectModel(responseModel) || responseModel;
      
      // Special case for gpt-auto: it can return any gpt model
      if (normalizedRequestModel === 'gpt-auto' && responseModel.includes('gpt')) {
        result.isCorrect = true;
      } else {
        result.isCorrect = normalizedResponseModel === normalizedRequestModel;
      }
      
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