#!/usr/bin/env python3
from __future__ import annotations

import os
import signal
import shutil
import socket
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent


def resolve_npm_command() -> list[str]:
    if os.name != "nt":
        npm_path = shutil.which("npm")
        return [npm_path or "npm"]

    # On Windows, Python's CreateProcess often needs the .cmd shim explicitly.
    candidates = [
        shutil.which("npm.cmd"),
        shutil.which("npm"),
        r"C:\Program Files\nodejs\npm.cmd",
        r"C:\Program Files\nodejs\npm",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return [candidate]

    raise FileNotFoundError(
        "Could not find npm. Install Node.js or add its installation directory "
        "(for example C:\\Program Files\\nodejs) to PATH."
    )


def terminate_process(process: subprocess.Popen[object]) -> None:
    if process.poll() is not None:
        return

    try:
        if os.name == "nt":
            process.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            process.terminate()
        process.wait(timeout=5)
    except Exception:
        process.kill()
        process.wait(timeout=5)


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

    npm_command = resolve_npm_command()
    creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
    backend = None
    frontend = None

    try:
        backend = subprocess.Popen(
            [*npm_command, "run", "dev", "--workspace", "backend"],
            cwd=PROJECT_ROOT,
            creationflags=creationflags,
        )
        frontend = subprocess.Popen(
            [*npm_command, "run", "dev", "--workspace", "frontend"],
            cwd=PROJECT_ROOT,
            creationflags=creationflags,
        )

        while True:
            backend_code = backend.poll()
            frontend_code = frontend.poll()
            if backend_code is not None or frontend_code is not None:
                if backend_code is None:
                    terminate_process(backend)
                    backend_code = backend.wait()
                if frontend_code is None:
                    terminate_process(frontend)
                    frontend_code = frontend.wait()
                return backend_code or frontend_code or 0
    except FileNotFoundError as exc:
        print(exc, file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        if backend is not None:
            terminate_process(backend)
        if frontend is not None:
            terminate_process(frontend)
        return 130


if __name__ == "__main__":
    sys.exit(main())
