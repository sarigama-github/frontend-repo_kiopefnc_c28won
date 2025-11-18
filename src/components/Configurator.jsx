import { useState } from 'react'

const PRESETS = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'bold', label: 'Bold' },
  { id: 'real-estate', label: 'Real Estate' },
]

export default function Configurator({ onStart }) {
  const [title, setTitle] = useState('Visionary Quarterly')
  const [prompt, setPrompt] = useState('Ein elegantes Hochglanz-Magazin mit starken Bildern, klarer Typografie und spannender Storyline.')
  const [pages, setPages] = useState(6)
  const [preset, setPreset] = useState('modern')
  const [files, setFiles] = useState([])

  const handleFiles = (e) => {
    setFiles([...e.target.files])
  }

  const submit = () => {
    onStart({ title, prompt, pages: Number(pages), preset, files })
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm text-white/80 mb-2">Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg bg-white/10 text-white px-4 py-2 outline-none focus:ring-2 ring-blue-400" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-white/80 mb-2">Prompt</label>
          <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full rounded-lg bg-white/10 text-white px-4 py-2 outline-none focus:ring-2 ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-2">Seiten</label>
          <input type="number" min={1} max={64} value={pages} onChange={(e) => setPages(e.target.value)} className="w-full rounded-lg bg-white/10 text-white px-4 py-2 outline-none focus:ring-2 ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-2">Design</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className="w-full rounded-lg bg-white/10 text-white px-4 py-2 outline-none focus:ring-2 ring-blue-400">
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-white/80 mb-2">Bilder</label>
          <input type="file" multiple accept="image/*" onChange={handleFiles} className="w-full text-white" />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={submit} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold">Generieren</button>
      </div>
    </div>
  )
}
