// src/utilities/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, (event, ...args) => listener(...args)),
  },
  vault: {
    save: (data) => ipcRenderer.invoke("save-vault-credentials", data),
    load: () => ipcRenderer.invoke("load-vault-credentials"),
  },
});