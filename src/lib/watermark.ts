import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

let watermarkBuffer: Buffer | null = null

async function getWatermark(): Promise<Buffer> {
  if (watermarkBuffer) return watermarkBuffer
  const watermarkPath = path.join(process.cwd(), 'public', 'brand', 'mono-white.png')
  watermarkBuffer = fs.readFileSync(watermarkPath)
  return watermarkBuffer
}

export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  const imgWidth = metadata.width || 1024

  // Size watermark to ~10% of image width
  const wmWidth = Math.round(imgWidth * 0.1)

  const wm = await getWatermark()
  const resizedWm = await sharp(wm)
    .resize(wmWidth)
    .ensureAlpha()
    .composite([{
      input: Buffer.from([255, 255, 255, Math.round(255 * 0.3)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    }])
    .toBuffer()

  const wmMeta = await sharp(resizedWm).metadata()
  const wmHeight = wmMeta.height || wmWidth

  // Position: bottom-right with 2% padding
  const padding = Math.round(imgWidth * 0.02)
  const left = (metadata.width || 1024) - wmWidth - padding
  const top = (metadata.height || 1024) - wmHeight - padding

  return image
    .composite([{
      input: resizedWm,
      left: Math.max(0, left),
      top: Math.max(0, top),
    }])
    .png()
    .toBuffer()
}
