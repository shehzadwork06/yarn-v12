"""
Wrapper to run the Node.js Express server via Python's subprocess.
This allows the existing supervisor configuration to work with the Node.js backend.
"""
import subprocess
import os
import sys
import signal

# Create data directory if it doesn't exist
os.makedirs('/app/backend/data', exist_ok=True)

# Set environment variables
env = {**os.environ, 'PORT': '8001'}

# Start the Node.js server
process = subprocess.Popen(
    ['node', 'server.js'],
    cwd='/app/backend',
    env=env,
    stdout=sys.stdout,
    stderr=sys.stderr
)

def signal_handler(signum, frame):
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

# Wait for the process
exit_code = process.wait()
sys.exit(exit_code)
