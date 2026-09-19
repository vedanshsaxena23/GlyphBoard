// main.js
import { app, BrowserWindow, ipcMain, safeStorage, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initSqliteIpc } from './main-db.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let splash;
let mainWin;
let vaultPath;

// --- IPC Handlers for OS SafeStorage ---

ipcMain.handle('save-vault-credentials', async (event, payload) => {
  if (!vaultPath) vaultPath = path.join(app.getPath('userData'), 'vault.bin');

  if (!payload) {
    if (fs.existsSync(vaultPath)) fs.unlinkSync(vaultPath);
    return true;
  }

  if (!safeStorage.isEncryptionAvailable()) {
    console.error("OS safeStorage encryption is not available.");
    return false;
  }

  const userDataDir = path.dirname(vaultPath);
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const plainText = JSON.stringify(payload);
  const encryptedBuffer = safeStorage.encryptString(plainText);
  fs.writeFileSync(vaultPath, encryptedBuffer);
  return true;
});

ipcMain.handle('load-vault-credentials', async () => {
  if (!vaultPath) vaultPath = path.join(app.getPath('userData'), 'vault.bin');
  if (!fs.existsSync(vaultPath)) return null;

  try {
    const encryptedBuffer = fs.readFileSync(vaultPath);
    const decryptedText = safeStorage.decryptString(encryptedBuffer);
    return JSON.parse(decryptedText);
  } catch (err) {
    console.error("Failed to decrypt OS vault:", err);
    return null;
  }
});

// --- Window Creators ---

function createSplash() {
  splash = new BrowserWindow({
    icon: path.join(__dirname, "public", "logo.png"),
    width: 800,
    height: 600,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    backgroundColor: '#09090b', 
  });

  splash.loadFile(path.join(__dirname, "dist", "splash", "index.html"));
}

function createMainWindow() {
  const preloadPath = path.join(__dirname, "src", "utilities", "preload.cjs");

  mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "GlyphBoard",
    icon: path.join(__dirname, "public", "new-logo.ico"),
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}/index.html`);
  } else {
    mainWin.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWin.once('ready-to-show', () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      setTimeout(() => {
        if (splash) splash.close();
        mainWin.show();
      }, 6000);
    } else {
      if (splash) splash.close();
      mainWin.show();
    }
  });
}

// --- App Lifecycle ---

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  vaultPath = path.join(app.getPath('userData'), 'vault.bin');

  // 2. Register SQLite IPC handlers before windows load
  initSqliteIpc();

  createSplash();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});