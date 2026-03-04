import sharp from 'sharp'

let watermarkBuffer: Buffer | null = null

async function getWatermark(): Promise<Buffer> {
  if (watermarkBuffer) return watermarkBuffer

  // Fetch from public URL — works on both local dev and Vercel
  // (public/ dir is NOT in the serverless function filesystem on Vercel)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${appUrl}/brand/mono-white.png`)
  if (!res.ok) {
    throw new Error(`Failed to fetch watermark: ${res.status}`)
  }
  watermarkBuffer = Buffer.from(await res.arrayBuffer())
  return watermarkBuffer
}

export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  const imgWidth = metadata.width || 1024
  const imgHeight = metadata.height || 1024

  // Size watermark to ~15% of image width for visibility
  const wmWidth = Math.round(imgWidth * 0.15)

  const wm = await getWatermark()
  const resizedWm = await sharp(wm)
    .resize(wmWidth)
    .ensureAlpha()
    .composite([{
      input: Buffer.from([255, 255, 255, Math.round(255 * 0.5)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    }])
    .toBuffer()

  const wmMeta = await sharp(resizedWm).metadata()
  const wmHeight = wmMeta.height || wmWidth

  // Position: bottom-right with 3% padding
  const padding = Math.round(imgWidth * 0.03)
  const left = imgWidth - wmWidth - padding
  const top = imgHeight - wmHeight - padding

  return sharp(imageBuffer)
    .composite([{
      input: resizedWm,
      left: Math.max(0, left),
      top: Math.max(0, top),
    }])
    .png()
    .toBuffer()
}
