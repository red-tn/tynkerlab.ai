'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBrand } from '@/hooks/use-brand'
import { ICON_SETS, getAvailableIconSets, type IconSet } from '@/lib/brand'
import { Check, Download, Palette, Eye, Grid3X3, LayoutGrid, Sparkles } from 'lucide-react'

type PreviewSize = 20 | 28 | 48 | 64

const ICON_KEYS = [
  { key: 'TextToImageIcon' as const, label: 'Text to Image' },
  { key: 'ImageToImageIcon' as const, label: 'Image to Image' },
  { key: 'TextToVideoIcon' as const, label: 'Text to Video' },
  { key: 'ImageToVideoIcon' as const, label: 'Image to Video' },
  { key: 'TextToSpeechIcon' as const, label: 'Text to Speech' },
]

function downloadSvg(svgEl: SVGElement | null, filename: string) {
  if (!svgEl) return
  const clone = svgEl.cloneNode(true) as SVGElement
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function IconPreviewCard({
  iconSet,
  iconKey,
  label,
  previewSize,
}: {
  iconSet: IconSet
  iconKey: keyof IconSet
  label: string
  previewSize: PreviewSize
}) {
  const ref = useRef<HTMLDivElement>(null)
  const Icon = iconSet[iconKey] as React.ComponentType<{ size?: number; className?: string }>

  const handleDownload = () => {
    const svg = ref.current?.querySelector('svg') ?? null
    downloadSvg(svg, `tynkerlab-${iconSet.id}-${label.toLowerCase().replace(/\s/g, '-')}`)
  }

  return (
    <div className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border border-nyx-border bg-nyx-bg/50 hover:border-primary-500/30 transition-all">
      <div ref={ref} className="flex items-center justify-center w-full aspect-square max-w-[80px] rounded-lg bg-nyx-surface/50 p-2">
        <Icon size={previewSize} />
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 p-1 rounded-md bg-nyx-surface border border-nyx-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-500/10 hover:border-primary-500/30"
        title="Download SVG"
      >
        <Download className="h-3 w-3 text-gray-400" />
      </button>
    </div>
  )
}

function LogoPreviewCard({
  iconSet,
  type,
  previewSize,
}: {
  iconSet: IconSet
  type: 'Logo' | 'LogoFull'
  previewSize: PreviewSize
}) {
  const ref = useRef<HTMLDivElement>(null)
  const Component = iconSet[type] as React.ComponentType<{ size?: number; className?: string; showTagline?: boolean }>
  const label = type === 'Logo' ? 'Logo Mark' : 'Full Logo'

  const handleDownload = () => {
    const svg = ref.current?.querySelector('svg') ?? null
    downloadSvg(svg, `tynkerlab-${iconSet.id}-${type.toLowerCase()}`)
  }

  return (
    <div className="group relative flex flex-col items-center gap-3 p-5 rounded-xl border border-nyx-border bg-nyx-bg/50 hover:border-primary-500/30 transition-all">
      <div ref={ref} className="flex items-center justify-center">
        {type === 'LogoFull' ? (
          <Component size={Math.max(previewSize, 32)} showTagline />
        ) : (
          <Component size={Math.max(previewSize, 48)} />
        )}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 p-1 rounded-md bg-nyx-surface border border-nyx-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-500/10 hover:border-primary-500/30"
        title="Download SVG"
      >
        <Download className="h-3 w-3 text-gray-400" />
      </button>
    </div>
  )
}

export default function AdminBrandPage() {
  const { activeSetId, setActiveSet } = useBrand()
  const allSets = getAvailableIconSets()
  const [previewSetId, setPreviewSetId] = useState(activeSetId)
  const [previewSize, setPreviewSize] = useState<PreviewSize>(48)
  const [showCompare, setShowCompare] = useState(false)

  const previewSet = ICON_SETS[previewSetId] || ICON_SETS['default']

  const handleActivate = useCallback((id: string) => {
    setActiveSet(id)
    // Persist to site_settings
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'active_icon_set', value: id }),
    }).catch(() => {})
  }, [setActiveSet])

  const downloadAll = () => {
    // Download all icons as individual SVGs in quick succession
    const container = document.getElementById('brand-preview-grid')
    if (!container) return
    const svgs = container.querySelectorAll('svg')
    const names = ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'text-to-speech']
    svgs.forEach((svg, i) => {
      if (i < names.length) {
        setTimeout(() => downloadSvg(svg, `tynkerlab-${previewSet.id}-${names[i]}`), i * 200)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Palette className="h-6 w-6 text-primary-400" />
            Brand Assets
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage logos, icons, and brand identity across the site</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showCompare ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowCompare(!showCompare)}
          >
            <Grid3X3 className="h-4 w-4 mr-1.5" />
            Compare
          </Button>
          <Button variant="secondary" size="sm" onClick={downloadAll}>
            <Download className="h-4 w-4 mr-1.5" />
            Download All
          </Button>
        </div>
      </div>

      {/* Icon Set Selector */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Icon Sets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSets.map((set) => {
            const isActive = activeSetId === set.id
            const isPreviewing = previewSetId === set.id

            return (
              <Card
                key={set.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isPreviewing ? 'border-primary-500/50 shadow-lg shadow-primary-500/10' : 'hover:border-primary-500/20'
                }`}
                onClick={() => setPreviewSetId(set.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{set.name}</h3>
                        {isActive && (
                          <Badge variant="success" className="text-[10px]">
                            <Check className="h-2.5 w-2.5 mr-0.5" /> Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{set.description}</p>
                    </div>
                  </div>

                  {/* Mini preview row */}
                  <div className="flex items-center gap-2 py-2 px-2 rounded-lg bg-nyx-bg/50 mb-3">
                    <set.Logo size={20} />
                    <div className="h-4 w-px bg-nyx-border" />
                    <set.TextToImageIcon size={16} />
                    <set.ImageToImageIcon size={16} />
                    <set.TextToVideoIcon size={16} />
                    <set.ImageToVideoIcon size={16} />
                    <set.TextToSpeechIcon size={16} />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isPreviewing ? 'primary' : 'secondary'}
                      className="flex-1 text-xs"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPreviewSetId(set.id) }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 text-xs"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleActivate(set.id) }}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Preview Size:</span>
        {([20, 28, 48, 64] as PreviewSize[]).map(size => (
          <button
            key={size}
            onClick={() => setPreviewSize(size)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              previewSize === size
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-nyx-surface border border-nyx-border text-gray-400 hover:text-white'
            }`}
          >
            {size}px
          </button>
        ))}
      </div>

      {/* Compare Mode */}
      {showCompare ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Side-by-Side Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wider p-3 border-b border-nyx-border">Icon</th>
                  {allSets.map(set => (
                    <th key={set.id} className="text-center text-xs text-gray-500 uppercase tracking-wider p-3 border-b border-nyx-border">
                      {set.name}
                      {activeSetId === set.id && <Badge variant="success" className="ml-1.5 text-[9px]">Active</Badge>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-nyx-border/50">
                  <td className="p-3 text-xs text-gray-400">Logo</td>
                  {allSets.map(set => (
                    <td key={set.id} className="p-3 text-center">
                      <div className="inline-flex"><set.Logo size={previewSize} /></div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-nyx-border/50">
                  <td className="p-3 text-xs text-gray-400">Full Logo</td>
                  {allSets.map(set => (
                    <td key={set.id} className="p-3 text-center">
                      <div className="inline-flex"><set.LogoFull size={Math.max(previewSize, 28)} /></div>
                    </td>
                  ))}
                </tr>
                {ICON_KEYS.map(({ key, label }) => (
                  <tr key={key} className="border-b border-nyx-border/50">
                    <td className="p-3 text-xs text-gray-400">{label}</td>
                    {allSets.map(set => {
                      const Icon = set[key]
                      return (
                        <td key={set.id} className="p-3 text-center">
                          <div className="inline-flex"><Icon size={previewSize} /></div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Logo Preview */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Logo — {previewSet.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LogoPreviewCard iconSet={previewSet} type="Logo" previewSize={previewSize} />
              <LogoPreviewCard iconSet={previewSet} type="LogoFull" previewSize={previewSize} />
            </div>
          </div>

          {/* Icons Preview */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Studio Icons — {previewSet.name}
            </h2>
            <div id="brand-preview-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {ICON_KEYS.map(({ key, label }) => (
                <IconPreviewCard
                  key={key}
                  iconSet={previewSet}
                  iconKey={key}
                  label={label}
                  previewSize={previewSize}
                />
              ))}
            </div>
          </div>

          {/* Context Preview */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              In Context — {previewSet.name}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Navbar mock */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Navbar Preview</p>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-nyx-bg/80 border border-nyx-border">
                    <previewSet.LogoFull size={24} />
                    <div className="flex items-center gap-3 ml-auto">
                      <previewSet.TextToImageIcon size={16} />
                      <previewSet.TextToVideoIcon size={16} />
                      <previewSet.TextToSpeechIcon size={16} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar mock */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sidebar Preview</p>
                  <div className="w-48 p-2 rounded-lg bg-nyx-bg/80 border border-nyx-border space-y-1">
                    {ICON_KEYS.map(({ key, label }) => {
                      const Icon = previewSet[key] as React.ComponentType<{ size?: number; className?: string }>
                      return (
                        <div key={key} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-gray-400 hover:bg-white/5">
                          <Icon size={18} />
                          <span className="text-xs">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Card grid mock */}
              <Card className="lg:col-span-2">
                <CardContent className="p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Homepage Cards Preview</p>
                  <div className="grid grid-cols-5 gap-3">
                    {ICON_KEYS.map(({ key, label }) => {
                      const Icon = previewSet[key] as React.ComponentType<{ size?: number; className?: string }>
                      return (
                        <div key={key} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-nyx-bg/80 border border-nyx-border">
                          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Icon size={24} />
                          </div>
                          <span className="text-[10px] text-gray-400 text-center">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
