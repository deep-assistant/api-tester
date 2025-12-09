import os
import time
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

LEGNEXT_API_KEY = os.getenv("LEGNEXT_API_KEY", "YOUR_LEGNEXT_API_KEY")
LEGNEXT_API_BASE = os.getenv("LEGNEXT_API_BASE", "https://api.legnext.ai/api")


def generate_image(prompt: str) -> dict:
    """
    Generate an image using Midjourney via Legnext API

    Args:
        prompt: Text prompt for image generation

    Returns:
        Job creation response dictionary
    """
    url = f"{LEGNEXT_API_BASE}/v1/diffusion"
    headers = {
        "x-api-key": LEGNEXT_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "text": prompt
    }

    response = requests.post(url, headers=headers, json=data)

    if not response.ok:
        raise Exception(f"Failed to generate image: {response.status_code} - {response.text}")

    return response.json()


def get_job_status(job_id: str) -> dict:
    """
    Check the status of a job

    Args:
        job_id: Job ID to check

    Returns:
        Job status response dictionary
    """
    url = f"{LEGNEXT_API_BASE}/v1/job/{job_id}"
    headers = {
        "x-api-key": LEGNEXT_API_KEY
    }

    response = requests.get(url, headers=headers)

    if not response.ok:
        raise Exception(f"Failed to get job status: {response.status_code} - {response.text}")

    return response.json()


def wait_for_completion(job_id: str, max_attempts: int = 60, interval_seconds: int = 5) -> dict:
    """
    Wait for job completion by polling

    Args:
        job_id: Job ID to wait for
        max_attempts: Maximum number of polling attempts (default: 60)
        interval_seconds: Interval between polls in seconds (default: 5)

    Returns:
        Completed job details dictionary
    """
    for i in range(max_attempts):
        job = get_job_status(job_id)

        print(f"[{i + 1}/{max_attempts}] Job status: {job['status']}")

        if job["status"] == "completed":
            return job
        elif job["status"] == "failed":
            error = job.get("error", "Unknown error")
            raise Exception(f"Job failed: {error}")

        # Wait before next poll
        time.sleep(interval_seconds)

    raise Exception("Job did not complete within the maximum wait time")


def main():
    try:
        print("Starting Midjourney image generation via Legnext API...\n")

        prompt = "A beautiful sunset over the snow mountains --v 7"
        print(f"Prompt: {prompt}\n")

        # Step 1: Generate image
        print("Step 1: Submitting image generation request...")
        create_response = generate_image(prompt)
        job_id = create_response["job_id"]
        print(f"✓ Job created with ID: {job_id}\n")

        # Step 2: Wait for completion
        print("Step 2: Waiting for image generation to complete...")
        completed_job = wait_for_completion(job_id)

        # Step 3: Display results
        print("\n✓ Image generation completed!\n")
        print("Results:")
        print(f"- Job ID: {completed_job['job_id']}")
        print(f"- Status: {completed_job['status']}")
        print(f"- Model: {completed_job['model']}")

        if completed_job.get("output") and completed_job["output"].get("image_url"):
            print(f"\nGenerated Image URL:")
            print(completed_job["output"]["image_url"])

        if completed_job.get("output") and completed_job["output"].get("actions"):
            print(f"\nAvailable Actions:")
            for action in completed_job["output"]["actions"]:
                print(f"- {action}")

        if completed_job.get("meta"):
            print(f"\nMetadata:")
            print(f"- Created: {completed_job['meta'].get('created_at')}")
            print(f"- Completed: {completed_job['meta'].get('completed_at')}")

    except Exception as error:
        print(f"Error: {error}")
        exit(1)


if __name__ == "__main__":
    main()
