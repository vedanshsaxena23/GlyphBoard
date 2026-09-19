// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import * as monaco from 'monaco-editor';
import { loader } from "@monaco-editor/react";


loader.config({ monaco });


createRoot(document.getElementById('root')).render(
    <App/>
)
