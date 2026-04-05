const { app, BrowserWindow, dialog } = require('electron');
const { spawn, execSync }             = require('child_process');
const path                            = require('path');
const http                            = require('http');
const fs                              = require('fs');

let mainWindow;
let backendProcess;
const BACKEND_PORT = 8002;

// ── Locate system node.exe ────────────────────────────────────────────────────
function getSystemNode() {
  // 1. Use bundled node.exe first (works on any machine)
  const bundledNode = app.isPackaged
    ? path.join(process.resourcesPath, 'node.exe')
    : path.join(__dirname, 'node.exe');

  if (fs.existsSync(bundledNode)) {
    console.log('[electron] Using bundled node:', bundledNode);
    return bundledNode;
  }

  // 2. Fallback to system node (for dev mode without bundled node)
  console.log('[electron] Bundled node not found, searching system...');
  try {
    const result = execSync('where node', { encoding: 'utf8' });
    const lines  = result.trim().split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.toLowerCase().includes('node.exe') &&
          !line.toLowerCase().includes('electron')) {
        console.log('[electron] Found system node:', line);
        return line;
      }
    }
    if (lines[0]) return lines[0];
  } catch (e) {
    console.error('[electron] "where node" failed:', e.message);
  }

  throw new Error(
    'Node.js runtime not found.\n\n' +
    'The bundled node.exe is missing from the installation.\n' +
    'Please reinstall the application.'
  );
}

// ── Copy seed DB to writable userData if needed ───────────────────────────────
function ensureDatabase() {
  const userDataPath = app.getPath('userData');
  const destDb       = path.join(userDataPath, 'yarnchem.db');
  const srcDb        = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'data', 'yarnchem.db')
    : path.join(__dirname, '..', 'backend', 'data', 'yarnchem.db');

  if (app.isPackaged) {
    if (!fs.existsSync(destDb) && fs.existsSync(srcDb)) {
      fs.copyFileSync(srcDb, destDb);
      console.log('[electron] DB copied to userData:', destDb);
    }
    process.env.DB_PATH = destDb;
  } else {
    process.env.DB_PATH = srcDb;
  }

  console.log('[electron] DB_PATH =', process.env.DB_PATH);
}

// ── Start Express backend ─────────────────────────────────────────────────────
function startBackend() {
  // ── KEY FIX: use resourcesPath when packaged ──
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', 'backend');

  const serverScript = path.join(backendPath, 'server.js');

  console.log('[electron] Backend path:', backendPath);
  console.log('[electron] Server script:', serverScript);

  if (!fs.existsSync(serverScript)) {
    dialog.showErrorBox('Missing File', `server.js not found at:\n${serverScript}`);
    app.quit();
    return;
  }

  let nodeExec;
  try {
    nodeExec = getSystemNode();
  } catch (err) {
    dialog.showErrorBox('Node.js Not Found', err.message);
    app.quit();
    return;
  }

  // Verify node_modules exist
  const nmPath = path.join(backendPath, 'node_modules');
  if (!fs.existsSync(nmPath)) {
    dialog.showErrorBox(
      'Dependencies Missing',
      `Backend node_modules not found at:\n${nmPath}\n\nRun: cd backend && npm install`
    );
    app.quit();
    return;
  }

  console.log('[electron] Spawning backend with:', nodeExec);

  backendProcess = spawn(nodeExec, [serverScript], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_PORT:  String(BACKEND_PORT),
      NODE_ENV:   'development',
      DB_PATH:    process.env.DB_PATH || '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backendProcess.stdout.on('data', (d) => {
    console.log('[backend]', d.toString().trim());
  });

  backendProcess.stderr.on('data', (d) => {
    console.error('[backend-err]', d.toString().trim());
  });

  backendProcess.on('error', (err) => {
    console.error('[backend] spawn error:', err);
    dialog.showErrorBox('Backend Spawn Error', err.message);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`[backend] exited — code=${code} signal=${signal}`);
  });

  console.log('[electron] Backend process spawned, PID:', backendProcess.pid);
}

// ── Wait for backend HTTP health check ───────────────────────────────────────
function waitForBackend(maxAttempts = 40, intervalMs = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      console.log(`[electron] Waiting for backend... attempt ${attempts}/${maxAttempts}`);

      const req = http.get(
        `http://localhost:${BACKEND_PORT}/api/`,
        { timeout: 1000 },
        (res) => {
          console.log('[electron] Backend responded with status:', res.statusCode);
          resolve();
        }
      );

      req.on('error', (err) => {
        if (attempts >= maxAttempts) {
          reject(new Error(
            `Backend did not start after ${maxAttempts} attempts.\n` +
            `Last error: ${err.message}\n\n` +
            `Check the terminal for [backend-err] lines above.`
          ));
        } else {
          setTimeout(check, intervalMs);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error('Backend health check timed out.'));
        } else {
          setTimeout(check, intervalMs);
        }
      });
    };

    // Small initial delay to let the process boot
    setTimeout(check, 1000);
  });
}

// ── Create app window ─────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1400,
    height:          900,
    minWidth:        1100,
    minHeight:       700,
    title:           'GH & Sons ERP',
    backgroundColor: '#020408',
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
    },
  });

  // ── KEY FIX: use resourcesPath when packaged ──
  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, 'frontend', 'build', 'index.html')
    : path.join(__dirname, '..', 'frontend', 'build', 'index.html');

  console.log('[electron] Loading frontend from:', indexPath);

  if (!fs.existsSync(indexPath)) {
    dialog.showErrorBox(
      'Frontend Not Built',
      `frontend/build/index.html not found.\n\nRun: cd frontend && yarn build`
    );
    app.quit();
    return;
  }

  mainWindow.loadFile(indexPath);
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  console.log('[electron] App ready. userData:', app.getPath('userData'));

  ensureDatabase();
  startBackend();

  try {
    await waitForBackend();
    console.log('[electron] Backend is up — creating window.');
    createWindow();
  } catch (err) {
    console.error('[electron] Startup failed:', err.message);
    dialog.showErrorBox('Startup Error', err.message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  console.log('[electron] All windows closed.');
  if (backendProcess) {
    backendProcess.kill();
    console.log('[electron] Backend process killed.');
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});