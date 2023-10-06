const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onGenerate: (callback) => ipcRenderer.on('generate', callback)
})