"""
Semaphore giới hạn số request Gemini API đồng thời.
Tránh vượt rate limit khi nhiều user dùng cùng lúc.
"""
import asyncio

# Max 10 Gemini API calls chạy song song
# Gemini free tier: 15 RPM, paid tier cao hơn
# 10 là con số an toàn cho cả hai
_gemini_semaphore = asyncio.Semaphore(10)


def get_gemini_semaphore() -> asyncio.Semaphore:
    return _gemini_semaphore
