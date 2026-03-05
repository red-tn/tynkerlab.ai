import { createAdminClient } from '@/lib/supabase/server'

/**
 * Downloads a file from an external URL and uploads it to Supabase storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFromUrl(
  externalUrl: string,
  bucket: string,
  path: string,
  contentType?: string
): Promise<string> {
  // Download from external URL
  const res = await fetch(externalUrl, {
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) {
    throw new Error(`Failed to download from ${externalUrl}: ${res.status}`)
  }

  const blob = await res.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())
  const mimeType = contentType || res.headers.get('content-type') || 'video/mp4'

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}
