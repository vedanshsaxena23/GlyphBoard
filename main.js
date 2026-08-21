// glyphboard-client/main.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let splash;
let mainWin;

function createSplash() {
  splash = new BrowserWindow({
    icon: path.join(__dirname, "public", "logo.png"),
    width: 800,
    height: 600,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    backgroundColor: '#09090b', 
  })

  splash.loadFile(path.join(__dirname, "dist", "splash", "index.html"))
}

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "GlyphBoard",
    icon: path.join(__dirname, "public", "new-logo.ico"),
    backgroundColor: '#09090b',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  mainWin.removeMenu();

  if (process.env.VITE_DEV_SERVER_URL) {
    // Dev mode
    mainWin.loadURL(`${process.env.VITE_DEV_SERVER_URL}/index.html`);
  } else {
    // Production mode
    mainWin.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWin.once('ready-to-show', () => {
    if (process.env.VITE_DEV_SERVER_URL) {
      // For testing splash screen only
      // Added delay of 6 seconds 
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

app.whenReady().then(() => {
  createSplash();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});