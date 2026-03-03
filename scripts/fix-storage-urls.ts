/**
 * Fix storage URL mismatch from migration.
 *
 * Problem: Files were uploaded to Supabase using file.name as the path,
 * but URLs were rewritten using Appwrite file.$id. This script re-uploads
 * files using the file $id as the path so existing URLs resolve correctly.
 *
 * Usage: npx tsx scripts/fix-storage-urls.ts
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

async function main() {
  const AW_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
  const AW_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  const AW_KEY = process.env.APPWRITE_API_KEY!
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(SB_URL, SB_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const awHeaders = {
    'X-Appwrite-Project': AW_PROJECT,
    'X-Appwrite-Key': AW_KEY,
  }

  // 1. List all Appwrite files to get ID → name mapping
  console.log('Fetching Appwrite file list...')
  const res = await fetch(`${AW_ENDPOINT}/storage/buckets/uploads/files?queries[]=${
    encodeURIComponent(JSON.stringify({ method: 'limit', values: [500] }))
  }`, { headers: { ...awHeaders, 'Content-Type': 'application/json' } })
  const { files } = await res.json()
  console.log(`  ${files.length} files in Appwrite\n`)

  // 2. For each file, download from Appwrite and re-upload to Supabase
  //    using the file $id as the path (so the rewritten URLs work)
  let fixed = 0, skipped = 0, failed = 0

  for (const file of files) {
    const fileId = file.$id
    const fileName = file.name
    const mimeType = file.mimeType || 'application/octet-stream'

    // Check if a file with the $id as name already exists in Supabase
    const { data: existing } = await supabase.storage.from('uploads').list('', {
      search: fileId, limit: 1,
    })
    if (existing && existing.some(f => f.name === fileId)) {
      skipped++
      continue
    }

    // Download from Appwrite
    try {
      const dlRes = await fetch(
        `${AW_ENDPOINT}/storage/buckets/uploads/files/${fileId}/view`,
        { headers: awHeaders }
      )
      if (!dlRes.ok) {
        console.error(`  FAIL download ${fileId}: ${dlRes.status}`)
        failed++
        continue
      }
      const buffer = Buffer.from(await dlRes.arrayBuffer())

      // Upload to Supabase with $id as the file name
      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileId, buffer, { contentType: mimeType, upsert: true })

      if (error) {
        console.error(`  FAIL upload ${fileId}: ${error.message}`)
        failed++
      } else {
        fixed++
        console.log(`  ✓ ${fileId} (was: ${fileName})`)
      }
    } catch (err: any) {
      console.error(`  FAIL ${fileId}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${fixed} re-uploaded, ${skipped} already existed, ${failed} failed`)

  // 3. Verify a few URLs work
  console.log('\nVerifying sample URLs...')
  const { data: prompts } = await supabase.from('prompts').select('id, preview_image_url').limit(3)
  if (prompts) {
    for (const p of prompts) {
      if (p.preview_image_url) {
        try {
          const checkRes = await fetch(p.preview_image_url, { method: 'HEAD' })
          console.log(`  ${checkRes.status} ${p.preview_image_url.split('/').pop()}`)
        } catch {
          console.log(`  FAIL ${p.preview_image_url.split('/').pop()}`)
        }
      }
    }
  }
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
