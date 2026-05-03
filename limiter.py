from slowapi import Limiter
from slowapi.util import get_remote_address
import os

def get_limit(limit_string: str):
    """Returns '9999/minute' in seed mode, otherwise the real limit."""
    if os.getenv("SEED_MODE") == "1":
        return "9999/minute"
    return limit_string

limiter = Limiter(key_func=get_remote_address)