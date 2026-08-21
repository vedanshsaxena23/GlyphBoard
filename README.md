<!-- # 📋 GlyphBoard -->

<div align="center">
  <table border="0" style="border-collapse: collapse; border: none;">
    <tr style="border: none;">
      <td align="center" valign="middle" style="border: none; padding-right: 15px;">
        <img src="public/new logo.png" alt="Project Logo" width="150" height="105">
      </td>
      <td align="left" valign="middle" style="border: none;">
        <h1 style="border-bottom: none; margin: 0; padding: 0;"><strong>GlyphBoard</strong></h1>
        <p style="margin: 4px 0 0 0;"><em>A sleek, modern, and high-performance solution built for the future.</em></p>
      </td>
    </tr>
  </table>

  <br />

  <a href="https://github.com/vedanshsaxena23">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile" />
  </a>
  <a href="https://www.linkedin.com/in/hey-its-vedansh-saxena">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Profile" />
  </a>
  <a href="https://www.instagram.com/_vedansh.saxena_">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram Profile" />
  </a>
  <a href="/LICENSE.md">
  <img src="https://img.shields.io/badge/License-GPLv3-00599C?style=for-the-badge&logo=gnu&logoColor=white" alt="GPLv3 License" />
</a>
</div>


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
├── splash/                # Splash screen
│   ├── components/        # Core UI of splash screen
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
## 🛡️ License & Sovereign Rights

GlyphBoard is fundamentally built on the principle of absolute privacy and local data sovereignty. 

* **No Tracking, No Accounts, No Catch:** There is no license to purchase, no corporate telemetry tracking your patterns, and no cloud server collecting your private code snippet configurations.
* **100% Free & Open:** You have full access to run, modify, or bundle the compilation matrix exactly how you see fit. Your snippets belong completely to your hard drive.

---
---

## 📜 License & Sovereign Rights

GlyphBoard is fundamentally built on the principle of absolute privacy, local data sovereignty, and open-source freedom. 

* **License:** This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE.md) file for complete details.
* **100% Free & Copyleft:** You have full access to run, study, modify, and distribute this software. Any derivative works must also be open-sourced under the same GPLv3 terms.
* **No Telemetry, No Accounts:** Your code snippet configurations and clipboard data remain entirely on your local machine.

---

🔒 **"Your code. Your system. Zero compromises."**  
Crafted with 💻 by **Vedansh Saxena**.
