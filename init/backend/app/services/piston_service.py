"""
Piston API Service - Chạy code trong sandbox
Sử dụng Piston API (public hoặc self-hosted) để thực thi code an toàn
"""
import logging
import time
from typing import Optional
import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Mapping ngôn ngữ sang Piston language + version
LANGUAGE_MAP = {
    "python": {"language": "python", "version": "3.10.0"},
    "javascript": {"language": "javascript", "version": "18.15.0"},
    "java": {"language": "java", "version": "15.0.2"},
    "cpp": {"language": "c++", "version": "10.2.0"},
    "c": {"language": "c", "version": "10.2.0"},
}


async def execute_code(
    code: str,
    language: str = "python",
    stdin: str = "",
    timeout_seconds: int = 3,
) -> dict:
    """
    Chạy code qua Piston API

    Returns:
        {
            "stdout": str,
            "stderr": str,
            "exit_code": int,
            "execution_time_ms": int,
            "timed_out": bool
        }
    """
    settings = get_settings()

    lang_config = LANGUAGE_MAP.get(language)
    if not lang_config:
        return {
            "stdout": "",
            "stderr": f"Ngôn ngữ '{language}' không được hỗ trợ",
            "exit_code": 1,
            "execution_time_ms": 0,
            "timed_out": False,
        }

    # Piston container mặc định giới hạn run_timeout tối đa 3000ms
    run_timeout_ms = min(timeout_seconds * 1000, 3000)

    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [
            {
                "name": f"main.{'py' if language == 'python' else 'js' if language == 'javascript' else 'java' if language == 'java' else 'cpp' if language == 'cpp' else 'c'}",
                "content": code,
            }
        ],
        "stdin": stdin,
        "run_timeout": run_timeout_ms,
        "compile_timeout": 10000,
    }

    start_time = time.time()

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.piston_api_url}/execute",
                json=payload,
            )

            elapsed_ms = int((time.time() - start_time) * 1000)

            if response.status_code != 200:
                logger.error(f"Piston API error: {response.status_code} - {response.text}")
                return {
                    "stdout": "",
                    "stderr": f"Lỗi hệ thống chấm bài (HTTP {response.status_code})",
                    "exit_code": 1,
                    "execution_time_ms": elapsed_ms,
                    "timed_out": False,
                }

            result = response.json()

            # Piston trả về compile + run
            run_result = result.get("run", {})
            compile_result = result.get("compile", {})

            # Nếu compile lỗi
            if compile_result and compile_result.get("code", 0) != 0:
                return {
                    "stdout": compile_result.get("stdout", ""),
                    "stderr": compile_result.get("stderr", "") or compile_result.get("output", ""),
                    "exit_code": compile_result.get("code", 1),
                    "execution_time_ms": elapsed_ms,
                    "timed_out": False,
                }

            timed_out = run_result.get("signal") == "SIGKILL"

            return {
                "stdout": run_result.get("stdout", "").rstrip("\n"),
                "stderr": run_result.get("stderr", ""),
                "exit_code": run_result.get("code", 0),
                "execution_time_ms": elapsed_ms,
                "timed_out": timed_out,
            }

    except httpx.TimeoutException:
        elapsed_ms = int((time.time() - start_time) * 1000)
        logger.warning("Piston API timeout")
        return {
            "stdout": "",
            "stderr": "Quá thời gian chờ kết nối đến hệ thống chấm bài",
            "exit_code": 1,
            "execution_time_ms": elapsed_ms,
            "timed_out": True,
        }
    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        logger.exception(f"Piston API error: {e}")
        return {
            "stdout": "",
            "stderr": f"Lỗi kết nối hệ thống chấm bài: {str(e)}",
            "exit_code": 1,
            "execution_time_ms": elapsed_ms,
            "timed_out": False,
        }


async def run_test_cases(
    code: str,
    test_cases: list[dict],
    language: str = "python",
    timeout_seconds: int = 5,
) -> dict:
    """
    Chạy code với nhiều test cases

    Args:
        code: Source code
        test_cases: [{"input": "...", "expected_output": "...", "is_hidden": false}]
        language: Ngôn ngữ lập trình
        timeout_seconds: Giới hạn thời gian mỗi test case

    Returns:
        {
            "status": "passed" | "failed" | "error" | "timeout",
            "total_tests": int,
            "passed_tests": int,
            "test_results": [...],
            "execution_time_ms": int
        }
    """
    test_results = []
    total_passed = 0
    total_time = 0
    has_error = False
    has_timeout = False

    for i, tc in enumerate(test_cases):
        stdin = tc.get("input", "")
        expected = tc.get("expected_output", "").strip()
        is_hidden = tc.get("is_hidden", False)

        result = await execute_code(
            code=code,
            language=language,
            stdin=stdin,
            timeout_seconds=timeout_seconds,
        )

        total_time += result.get("execution_time_ms", 0)
        actual = result["stdout"].strip()

        if result["timed_out"]:
            has_timeout = True
            passed = False
            error = "Quá thời gian thực thi"
        elif result["exit_code"] != 0:
            has_error = True
            passed = False
            error = result["stderr"][:500] if result["stderr"] else "Runtime error"
        else:
            passed = actual == expected
            error = None

        if passed:
            total_passed += 1

        test_results.append({
            "test_num": i + 1,
            "input": stdin,
            "expected_output": expected,
            "actual_output": actual,
            "passed": passed,
            "is_hidden": is_hidden,
            "error": error,
        })

    # Xác định status tổng
    if has_timeout:
        status = "timeout"
    elif has_error and total_passed == 0:
        status = "error"
    elif total_passed == len(test_cases):
        status = "passed"
    else:
        status = "failed"

    return {
        "status": status,
        "total_tests": len(test_cases),
        "passed_tests": total_passed,
        "test_results": test_results,
        "execution_time_ms": total_time,
    }
