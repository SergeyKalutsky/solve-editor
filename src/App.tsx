import { useEffect, useState } from 'react'
import './App.css'
import MonacoEditor from './components/monaco-editor'
import appState from './store'

function App() {
  const st = appState();

  async function runCode() {
    const payload = {
      "language": "py",
      "version": "3.9.4",
      "files": [
        {
          "name": "main.py",
          "content": st.code
        }
      ],
      "stdin": "",
      "compile_timeout": 10000,
      "run_timeout": 3000,
      "compile_cpu_time": 10000,
      "run_cpu_time": 3000,
      "compile_memory_limit": -1,
      "run_memory_limit": -1
    }
    var response = await fetch('http://127.0.0.1:8000/api/v2/execute',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )
    var data = await response.json()
    console.log(data)
  }

  return (
    <div style={{width: "100%", height: "100%"}}>
      <button onClick={runCode}>
        Выполнить
      </button>
      <MonacoEditor
        key={`python-editor-`}
        height="100%"
        options={{ fontSize: 16, readOnly: st.isRunning }}
        defaultLanguage="python"
        theme="vs-dark"
        onChange={(value) => {
          st.setCode(value ?? "");
          st.setStateChanged(true);
        }}
        value={st.code}
      />
    </div>
  )
}

export default App
