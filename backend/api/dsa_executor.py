import subprocess
import os
import tempfile

BITS_STDCXX = """// C++ includes used for precompiling -*- C++ -*-
// C
#ifndef _GLIBCXX_NO_ASSERT
#include <cassert>
#endif
#include <cctype>
#include <cerrno>
#include <cfloat>
#include <ciso646>
#include <climits>
#include <clocale>
#include <cmath>
#include <csetjmp>
#include <csignal>
#include <cstdarg>
#include <cstddef>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>

#if __cplusplus >= 201103L
#include <ccomplex>
#include <cfenv>
#include <cinttypes>
#include <cstdbool>
#include <cstdint>
#include <ctgmath>
#include <cwchar>
#include <cwctype>
#endif

// C++
#include <algorithm>
#include <bitset>
#include <complex>
#include <deque>
#include <exception>
#include <fstream>
#include <functional>
#include <iomanip>
#include <ios>
#include <iosfwd>
#include <iostream>
#include <istream>
#include <iterator>
#include <limits>
#include <list>
#include <locale>
#include <map>
#include <memory>
#include <new>
#include <numeric>
#include <ostream>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <stdexcept>
#include <streambuf>
#include <string>
#include <typeinfo>
#include <utility>
#include <valarray>
#include <vector>

#if __cplusplus >= 201103L
#include <array>
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <forward_list>
#include <future>
#include <initializer_list>
#include <mutex>
#include <random>
#include <ratio>
#include <regex>
#include <scoped_allocator>
#include <system_error>
#include <thread>
#include <tuple>
#include <typeindex>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#endif
"""

def execute_code_locally(language: str, code: str, stdin: str = "") -> dict:
    with tempfile.TemporaryDirectory() as temp_dir:
        if language == "python":
            file_path = os.path.join(temp_dir, "main.py")
            with open(file_path, "w") as f:
                f.write(code)
            
            try:
                process = subprocess.run(
                    ["python3", file_path],
                    input=stdin,
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
                
        elif language == "cpp" or language == "c":
            ext = "cpp" if language == "cpp" else "c"
            compiler = "g++" if language == "cpp" else "gcc"
            file_path = os.path.join(temp_dir, f"main.{ext}")
            out_path = os.path.join(temp_dir, "main")
            
            # Polyfill for bits/stdc++.h on macOS
            if language == "cpp":
                bits_dir = os.path.join(temp_dir, "bits")
                os.makedirs(bits_dir, exist_ok=True)
                with open(os.path.join(bits_dir, "stdc++.h"), "w") as f:
                    f.write(BITS_STDCXX)
            
            with open(file_path, "w") as f:
                f.write(code)
                
            try:
                # Add -I temp_dir so it finds bits/stdc++.h
                compile_args = [compiler, file_path, "-o", out_path]
                if language == "cpp":
                    compile_args.extend(["-I", temp_dir, "-std=c++17"])
                    
                compile_process = subprocess.run(
                    compile_args,
                    capture_output=True, text=True, timeout=5
                )
                if compile_process.returncode != 0:
                    return {"success": False, "output": compile_process.stderr, "stdout": "", "stderr": compile_process.stderr}
                    
                process = subprocess.run(
                    [out_path],
                    input=stdin,
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
                
        elif language == "java":
            file_path = os.path.join(temp_dir, "main.java")
            with open(file_path, "w") as f:
                f.write(code)
                
            try:
                compile_process = subprocess.run(
                    ["javac", file_path],
                    capture_output=True, text=True, timeout=5
                )
                if compile_process.returncode != 0:
                    return {"success": False, "output": compile_process.stderr, "stdout": "", "stderr": compile_process.stderr}
                    
                process = subprocess.run(
                    ["java", "-cp", temp_dir, "main"],
                    input=stdin,
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
                
        elif language == "javascript":
            file_path = os.path.join(temp_dir, "main.js")
            with open(file_path, "w") as f:
                f.write(code)
                
            try:
                process = subprocess.run(
                    ["node", file_path],
                    input=stdin,
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
        return {"success": False, "output": "Unsupported language for local execution.", "stdout": "", "stderr": ""}

