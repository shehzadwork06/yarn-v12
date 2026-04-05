// preload.js — runs in a privileged context before the renderer loads.
// Expose ONLY what the React app needs; never expose all of Node.js.

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Let the React app know it is running inside Electron
  isElectron: true,

  // Backend port so the frontend can build the correct API URL
  backendPort: 8002,
});