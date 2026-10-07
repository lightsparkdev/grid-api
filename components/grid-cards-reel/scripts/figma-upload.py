"""POST files to Figma upload URLs (from the upload_assets tool), in parallel:
python3 scripts/figma-upload.py urls.txt file1 file2 ...   (one URL a line, in file order)
Prints the placed node id per file."""
import json
import mimetypes
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

urls = [u.strip() for u in open(sys.argv[1]) if u.strip()]
files = sys.argv[2:]
assert len(urls) >= len(files), f"{len(urls)} urls for {len(files)} files"


def post(pair):
    url, path = pair
    kind = "image/svg+xml" if path.endswith(".svg") else mimetypes.guess_type(path)[0]
    out = subprocess.run(["curl", "-s", "-X", "POST", "-F", f"file=@{path};type={kind}", url], capture_output=True, text=True).stdout
    try:
        return path, json.loads(out).get("placedOnNodeId"), None
    except Exception:
        return path, None, out[:200]


with ThreadPoolExecutor(6) as ex:
    for path, node, err in ex.map(post, zip(urls, files)):
        print(f"{node or 'FAILED'}\t{path.split('/')[-1]}" + (f"\t{err}" if err else ""))
