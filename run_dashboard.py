#!/usr/bin/env python3
from __future__ import annotations

import shutil
import socket
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent


def ensure_env_file(target: Path, example: Path) -> None:
    if target.exists() or not example.exists():
        return

    shutil.copyfile(example, target)
    print(f"Created {target.name} from {example.name}")


def get_local_ip() -> str:
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        probe.connect(("8.8.8.8", 80))
        return probe.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        probe.close()


def main() -> int:
    ensure_env_file(PROJECT_ROOT / "backend" / ".env", PROJECT_ROOT / "backend" / ".env.example")
    ensure_env_file(PROJECT_ROOT / "frontend" / ".env", PROJECT_ROOT / "frontend" / ".env.example")

    local_ip = get_local_ip()

    print("Starting PulseOps with Python launcher...")
    print(f"Open the dashboard at: http://{local_ip}:5173")
    print(f"Backend API will be available at: http://{local_ip}:5001")
    print("Press Ctrl+C to stop both services.\n")

    try:
        completed = subprocess.run(["npm", "start"], cwd=PROJECT_ROOT)
        return completed.returncode
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
