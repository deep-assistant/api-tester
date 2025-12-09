#!/usr/bin/env node
/**
 * Model availability checker for GitHub Actions.
 * Tests Deep.Assistant API models and reports their availability.
 */
import OpenAI from 'openai';
import * as fs from 'fs';

// Model configurations
const MODELS = [
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
];

/**
 * Test a single model for availability
 */
async function testModel(client, model) {
  const result = {
    model,
    available: false,
    status: '',
    error: null
  };

  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Test' }],
      model,
      max_tokens: 10,
    });

    const responseModel = completion.model;

    // Check if the returned model matches the requested model
    if (responseModel === model) {
      result.available = true;
      result.status = 'Available';
    } else {
      result.status = `Wrong model returned: ${responseModel}`;
      result.error = `Expected ${model}, got ${responseModel}`;
    }
  } catch (error) {
    result.status = 'Error';

    if (error.status) {
      result.status = `HTTP ${error.status}`;
      result.error = error.message || `HTTP error ${error.status}`;
    } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      result.status = 'Timeout';
      result.error = 'Request timed out';
    } else {
      result.error = error.message || String(error);
    }
  }

  return result;
}

/**
 * Test all models or a specific subset
 */
async function testAllModels(apiKey, modelsToTest = null) {
  const models = modelsToTest || MODELS;

  console.log(`Testing ${models.length} model(s)...`);

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_API_BASE || 'https://api.deep.assistant.run.place/v1',
    timeout: 60000, // 60 second timeout
  });

  // Test all models in parallel
  const results = await Promise.all(
    models.map(model => testModel(client, model))
  );

  // Organize results
  const available = [];
  const unavailable = [];

  for (const result of results) {
    if (result.available) {
      available.push(result.model);
    } else {
      unavailable.push({
        model: result.model,
        status: result.status,
        error: result.error
      });
    }
  }

  return {
    total: models.length,
    available,
    unavailable,
    results
  };
}

/**
 * Print test results in a readable format
 */
function printResults(summary) {
  console.log('\n' + '='.repeat(60));
  console.log('MODEL AVAILABILITY TEST RESULTS');
  console.log('='.repeat(60));

  console.log(`\nTotal models tested: ${summary.total}`);
  console.log(`Available models: ${summary.available.length}`);
  console.log(`Unavailable models: ${summary.unavailable.length}`);

  if (summary.available.length > 0) {
    console.log('\n✓ AVAILABLE MODELS:');
    for (const model of summary.available) {
      console.log(`  - ${model}`);
    }
  }

  if (summary.unavailable.length > 0) {
    console.log('\n✗ UNAVAILABLE MODELS:');
    for (const item of summary.unavailable) {
      console.log(`  - ${item.model}: ${item.status}`);
      if (item.error) {
        console.log(`    Error: ${item.error}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Main entry point
 */
async function main() {
  // Get API key from environment
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  // Parse command line arguments for specific models
  const modelsToTest = process.argv.length > 2 ? process.argv.slice(2) : MODELS;

  if (process.argv.length > 2) {
    console.log(`Testing specific models: ${modelsToTest.join(', ')}`);
  }

  // Run tests
  const summary = await testAllModels(apiKey, modelsToTest);

  // Print results
  printResults(summary);

  // Output for GitHub Actions
  if (process.env.GITHUB_ACTIONS) {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      const output = [
        `available_count=${summary.available.length}`,
        `unavailable_count=${summary.unavailable.length}`,
        `total_count=${summary.total}`
      ].join('\n') + '\n';

      fs.appendFileSync(outputFile, output);
    }
  }

  // Exit with error code if any models are unavailable
  if (summary.unavailable.length > 0) {
    console.log(`\n⚠ Warning: ${summary.unavailable.length} model(s) unavailable`);
    process.exit(1);
  } else {
    console.log('\n✓ All models are available!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
