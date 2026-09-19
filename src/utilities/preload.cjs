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
  db: {
    init: (passphrase) => ipcRenderer.invoke("sqlite-init", passphrase),
    addClip: (clip) => ipcRenderer.invoke("sqlite-add-clip", clip),
    getAllClips: () => ipcRenderer.invoke("sqlite-get-all-clips"),
    updateClip: (clip) => ipcRenderer.invoke("sqlite-update-clip", clip),
    deleteClip: (id) => ipcRenderer.invoke("sqlite-delete-clip", id),
    clearClips: () => ipcRenderer.invoke("sqlite-clear-clips"),
    purge: () => ipcRenderer.invoke("sqlite-purge-database"),
  },
});