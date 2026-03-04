import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'
import { BLOG_POSTS } from '@/lib/blog/posts'

export async function POST(request: Request) {
  try {
    await requireAdmin(request)

    const supabase = createAdminClient()

    // Check which posts already exist
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('slug')

    const existingSlugs = new Set((existing ?? []).map(p => p.slug))

    const toInsert = BLOG_POSTS
      .filter(p => !existingSlugs.has(p.slug))
      .map(p => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content.trim(),
        category: p.category,
        cover_image_url: p.coverImage !== `/blog/${p.slug}.jpg` ? p.coverImage : null,
        author_name: p.author.name,
        author_role: p.author.role,
        status: 'published' as const,
        published_at: new Date(p.date + 'T00:00:00Z').toISOString(),
        read_time: p.readTime,
      }))

    if (toInsert.length === 0) {
      return NextResponse.json({ message: 'All posts already seeded', inserted: 0 })
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(toInsert)
      .select()

    if (error) throw error

    return NextResponse.json({ message: `Seeded ${data.length} posts`, inserted: data.length })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
