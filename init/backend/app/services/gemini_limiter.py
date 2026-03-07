"""
Semaphore giới hạn số request Gemini API đồng thời.
Tránh vượt rate limit khi nhiều user dùng cùng lúc.
"""
import asyncio

# Max 4 Gemini API calls chạy song song
# Giới hạn thấp hơn để tiết kiệm RAM trên server 4GB
# và tránh vượt rate limit khi nhiều user dùng cùng lúc
_gemini_semaphore = asyncio.Semaphore(4)


def get_gemini_semaphore() -> asyncio.Semaphore:
    return _gemini_semaphore
