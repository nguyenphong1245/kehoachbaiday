"""
Piston API Service - Chạy code trong sandbox
Sử dụng Piston API (public hoặc self-hosted) để thực thi code an toàn
"""
import asyncio
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

# Public Piston API fallback
PUBLIC_PISTON_URL = "https://emkc.org/api/v2/piston"

# Track which languages have been installed (avoid repeated install attempts)
_installed_languages: set[str] = set()
_install_lock = asyncio.Lock()


async def _install_language(api_url: str, language: str, version: str) -> bool:
    """Cài đặt ngôn ngữ lên Piston self-hosted. Trả về True nếu thành công."""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            logger.info(f"Đang cài đặt {language} {version} trên Piston...")
            response = await client.post(
                f"{api_url}/packages",
                json={"language": language, "version": version},
            )
            if response.status_code == 200:
                logger.info(f"Đã cài đặt {language} {version} thành công")
                return True
            else:
                logger.error(f"Không thể cài đặt {language} {version}: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"Lỗi cài đặt {language} {version}: {e}")
        return False


async def _ensure_language_installed(api_url: str, lang_key: str) -> None:
    """Đảm bảo ngôn ngữ đã được cài trên Piston self-hosted."""
    if lang_key in _installed_languages:
        return

    lang_config = LANGUAGE_MAP.get(lang_key)
    if not lang_config:
        return

    async with _install_lock:
        # Double-check after acquiring lock
        if lang_key in _installed_languages:
            return

        # Check if language is already available
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{api_url}/runtimes")
                if resp.status_code == 200:
                    runtimes = resp.json()
                    for rt in runtimes:
                        if rt.get("language") == lang_config["language"] and rt.get("version") == lang_config["version"]:
                            _installed_languages.add(lang_key)
                            return
        except Exception:
            pass

        # Language not found, try installing
        success = await _install_language(api_url, lang_config["language"], lang_config["version"])
        if success:
            _installed_languages.add(lang_key)


async def _execute_on_api(
    api_url: str,
    payload: dict,
    timeout: float = 30.0,
) -> tuple[int, dict | None, str]:
    """Execute code on a specific Piston API URL. Returns (status_code, result_json, error_text)."""
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(f"{api_url}/execute", json=payload)
        if response.status_code == 200:
            return 200, response.json(), ""
        return response.status_code, None, response.text


async def execute_code(
    code: str,
    language: str = "python",
    stdin: str = "",
    timeout_seconds: int = 3,
) -> dict:
    """
    Chạy code qua Piston API (self-hosted, auto-install, fallback public)

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

    ext_map = {"python": "py", "javascript": "js", "java": "java", "cpp": "cpp", "c": "c"}
    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [
            {
                "name": f"main.{ext_map.get(language, 'txt')}",
                "content": code,
            }
        ],
        "stdin": stdin,
        "run_timeout": run_timeout_ms,
        "compile_timeout": 10000,
    }

    start_time = time.time()
    self_hosted_url = settings.piston_api_url

    try:
        # 1) Thử self-hosted Piston
        status_code, result, error_text = await _execute_on_api(self_hosted_url, payload)

        if status_code == 400:
            # HTTP 400 thường do chưa cài ngôn ngữ → thử auto-install rồi retry
            logger.warning(f"Piston 400 cho {language}, thử cài đặt ngôn ngữ...")
            # Clear cached status to force re-check
            _installed_languages.discard(language)
            await _ensure_language_installed(self_hosted_url, language)

            # Retry after install
            status_code, result, error_text = await _execute_on_api(self_hosted_url, payload)

        if status_code == 200 and result is not None:
            return _parse_piston_result(result, start_time)

        # 2) Self-hosted failed → fallback to public Piston API
        logger.warning(f"Self-hosted Piston lỗi ({status_code}), thử public API...")
        try:
            # Public API dùng version wildcard "*"
            public_payload = {**payload, "version": "*"}
            pub_status, pub_result, pub_error = await _execute_on_api(PUBLIC_PISTON_URL, public_payload)

            if pub_status == 200 and pub_result is not None:
                logger.info("Fallback public Piston API thành công")
                return _parse_piston_result(pub_result, start_time)

            logger.error(f"Public Piston API cũng lỗi: {pub_status} - {pub_error}")
        except Exception as pub_e:
            logger.error(f"Public Piston API exception: {pub_e}")

        # Cả hai đều thất bại
        elapsed_ms = int((time.time() - start_time) * 1000)
        logger.error(f"Piston API error: {status_code} - {error_text}")
        return {
            "stdout": "",
            "stderr": f"Hệ thống chấm bài tạm thời không khả dụng. Vui lòng thử lại sau.",
            "exit_code": 1,
            "execution_time_ms": elapsed_ms,
            "timed_out": False,
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
    except httpx.ConnectError:
        # Self-hosted không chạy → thử public
        logger.warning("Self-hosted Piston không kết nối được, thử public API...")
        try:
            public_payload = {**payload, "version": "*"}
            pub_status, pub_result, pub_error = await _execute_on_api(PUBLIC_PISTON_URL, public_payload)
            if pub_status == 200 and pub_result is not None:
                logger.info("Fallback public Piston API thành công")
                return _parse_piston_result(pub_result, start_time)
        except Exception as pub_e:
            logger.error(f"Public Piston API cũng lỗi: {pub_e}")

        elapsed_ms = int((time.time() - start_time) * 1000)
        return {
            "stdout": "",
            "stderr": "Không thể kết nối đến hệ thống chấm bài. Vui lòng thử lại sau.",
            "exit_code": 1,
            "execution_time_ms": elapsed_ms,
            "timed_out": False,
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


def _parse_piston_result(result: dict, start_time: float) -> dict:
    """Parse Piston API response into our standard format."""
    elapsed_ms = int((time.time() - start_time) * 1000)

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
    # Pre-check: đảm bảo ngôn ngữ đã sẵn sàng trước khi chạy nhiều test cases
    settings = get_settings()
    await _ensure_language_installed(settings.piston_api_url, language)

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
