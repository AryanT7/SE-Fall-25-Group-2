# scripts/export_openapi.py
import sys
import json
import pathlib

# Ensure the project package root (parent of this script's parent) is on sys.path so
# `from app.main import app` works when running this script directly.
ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
	sys.path.insert(0, str(ROOT))

from app.main import app  # import your FastAPI instance

schema = app.openapi()
out = pathlib.Path("docs")
out.mkdir(exist_ok=True, parents=True)
(out / "openapi.json").write_text(json.dumps(schema, indent=2))
print("Wrote docs/openapi.json")
