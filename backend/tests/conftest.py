import pytest
import os

# Ensure no real external calls during tests
os.environ.setdefault("SUPABASE_URL", "")
os.environ.setdefault("SUPABASE_KEY", "")
os.environ.setdefault("OPENAI_API_KEY", "")
os.environ.setdefault("RESEND_API_KEY", "")
