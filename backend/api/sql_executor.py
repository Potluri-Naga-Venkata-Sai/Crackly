import subprocess
import os
import tempfile

def execute_sql_locally(code: str, stdin: str = "") -> dict:
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, "main.sql")
        with open(file_path, "w") as f:
            # Write setup (stdin) followed by user query
            f.write(stdin + "\n\n" + code)
            
        try:
            process = subprocess.run(
                ["sqlite3", "-header", ":memory:", ".read " + file_path],
                text=True,
                capture_output=True,
                timeout=5
            )
            return {
                "success": process.returncode == 0,
                "output": process.stdout if process.returncode == 0 else process.stderr,
                "stdout": process.stdout,
                "stderr": process.stderr
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "output": "Time Limit Exceeded", "stdout": "", "stderr": "Time Limit Exceeded"}
