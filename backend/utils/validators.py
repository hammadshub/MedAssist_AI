import re
import html


def sanitize_text(text: str) -> str:
    """Basic input sanitization: strip HTML tags and escape special characters."""
    text = html.escape(text.strip())
    text = re.sub(r"<[^>]+>", "", text)
    return text


def validate_email(email: str) -> bool:
    """Simple email format validation."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))
