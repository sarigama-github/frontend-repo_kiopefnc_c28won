import { useState } from 'react'
import Hero from './components/Hero'
import Configurator from './components/Configurator'
import LivePreview from './components/LivePreview'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [projectId, setProjectId] = useState(null)
  const [uploading, setUploading] = useState(false)

  const startGeneration = async ({ title, prompt, pages, preset, files }) => {
    // 1) create project
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, prompt, pages, preset })
    })
    const data = await res.json()
    const id = data.project_id
    setProjectId(id)

    // 2) upload assets if any
    if (files && files.length > 0) {
      setUploading(true)
      const form = new FormData()
      files.forEach((f) => form.append('files', f))
      await fetch(`${baseUrl}/api/projects/${id}/assets`, {
        method: 'POST',
        body: form
      })
      setUploading(false)
    }
    // 3) LivePreview component opens websocket automatically
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Hero />
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 -mt-24 pb-24">
        <Configurator onStart={startGeneration} />
        {uploading && <div className="text-white/80 mt-4">Bilder werden hochgeladen…</div>}
        {projectId && <LivePreview projectId={projectId} />}
      </div>
    </div>
  )
}

export default App
