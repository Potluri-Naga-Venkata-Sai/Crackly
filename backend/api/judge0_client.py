import os
import httpx
import logging
import asyncio
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Default mapping for Judge0 CE
LANGUAGE_MAP = {
    "python": 71,       # Python (3.8.1)
    "cpp": 54,          # C++ (GCC 9.2.0)
    "java": 62,         # Java (OpenJDK 13.0.1)
    "javascript": 63,   # JavaScript (Node.js 12.14.0)
    "c": 50,            # C (GCC 9.2.0)
}

# Standardized Submission Statuses
STATUS_MAP = {
    1: "IN_QUEUE",
    2: "PROCESSING",
    3: "ACCEPTED",
    4: "WRONG_ANSWER",
    5: "TIME_LIMIT_EXCEEDED",
    6: "COMPILATION_ERROR",
    7: "RUNTIME_ERROR",     # SIGSEGV
    8: "RUNTIME_ERROR",     # SIGXFSZ
    9: "RUNTIME_ERROR",     # SIGFPE
    10: "RUNTIME_ERROR",    # SIGABRT
    11: "RUNTIME_ERROR",    # NZEC
    12: "RUNTIME_ERROR",    # Other
    13: "INTERNAL_ERROR",
    14: "EXECUTION_FORMAT_ERROR",
}

class Judge0Client:
    def __init__(self):
        self.base_url = os.environ.get("JUDGE0_BASE_URL", "http://localhost:2358")
        self.api_key = os.environ.get("JUDGE0_API_KEY", "")
        self.api_host = os.environ.get("JUDGE0_API_HOST", "")
        
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["x-rapidapi-key"] = self.api_key
        if self.api_host:
            headers["x-rapidapi-host"] = self.api_host
        return headers
        
    async def submit_batch(self, submissions: List[Dict[str, Any]]) -> List[str]:
        """
        Submit a batch of code executions to Judge0.
        submissions is a list of dicts: {"source_code", "language_id", "stdin", "expected_output"}
        """
        url = f"{self.base_url}/submissions/batch?base64_encoded=false"
        payload = {"submissions": submissions}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=self._get_headers())
                response.raise_for_status()
                data = response.json()
                # data is like [{"token": "abc..."}, {"token": "def..."}]
                return [item["token"] for item in data if "token" in item]
            except Exception as e:
                logger.error(f"Judge0 batch submission failed: {e}")
                raise

    async def get_batch_results(self, tokens: List[str], max_retries: int = 20) -> List[Dict[str, Any]]:
        """
        Polls for batch results until all are complete or max_retries is hit.
        """
        url = f"{self.base_url}/submissions/batch?tokens={','.join(tokens)}&base64_encoded=false&fields=token,stdout,time,memory,stderr,compile_output,message,status"
        
        async with httpx.AsyncClient() as client:
            for _ in range(max_retries):
                try:
                    response = await client.get(url, headers=self._get_headers())
                    response.raise_for_status()
                    data = response.json()
                    
                    submissions = data.get("submissions", [])
                    
                    # Check if any are still in queue (status 1) or processing (status 2)
                    all_done = True
                    for sub in submissions:
                        status_id = sub.get("status", {}).get("id")
                        if status_id in [1, 2]:
                            all_done = False
                            break
                            
                    if all_done:
                        return submissions
                        
                    # Wait before next poll (exponential backoff could be added here)
                    await asyncio.sleep(1.0)
                    
                except Exception as e:
                    logger.error(f"Judge0 batch result polling failed: {e}")
                    raise
                    
            raise Exception("Timeout waiting for Judge0 results.")

    def map_language(self, lang: str) -> int:
        return LANGUAGE_MAP.get(lang.lower(), 71)

judge0 = Judge0Client()
