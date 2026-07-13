import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
// 1. Import Monaco's core module layer and loader wrapper hook
import * as monaco from 'monaco-editor';
import { loader } from "@monaco-editor/react";


// 2. Direct the hook instance to leverage the local npm package definitions
loader.config({ monaco });


createRoot(document.getElementById('root')).render(
    <App/>
)
