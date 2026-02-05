"""
Utility to sanitize user input before embedding into LLM prompts.
Prevents prompt injection by stripping known injection patterns.
"""
import re

# Patterns that attempt to override system instructions or inject new roles
_INJECTION_PATTERNS = [
    # Direct instruction overrides
    r"(?i)ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)",
    r"(?i)disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)",
    r"(?i)forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)",
    # Role injection
    r"(?i)you\s+are\s+now\s+",
    r"(?i)act\s+as\s+(a\s+)?",
    r"(?i)pretend\s+(you\s+are|to\s+be)\s+",
    r"(?i)from\s+now\s+on\s+you\s+(are|will|must|should)\s+",
    # System prompt extraction
    r"(?i)reveal\s+(your\s+)?(system\s+)?(prompt|instructions?)",
    r"(?i)show\s+(me\s+)?(your\s+)?(system\s+)?(prompt|instructions?)",
    r"(?i)what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions?)",
    r"(?i)print\s+(your\s+)?(system\s+)?(prompt|instructions?)",
    r"(?i)output\s+(your\s+)?(system\s+)?(prompt|instructions?)",
    # Delimiter/context escaping
    r"(?i)<\s*/?\s*system\s*>",
    r"(?i)\[/?system\]",
    r"(?i)```\s*system",
    r"(?i)---\s*end\s+of\s+(system\s+)?(prompt|instructions?)\s*---",
    # New instruction injection via Vietnamese
    r"(?i)bỏ\s+qua\s+(tất\s+cả\s+)?(hướng\s+dẫn|chỉ\s+thị|prompt)",
    r"(?i)hãy\s+quên\s+(tất\s+cả\s+)?(hướng\s+dẫn|chỉ\s+thị|prompt)",
]

_COMPILED_PATTERNS = [re.compile(p) for p in _INJECTION_PATTERNS]


def sanitize_prompt_input(text: str, max_length: int = 2000) -> str:
    """
    Sanitize user-provided text before embedding it into an LLM prompt.

    - Strips known prompt injection patterns
    - Truncates to max_length
    - Strips leading/trailing whitespace
    """
    if not text:
        return ""

    # Truncate first to limit processing
    text = text.strip()[:max_length]

    # Remove injection patterns
    for pattern in _COMPILED_PATTERNS:
        text = pattern.sub("[filtered]", text)

    return text.strip()


def sanitize_dict_values(data: dict, max_length: int = 2000) -> dict:
    """Sanitize all string values in a dict."""
    result = {}
    for key, value in data.items():
        if isinstance(value, str):
            result[key] = sanitize_prompt_input(value, max_length)
        elif isinstance(value, dict):
            result[key] = sanitize_dict_values(value, max_length)
        else:
            result[key] = value
    return result
