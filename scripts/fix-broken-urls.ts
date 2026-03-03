/**
 * Find and nullify broken Supabase storage URLs across all tables.
 *
 * Checks: prompts.preview_image_url, generations.output_url,
 *         generations.input_image_url, profiles.avatar_url
 *
 * Usage: npx tsx scripts/fix-broken-urls.ts
 *        npx tsx scripts/fix-broken-urls.ts --dry-run
 */

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SB_URL || !SB_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SB_URL, SB_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const dryRun = process.argv.includes('--dry-run')

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

interface FixJob {
  table: string
  column: string
  idColumn?: string
}

const JOBS: FixJob[] = [
  { table: 'prompts', column: 'preview_image_url' },
  { table: 'generations', column: 'output_url' },
  { table: 'generations', column: 'input_image_url' },
  { table: 'profiles', column: 'avatar_url', idColumn: 'user_id' },
]

async function fixTable(job: FixJob) {
  const { table, column, idColumn } = job
  const idCol = idColumn || 'id'
  console.log(`\n--- ${table}.${column} ---`)

  // Fetch all rows where the column is not null
  const { data: rows, error } = await supabase
    .from(table)
    .select(`${idCol}, ${column}`)
    .not(column, 'is', null)

  if (error) {
    console.error(`  Error fetching ${table}: ${error.message}`)
    return { checked: 0, broken: 0, fixed: 0 }
  }

  if (!rows || rows.length === 0) {
    console.log('  No rows with URLs')
    return { checked: 0, broken: 0, fixed: 0 }
  }

  console.log(`  Checking ${rows.length} URLs...`)

  let broken = 0
  let fixed = 0

  // Check in batches of 10 to avoid hammering
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10)
    const results = await Promise.all(
      batch.map(async (row) => {
        const url = row[column] as string
        if (!url || url.trim() === '') return { row, ok: true }
        const ok = await checkUrl(url)
        return { row, ok, url }
      })
    )

    for (const { row, ok, url } of results) {
      if (!ok && url) {
        broken++
        const shortUrl = url.length > 80 ? url.slice(0, 77) + '...' : url
        console.log(`  BROKEN: ${row[idCol]} → ${shortUrl}`)

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from(table)
            .update({ [column]: null })
            .eq(idCol, row[idCol])

          if (updateError) {
            console.error(`    Failed to null: ${updateError.message}`)
          } else {
            fixed++
          }
        }
      }
    }
  }

  console.log(`  ${rows.length} checked, ${broken} broken${dryRun ? ' (dry run — no changes)' : `, ${fixed} nullified`}`)
  return { checked: rows.length, broken, fixed }
}

async function main() {
  console.log(`Supabase URL: ${SB_URL}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will nullify broken URLs)'}`)

  let totalChecked = 0
  let totalBroken = 0
  let totalFixed = 0

  for (const job of JOBS) {
    const { checked, broken, fixed } = await fixTable(job)
    totalChecked += checked
    totalBroken += broken
    totalFixed += fixed
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`${totalChecked} URLs checked`)
  console.log(`${totalBroken} broken`)
  console.log(`${totalFixed} nullified`)
  if (dryRun && totalBroken > 0) {
    console.log(`\nRe-run without --dry-run to fix them.`)
  }
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
