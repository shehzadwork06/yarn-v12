"""
Proxy ASGI app that forwards all requests to the Node.js backend.
Node.js runs on port 8002, this ASGI app runs on port 8001 (via uvicorn).
"""
import subprocess
import os
import sys
import signal
import atexit
import httpx
from urllib.parse import urlencode

# Create data directory if it doesn't exist
os.makedirs('/app/backend/data', exist_ok=True)

# Node.js backend URL
NODE_BACKEND = 'http://127.0.0.1:8002'

# Global process reference
node_process = None

def start_node_server():
    global node_process
    if node_process is None or node_process.poll() is not None:
        env = {**os.environ, 'NODE_PORT': '8002'}
        node_process = subprocess.Popen(
            ['node', 'server.js'],
            cwd='/app/backend',
            env=env,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        print(f"[Python wrapper] Started Node.js server, PID: {node_process.pid}")
    return node_process

def cleanup():
    global node_process
    if node_process:
        print("[Python wrapper] Stopping Node.js server...")
        node_process.terminate()
        try:
            node_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            node_process.kill()

atexit.register(cleanup)

# Start the Node.js server immediately
start_node_server()

async def app(scope, receive, send):
    if scope['type'] == 'lifespan':
        while True:
            message = await receive()
            if message['type'] == 'lifespan.startup':
                start_node_server()
                await send({'type': 'lifespan.startup.complete'})
            elif message['type'] == 'lifespan.shutdown':
                cleanup()
                await send({'type': 'lifespan.shutdown.complete'})
                return
    
    elif scope['type'] == 'http':
        # Build the URL for the Node.js backend
        path = scope['path']
        query_string = scope.get('query_string', b'').decode()
        url = f"{NODE_BACKEND}{path}"
        if query_string:
            url = f"{url}?{query_string}"
        
        # Get request method
        method = scope['method']
        
        # Build headers
        headers = {}
        for name, value in scope.get('headers', []):
            name_str = name.decode()
            if name_str.lower() not in ('host', 'content-length'):
                headers[name_str] = value.decode()
        
        # Read request body
        body = b''
        while True:
            message = await receive()
            body += message.get('body', b'')
            if not message.get('more_body', False):
                break
        
        # Make request to Node.js backend
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    content=body if body else None,
                )
                
                # Send response
                response_headers = [
                    [k.encode(), v.encode()] 
                    for k, v in response.headers.items()
                    if k.lower() not in ('content-encoding', 'transfer-encoding', 'content-length')
                ]
                response_headers.append([b'content-length', str(len(response.content)).encode()])
                
                await send({
                    'type': 'http.response.start',
                    'status': response.status_code,
                    'headers': response_headers,
                })
                await send({
                    'type': 'http.response.body',
                    'body': response.content,
                })
            except httpx.ConnectError:
                # Node.js server not ready yet
                await send({
                    'type': 'http.response.start',
                    'status': 503,
                    'headers': [[b'content-type', b'application/json']],
                })
                await send({
                    'type': 'http.response.body',
                    'body': b'{"error": "Backend starting up, please retry"}',
                })
            except Exception as e:
                await send({
                    'type': 'http.response.start',
                    'status': 500,
                    'headers': [[b'content-type', b'application/json']],
                })
                await send({
                    'type': 'http.response.body',
                    'body': f'{{"error": "{str(e)}"}}'.encode(),
                })
