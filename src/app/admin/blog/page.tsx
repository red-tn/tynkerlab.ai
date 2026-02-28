'use client'

import { useState } from 'react'
import { getAllPosts, type BlogPost } from '@/lib/blog/posts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink, Edit2, Eye, Calendar, Clock,
  FileText, ArrowUpRight
} from 'lucide-react'

export default function AdminBlogPage() {
  const posts = getAllPosts()
  const [selected, setSelected] = useState<BlogPost | null>(null)

  const categories = [...new Set(posts.map(p => p.category))]
  const totalWords = posts.reduce((acc, p) => acc + p.content.split(/\s+/).length, 0)

  return (
    <div className="flex gap-0 h-[calc(100vh-4rem)]">
      {/* Main content */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all ${selected ? 'pr-0' : ''}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Blog Manager</h1>
              <p className="text-sm text-gray-400 mt-1">
                {posts.length} posts &middot; {totalWords.toLocaleString()} total words &middot; {categories.length} categories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/blog" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> View Blog
                </Button>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Posts', value: posts.length, color: 'text-primary-400' },
              { label: 'Categories', value: categories.length, color: 'text-accent-400' },
              { label: 'Tutorials', value: posts.filter(p => p.category === 'Tutorial').length, color: 'text-primary-300' },
              { label: 'Announcements', value: posts.filter(p => p.category === 'Announcement').length, color: 'text-accent-300' },
            ].map(s => (
              <div key={s.label} className="bg-nyx-surface border border-nyx-border rounded-xl p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Posts table */}
          <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nyx-border bg-nyx-bg/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Post</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Read Time</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.slug}
                    onClick={() => setSelected(selected?.slug === post.slug ? null : post)}
                    className={`border-b border-nyx-border last:border-0 cursor-pointer transition-colors ${
                      selected?.slug === post.slug
                        ? 'bg-primary-500/5'
                        : 'hover:bg-white/[.02]'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/10 shrink-0">
                          <FileText className="h-4 w-4 text-primary-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{post.title}</p>
                          <p className="text-xs text-gray-600 truncate max-w-md mt-0.5">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={post.category === 'Tutorial' ? 'info' : post.category === 'Announcement' ? 'success' : 'outline'}>
                        {post.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600">
            Blog posts are stored as static content in <code className="text-primary-400/70">src/lib/blog/posts.ts</code>. To add or edit posts, modify that file directly.
          </p>
        </div>
      </div>

      {/* Preview flyout */}
      {selected && (
        <div className="w-[420px] border-l border-nyx-border bg-nyx-surface overflow-y-auto shrink-0 animate-slide-in-right">
          <div className="sticky top-0 bg-nyx-surface border-b border-nyx-border px-4 py-3 flex items-center justify-between z-10">
            <h3 className="text-sm font-semibold text-white">Post Preview</h3>
            <div className="flex items-center gap-2">
              <a
                href={`/blog/${selected.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                &times;
              </button>
            </div>
          </div>

          {/* Cover */}
          <div className="aspect-video bg-gradient-to-br from-primary-900/40 to-accent-900/20 flex items-center justify-center">
            <span className="text-6xl font-bold gradient-text opacity-30">{selected.title.charAt(0)}</span>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="default" className="gradient-primary text-white">{selected.category}</Badge>
              <Badge variant="outline">{selected.readTime}</Badge>
            </div>

            <h2 className="text-lg font-bold text-white">{selected.title}</h2>

            <p className="text-sm text-gray-400">{selected.excerpt}</p>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-nyx-bg border border-nyx-border">
              <div className="p-1.5 rounded-full bg-primary-500/10">
                <FileText className="h-3.5 w-3.5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">{selected.author.name}</p>
                <p className="text-[10px] text-gray-500">{selected.author.role}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">Content Preview</label>
              <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border text-xs text-gray-400 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                {selected.content.trim().slice(0, 1000)}
                {selected.content.length > 1000 ? '\n\n...' : ''}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border text-center">
                <p className="text-lg font-bold text-white">{selected.content.split(/\s+/).length}</p>
                <p className="text-[10px] text-gray-500">Words</p>
              </div>
              <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border text-center">
                <p className="text-lg font-bold text-white">{selected.content.split('\n').filter(l => l.startsWith('## ')).length}</p>
                <p className="text-[10px] text-gray-500">Sections</p>
              </div>
            </div>

            <a href={`/blog/${selected.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="w-full">
                <Eye className="h-4 w-4 mr-1.5" /> View Full Post
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
