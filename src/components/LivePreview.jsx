import { useEffect, useState } from 'react'

function Block({ b }) {
  const style = {
    position: 'absolute',
    left: `${b.x * 100}%`,
    top: `${b.y * 100}%`,
    width: `${b.width * 100}%`,
    height: `${b.height * 100}%`,
    transform: `rotate(${b.rotation || 0}deg)`,
    borderRadius: (b.style?.radius || 0) + 'px',
    overflow: 'hidden',
  }

  if (b.type === 'image') {
    return (
      <div style={style} className="bg-gradient-to-br from-slate-700 to-slate-900">
        <div className="w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
      </div>
    )
  }
  if (b.type === 'headline') {
    return <div style={style} className="p-4">
      <div className="text-white font-extrabold leading-tight" style={{ fontSize: (b.style?.fontSize || 24) + 'px', letterSpacing: (b.style?.letterSpacing || 0) + 'px' }}>
        {b.content}
      </div>
    </div>
  }
  if (b.type === 'text' || b.type === 'caption') {
    return <div style={style} className="p-4">
      <div className="text-white/90" style={{ fontSize: (b.style?.fontSize || 16) + 'px', lineHeight: (b.style?.leading || 1.4) }}>
        {b.content}
      </div>
    </div>
  }
  return null
}

function Page({ number, layout }) {
  return (
    <div className="relative aspect-[1/1.414] w-full rounded-xl overflow-hidden bg-slate-800 border border-white/10 shadow-2xl">
      {layout.map((b, i) => <Block key={i} b={b} />)}
      <div className="absolute bottom-2 right-3 text-white/50 text-xs">{number}</div>
    </div>
  )
}

export default function LivePreview({ projectId, baseUrl }) {
  // Prefer provided baseUrl to avoid guessing again
  const backend = baseUrl || (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
  const [pages, setPages] = useState({})
  const [status, setStatus] = useState('ready')

  useEffect(() => {
    if (!projectId) return

    // Build WS URL robustly
    let wsUrl
    try {
      const u = new URL(backend)
      u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
      u.pathname = `/ws/projects/${projectId}`
      wsUrl = u.toString()
    } catch {
      wsUrl = backend.replace('http', 'ws') + `/ws/projects/${projectId}`
    }

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => setStatus('Verbunden — Generierung gestartet…')
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        if (data.type === 'status') setStatus(`${data.stage}: ${data.message}`)
        if (data.type === 'outline') setStatus('Layout wird generiert...')
        if (data.type === 'page') {
          setPages((prev) => ({ ...prev, [data.page]: data.layout }))
        }
        if (data.type === 'complete') setStatus('Fertig!')
        if (data.type === 'error') setStatus('Fehler: ' + (data.message || 'Unbekannt'))
      } catch (e) {
        // ignore malformed events
      }
    }
    ws.onerror = () => setStatus('Fehler in der Verbindung')
    ws.onclose = () => {
      // Only mark as error if not completed
      setStatus((s) => (s.includes('Fertig') ? s : 'Verbindung geschlossen'))
    }

    return () => ws.close()
  }, [projectId, backend])

  const ordered = Object.keys(pages).sort((a,b)=>Number(a)-Number(b))

  return (
    <div className="mt-6">
      <div className="text-white/80 mb-3">Status: {status}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ordered.map((k) => (
          <Page key={k} number={Number(k)} layout={pages[k]} />
        ))}
      </div>
    </div>
  )
}
