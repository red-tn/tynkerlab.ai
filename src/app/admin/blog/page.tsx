'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { BlogPost } from '@/types/database'
import {
  ExternalLink, Eye, Calendar, Clock, Plus,
  FileText, X, Save, Trash2, Upload,
  ChevronDown, Edit3, Database, Send
} from 'lucide-react'

type EditorPost = {
  id?: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  status: 'draft' | 'published'
  cover_image_url: string
  author_name: string
  author_role: string
  read_time: string
  meta_title: string
  meta_description: string
}

const EMPTY_POST: EditorPost = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  category: 'Announcement',
  status: 'draft',
  cover_image_url: '',
  author_name: 'Tynkerlab.ai Team',
  author_role: 'Engineering',
  read_time: '3 min read',
  meta_title: '',
  meta_description: '',
}

const CATEGORIES = ['Announcement', 'Tutorial', 'Guide', 'Update', 'Case Study']
const AUTHOR_ROLES = ['Engineering', 'AI Research', 'Creative', 'Product', 'Design', 'Marketing']

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [editor, setEditor] = useState<EditorPost | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const fetchPosts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts ?? [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const openNew = () => {
    setEditor({ ...EMPTY_POST })
    setIsNew(true)
    setError('')
  }

  const openEdit = (post: BlogPost) => {
    setEditor({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      cover_image_url: post.cover_image_url || '',
      author_name: post.author_name,
      author_role: post.author_role,
      read_time: post.read_time,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
    })
    setIsNew(false)
    setError('')
  }

  const closeEditor = () => {
    setEditor(null)
    setIsNew(false)
    setError('')
  }

  const handleSave = async (publishNow = false) => {
    if (!editor) return
    if (!editor.title.trim()) { setError('Title is required'); return }
    if (!editor.slug.trim()) { setError('Slug is required'); return }

    setSaving(true)
    setError('')

    const payload = {
      ...editor,
      cover_image_url: editor.cover_image_url || null,
      meta_title: editor.meta_title || null,
      meta_description: editor.meta_description || null,
      read_time: editor.read_time || estimateReadTime(editor.content),
      ...(publishNow ? { status: 'published' } : {}),
    }

    try {
      const res = await adminFetch('/api/admin/blog', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      showSuccess(isNew ? 'Post created!' : 'Post updated!')
      closeEditor()
      fetchPosts()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        showSuccess('Post deleted')
        setDeleteConfirm(null)
        if (editor?.id === id) closeEditor()
        fetchPosts()
      }
    } catch {
      // silent
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files?.[0]) return
    const file = e.target.files[0]
    const slug = editor.slug || slugify(editor.title) || 'upload'

    setUploadingImage(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slug', slug)
      const res = await adminFetch('/api/admin/blog/upload', { method: 'POST', body: form })
      if (res.ok) {
        const data = await res.json()
        setEditor({ ...editor, cover_image_url: data.url })
      }
    } catch {
      // silent
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await adminFetch('/api/admin/blog/seed', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        showSuccess(data.message)
        fetchPosts()
      }
    } catch {
      setError('Failed to seed posts')
    } finally {
      setSeeding(false)
    }
  }

  const filteredPosts = posts.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const publishedCount = posts.filter(p => p.status === 'published').length
  const draftCount = posts.filter(p => p.status === 'draft').length
  const categories = [...new Set(posts.map(p => p.category))]

  return (
    <>
      <div className="flex gap-0 md:h-[calc(100vh-4rem)]">
        {/* Main content */}
        <div className={`flex-1 overflow-y-auto p-0 md:p-6 transition-all ${editor ? 'md:pr-0' : ''}`}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary-400" />
                  Blog Manager
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {posts.length} posts &middot; {publishedCount} published &middot; {draftCount} drafts
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {posts.length === 0 && !loading && (
                  <Button variant="secondary" size="sm" onClick={handleSeed} disabled={seeding}>
                    <Database className="h-4 w-4 mr-1.5" />
                    {seeding ? 'Seeding...' : 'Seed Posts'}
                  </Button>
                )}
                {posts.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={handleSeed} disabled={seeding}>
                    <Database className="h-4 w-4 mr-1.5" />
                    {seeding ? 'Seeding...' : 'Seed Missing'}
                  </Button>
                )}
                <a href="/blog" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">View Blog</span>
                  </Button>
                </a>
                <Button variant="primary" size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Post
                </Button>
              </div>
            </div>

            {/* Success / Error messages */}
            {successMsg && (
              <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {successMsg}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Posts', value: posts.length, color: 'text-primary-400' },
                { label: 'Published', value: publishedCount, color: 'text-green-400' },
                { label: 'Drafts', value: draftCount, color: 'text-yellow-400' },
                { label: 'Categories', value: categories.length, color: 'text-accent-400' },
              ].map(s => (
                <div key={s.label} className="bg-nyx-surface border border-nyx-border rounded-xl p-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2">
              {(['all', 'published', 'draft'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                      : 'bg-nyx-surface border border-nyx-border text-gray-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${posts.length})` : f === 'published' ? `(${publishedCount})` : `(${draftCount})`}
                </button>
              ))}
            </div>

            {/* Posts table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading posts...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  {posts.length === 0 ? 'No blog posts yet. Seed existing posts or create a new one.' : 'No posts match this filter.'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-nyx-border bg-nyx-bg/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Post</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className={`border-b border-nyx-border last:border-0 cursor-pointer transition-colors ${
                          editor?.id === post.id ? 'bg-primary-500/5' : 'hover:bg-white/[.02]'
                        }`}
                        onClick={() => openEdit(post)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            {post.cover_image_url ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-nyx-bg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-primary-500/10 shrink-0">
                                <FileText className="h-4 w-4 text-primary-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{post.title}</p>
                              <p className="text-xs text-gray-600 truncate max-w-md mt-0.5">{post.excerpt}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                            {post.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={post.category === 'Tutorial' ? 'info' : post.category === 'Announcement' ? 'success' : 'outline'}>
                            {post.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Not published'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(post) }}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(post.id) }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Editor panel (desktop) */}
        {editor && (
          <div className="hidden md:flex md:flex-col w-[520px] border-l border-nyx-border bg-nyx-surface shrink-0 animate-slide-in-right">
            <div className="sticky top-0 bg-nyx-surface border-b border-nyx-border px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-sm font-semibold text-white">
                {isNew ? 'New Post' : 'Edit Post'}
              </h3>
              <div className="flex items-center gap-2">
                {!isNew && editor.status === 'draft' && (
                  <Button variant="primary" size="sm" onClick={() => handleSave(true)} disabled={saving}>
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Publish
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => handleSave()} disabled={saving}>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <button onClick={closeEditor} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Title *</label>
                <Input
                  value={editor.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setEditor({
                      ...editor,
                      title,
                      ...(isNew && !editor.slug ? { slug: slugify(title) } : {}),
                    })
                  }}
                  placeholder="Post title"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Slug *</label>
                <Input
                  value={editor.slug}
                  onChange={(e) => setEditor({ ...editor, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Excerpt</label>
                <textarea
                  value={editor.excerpt}
                  onChange={(e) => setEditor({ ...editor, excerpt: e.target.value })}
                  placeholder="Brief summary for cards and SEO..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 resize-none"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Cover Image</label>
                <div className="space-y-2">
                  {editor.cover_image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-nyx-bg border border-nyx-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editor.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={editor.cover_image_url}
                      onChange={(e) => setEditor({ ...editor, cover_image_url: e.target.value })}
                      placeholder="Image URL or upload below"
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-gray-300 hover:bg-nyx-bg transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                      </span>
                    </label>
                  </div>
                  {uploadingImage && <p className="text-xs text-gray-500">Uploading...</p>}
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Category</label>
                  <div className="relative">
                    <select
                      value={editor.category}
                      onChange={(e) => setEditor({ ...editor, category: e.target.value })}
                      className="w-full appearance-none px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm focus:outline-none focus:border-primary-500/50 pr-8"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Status</label>
                  <div className="relative">
                    <select
                      value={editor.status}
                      onChange={(e) => setEditor({ ...editor, status: e.target.value as 'draft' | 'published' })}
                      className="w-full appearance-none px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm focus:outline-none focus:border-primary-500/50 pr-8"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Author Name</label>
                  <Input
                    value={editor.author_name}
                    onChange={(e) => setEditor({ ...editor, author_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Author Role</label>
                  <div className="relative">
                    <select
                      value={editor.author_role}
                      onChange={(e) => setEditor({ ...editor, author_role: e.target.value })}
                      className="w-full appearance-none px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm focus:outline-none focus:border-primary-500/50 pr-8"
                    >
                      {AUTHOR_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Read time */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500 font-medium">Read Time</label>
                  <button
                    onClick={() => setEditor({ ...editor, read_time: estimateReadTime(editor.content) })}
                    className="text-[10px] text-primary-400 hover:underline"
                  >
                    Auto-estimate
                  </button>
                </div>
                <Input
                  value={editor.read_time}
                  onChange={(e) => setEditor({ ...editor, read_time: e.target.value })}
                  placeholder="3 min read"
                />
              </div>

              {/* Content (Markdown) */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">
                  Content (Markdown)
                  <span className="text-gray-600 ml-1">— {editor.content.split(/\s+/).filter(Boolean).length} words</span>
                </label>
                <textarea
                  value={editor.content}
                  onChange={(e) => setEditor({ ...editor, content: e.target.value })}
                  placeholder="Write your blog post in Markdown..."
                  rows={16}
                  className="w-full px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 resize-y font-mono leading-relaxed"
                />
              </div>

              {/* SEO */}
              <div className="border-t border-nyx-border pt-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">SEO (optional)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Meta Title</label>
                    <Input
                      value={editor.meta_title}
                      onChange={(e) => setEditor({ ...editor, meta_title: e.target.value })}
                      placeholder={editor.title || 'Custom page title...'}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Meta Description</label>
                    <textarea
                      value={editor.meta_description}
                      onChange={(e) => setEditor({ ...editor, meta_description: e.target.value })}
                      placeholder={editor.excerpt || 'Custom meta description...'}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile editor overlay */}
      {editor && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditor} />
          <div className="relative z-10 w-full max-h-[90vh] bg-nyx-surface border-t border-nyx-border rounded-t-2xl overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-nyx-surface border-b border-nyx-border px-4 py-3 flex items-center justify-between z-10">
              <h3 className="text-sm font-semibold text-white">{isNew ? 'New Post' : 'Edit Post'}</h3>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={() => handleSave()} disabled={saving}>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <button onClick={closeEditor} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Title *</label>
                <Input value={editor.title} onChange={(e) => setEditor({ ...editor, title: e.target.value, ...(isNew && !editor.slug ? { slug: slugify(e.target.value) } : {}) })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Slug *</label>
                <Input value={editor.slug} onChange={(e) => setEditor({ ...editor, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Excerpt</label>
                <textarea value={editor.excerpt} onChange={(e) => setEditor({ ...editor, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Category</label>
                  <div className="relative">
                    <select value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value })} className="w-full appearance-none px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm focus:outline-none focus:border-primary-500/50 pr-8">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Status</label>
                  <div className="relative">
                    <select value={editor.status} onChange={(e) => setEditor({ ...editor, status: e.target.value as 'draft' | 'published' })} className="w-full appearance-none px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm focus:outline-none focus:border-primary-500/50 pr-8">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Content (Markdown)</label>
                <textarea value={editor.content} onChange={(e) => setEditor({ ...editor, content: e.target.value })} rows={12} className="w-full px-3 py-2 rounded-lg bg-nyx-bg border border-nyx-border text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 resize-y font-mono leading-relaxed" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-nyx-surface border border-nyx-border rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone. The post will be permanently deleted.</p>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
