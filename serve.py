from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import sys
import webbrowser
from urllib.request import urlopen


HOST = "127.0.0.1"
PORT = 8000
ROOT = Path(__file__).resolve().parent
URL = f"http://{HOST}:{PORT}/gift.html"

handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
try:
    server = ThreadingHTTPServer((HOST, PORT), handler)
except OSError as error:
    try:
        with urlopen(URL, timeout=1):
            server = None
    except OSError:
        raise SystemExit(f"Cannot start preview server on {HOST}:{PORT}: {error}") from error

try:
    if sys.platform == "darwin":
        try:
            subprocess.run(
                ["open", "-a", "Google Chrome", URL],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except (OSError, subprocess.CalledProcessError):
            webbrowser.open(URL)
    else:
        webbrowser.open(URL)

    if server is None:
        print(f"Preview server is already running at {URL}.")
    else:
        print(f"Serving {ROOT} at {URL}. Press Ctrl+C to stop.")
        server.serve_forever()
except KeyboardInterrupt:
    print("\nPreview server stopped.")
finally:
    if server is not None:
        server.server_close()
