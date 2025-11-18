import { useState } from 'react'
import Hero from './components/Hero'
import Configurator from './components/Configurator'
import LivePreview from './components/LivePreview'

function resolveBackendBase() {
  const env = import.meta.env?.VITE_BACKEND_URL
  if (env && typeof env === 'string') return env.replace(/\/$/, '')
  // Heuristic for Modal preview: swap -3000 with -8000 on same host
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location
    if (host.includes('-3000')) {
      return `${protocol}//${host.replace('-3000', '-8000')}`
    }
    // Fallback to same origin (useful when reverse-proxied) or localhost dev
    return `${protocol}//${host}`.replace('-3000', '-8000') || 'http://localhost:8000'
  }
  return 'http://localhost:8000'
}

function App() {
  const baseUrl = resolveBackendBase()
  const [projectId, setProjectId] = useState(null)
  const [uploading, setUploading] = useState(false)

  const startGeneration = async ({ title, prompt, pages, preset, files }) => {
    try {
      // 1) create project
      const res = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt, pages, preset })
      })
      if (!res.ok) throw new Error('Projekt konnte nicht erstellt werden')
      const data = await res.json()
      const id = data.project_id
      setProjectId(id)

      // 2) upload assets if any
      if (files && files.length > 0) {
        setUploading(true)
        const form = new FormData()
        files.forEach((f) => form.append('files', f))
        const up = await fetch(`${baseUrl}/api/projects/${id}/assets`, {
          method: 'POST',
          body: form
        })
        if (!up.ok) throw new Error('Upload fehlgeschlagen')
        setUploading(false)
      }
      // 3) LivePreview component opens websocket automatically
    } catch (e) {
      console.error(e)
      alert(`Fehler: ${e.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Hero />
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 -mt-24 pb-24">
        <Configurator onStart={startGeneration} />
        {uploading && <div className="text-white/80 mt-4">Bilder werden hochgeladen…</div>}
        {projectId && <LivePreview projectId={projectId} baseUrl={baseUrl} />}
      </div>
    </div>
  )
}

export default App
