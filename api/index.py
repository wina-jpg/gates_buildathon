"""Vercel serverless entry — re-exports the FastAPI app from project root."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
os.chdir(ROOT)

from main import app  # noqa: E402

# Mangum adapter for AWS Lambda / Vercel Python runtime
from mangum import Mangum  # noqa: E402

handler = Mangum(app, lifespan="off")
