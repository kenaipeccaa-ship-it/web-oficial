/* Sobe a API e o Vite juntos em desenvolvimento. */
import { spawn } from 'node:child_process'

const procs = [
  spawn('node', ['--watch', 'server/index.js'], { stdio: 'inherit', env: process.env }),
  spawn('npx', ['vite'], { stdio: 'inherit', env: process.env }),
]

const stop = () => procs.forEach((p) => p.kill())
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
procs.forEach((p) => p.on('exit', (code) => { stop(); process.exit(code ?? 0) }))
