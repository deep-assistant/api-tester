import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables from .env file
dotenv.config();

const LEGNEXT_API_KEY = process.env.LEGNEXT_API_KEY || "YOUR_LEGNEXT_API_KEY";
const LEGNEXT_API_BASE = process.env.LEGNEXT_API_BASE || "https://api.legnext.ai/api";

/**
 * Generate an image using Midjourney via Legnext API
 * @param {string} prompt - Text prompt for image generation
 * @returns {Promise<object>} - Job creation response
 */
async function generateImage(prompt) {
  const response = await fetch(`${LEGNEXT_API_BASE}/v1/diffusion`, {
    method: 'POST',
    headers: {
      'x-api-key': LEGNEXT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: prompt
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate image: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Check the status of a job
 * @param {string} jobId - Job ID to check
 * @returns {Promise<object>} - Job status response
 */
async function getJobStatus(jobId) {
  const response = await fetch(`${LEGNEXT_API_BASE}/v1/job/${jobId}`, {
    method: 'GET',
    headers: {
      'x-api-key': LEGNEXT_API_KEY
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get job status: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Wait for job completion by polling
 * @param {string} jobId - Job ID to wait for
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 60)
 * @param {number} intervalMs - Interval between polls in milliseconds (default: 5000)
 * @returns {Promise<object>} - Completed job details
 */
async function waitForCompletion(jobId, maxAttempts = 60, intervalMs = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    const job = await getJobStatus(jobId);

    console.log(`[${i + 1}/${maxAttempts}] Job status: ${job.status}`);

    if (job.status === 'completed') {
      return job;
    } else if (job.status === 'failed') {
      throw new Error(`Job failed: ${job.error || 'Unknown error'}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Job did not complete within the maximum wait time');
}

async function main() {
  try {
    console.log('Starting Midjourney image generation via Legnext API...\n');

    const prompt = "A beautiful sunset over the snow mountains --v 7";
    console.log(`Prompt: ${prompt}\n`);

    // Step 1: Generate image
    console.log('Step 1: Submitting image generation request...');
    const createResponse = await generateImage(prompt);
    const jobId = createResponse.job_id;
    console.log(`✓ Job created with ID: ${jobId}\n`);

    // Step 2: Wait for completion
    console.log('Step 2: Waiting for image generation to complete...');
    const completedJob = await waitForCompletion(jobId);

    // Step 3: Display results
    console.log('\n✓ Image generation completed!\n');
    console.log('Results:');
    console.log(`- Job ID: ${completedJob.job_id}`);
    console.log(`- Status: ${completedJob.status}`);
    console.log(`- Model: ${completedJob.model}`);

    if (completedJob.output && completedJob.output.image_url) {
      console.log(`\nGenerated Image URL:`);
      console.log(completedJob.output.image_url);
    }

    if (completedJob.output && completedJob.output.actions) {
      console.log(`\nAvailable Actions:`);
      completedJob.output.actions.forEach(action => {
        console.log(`- ${action}`);
      });
    }

    if (completedJob.meta) {
      console.log(`\nMetadata:`);
      console.log(`- Created: ${completedJob.meta.created_at}`);
      console.log(`- Completed: ${completedJob.meta.completed_at}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
