# 📋 GlyphBoard

GlyphBoard is a clean, modern, high-performance offline code clipboard and snippet workspace manager tailored specifically for developers. Built on a fully decentralized architectural design, the application runs entirely locally on your hardware with zero external server dependencies, guaranteeing ironclad privacy and instantaneous data load workflows.

---

## ✨ Key Features

* **Fully Offline Setup:** Zero backend infrastructure tracks or endpoints. The codebase resolves internal logic entirely out of the local client wrapper.
* **Embedded Monaco Code Editor:** Implements the core editor framework fueling VS Code natively—bringing high-quality syntax highlighting, code completions, and auto-formatting straight to your desktop layout.
* **Persistent Local Vault:** Uses Chromium's native IndexedDB framework to execute robust asynchronous data tracking across snippet spaces without performance lag.
* **Auto-Save Architecture:** In-flight code modifications debouncing loop records updates seamlessly directly to the database layer on every input stroke.
* **Zero-Complication Copy Pipelines:** Modern hardware clipboard synchronization engine pairs with intuitive temporary status notifications when tracking blocks.
* **Standalone Portable Binary:** Packaged down tightly into a single lightweight execution framework running out of standard file protocols seamlessly.

---

## 📂 System Project Hierarchy

The project operates under a unified layout framework context, discarding root workspace separation constraints to optimize asset mapping paths:

```text
GLYPHBOARD/
├── dist/                  # Vite production asset compilation output
├── node_modules/          # Local workspace runtime package dependencies
├── public/                # Static application assets (Logo images, etc.)
├── release/               # Standalone distributed binary destination directory
├── src/                   # Active React functional components & views
│   ├── assets/            # CSS layouts and custom web typography stylesheets
│   ├── Components/        # Core UI views (Sidebar, MainView, Settings panels)
│   └── utilities/         # Shared configuration stacks (IndexedDB manager)
├── .gitignore             # Vetted index mapping ignore configurations
├── eslint.config.js       # Code sanity check execution instructions
├── index.html             # Application mounting viewport framework
├── main.js                # Core Electron background setup entry script
├── package.json           # Application packaging rules, tasks, and packages
├── postcss.config.mjs     # PostCSS styling layout transformations pipeline
└── vite.config.js         # Client compilation environment path configurations

```

---

## 🛠️ Installation & Active Workspace Execution

Ensure you have [Node.js](https://nodejs.org/) setup on your machine.

1. **Clone the repository space and navigate inside:**
```bash
git clone [https://github.com/your-username/glyphboard.git](https://github.com/your-username/glyphboard.git)
cd glyphboard

```


2. **Install all production node packages:**
```bash
npm install

```


3. **Launch the app in the local hot-reloaded development tracking state:**
```bash
npm run dev

```


*(Then launch `npm run electron` in a parallel window to hook the layout up inside the shell layer).*

---

## 🚀 Packaging the Portable Desktop Application

To generate a single, standalone portable `.exe` file that executes instantly without walking through any installer wizard configurations:

1. Run the unified compilation and packaging pipeline script:
```bash
npm run app:build

```


2. Once the script hits execution milestones, navigate to the local root directory:
```text
/release/

```


3. Fire up **`GlyphBoard_Portable_1.0.0.exe`** right off your hard drive. It will generate its storage footprints dynamically and run smoothly with zero network tracking hoops!

---
