/**
 * Download a file. Uses the server-side proxy to ensure proper
 * Content-Disposition headers and avoid cross-origin/mobile issues.
 */
export function downloadFile(url: string, filename: string) {
  const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
  const a = document.createElement('a')
  a.href = proxyUrl
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
