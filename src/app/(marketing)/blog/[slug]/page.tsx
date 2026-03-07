import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/seo/json-ld'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import Image from 'next/image'
import { getPostBySlugFromDb, getAllPostsFromDb } from '@/lib/blog/posts'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPostsFromDb()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlugFromDb(slug)
  if (!post) return { title: 'Not Found' }

  const ogImage = post.coverImage
    ? { url: post.coverImage, width: 1200, height: 630, alt: post.title }
    : { url: '/og-image.png', width: 1200, height: 630, alt: post.title }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://tynkerlab.ai/blog/${slug}`,
    },
    openGraph: {
      type: 'article' as const,
      title: post.title,
      description: post.excerpt,
      url: `https://tynkerlab.ai/blog/${slug}`,
      publishedTime: post.date,
      authors: [post.author?.name ?? 'Tynkerlab.ai'],
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: post.title,
      description: post.excerpt,
      images: [ogImage.url],
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function renderMarkdown(content: string) {
  // Simple markdown renderer for our blog content
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let inTable = false
  let tableRows: string[][] = []
  let tableHeader: string[] = []

  function flushTable() {
    if (tableHeader.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nyx-border">
                {tableHeader.map((h, i) => (
                  <th key={i} className="text-left py-2 pr-4 text-gray-300 font-medium">{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b border-nyx-border/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 pr-4 text-gray-400">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    inTable = false
    tableRows = []
    tableHeader = []
  }

  while (i < lines.length) {
    const line = lines[i]

    // Table detection
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(Boolean)
      if (!inTable) {
        inTable = true
        tableHeader = cells
        i++ // Skip separator line
        i++
        continue
      }
      // Check if separator line
      if (cells.every(c => c.trim().match(/^[-:]+$/))) {
        i++
        continue
      }
      tableRows.push(cells)
      i++
      continue
    } else if (inTable) {
      flushTable()
    }

    // Headings
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-semibold text-white mt-8 mb-3">{line.slice(4)}</h3>)
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-primary-500 pl-4 my-4 italic text-gray-300">
          {line.slice(2).replace(/\*/g, '')}
        </blockquote>
      )
    }
    // List items
    else if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*\s*[—–-]\s*(.+)$/)
      if (match) {
        elements.push(
          <li key={i} className="flex gap-2 text-gray-400 ml-4 my-1">
            <span className="text-white font-medium shrink-0">{match[1]}</span>
            <span>— {match[2]}</span>
          </li>
        )
      } else {
        const textMatch = line.match(/^- \*\*(.+?)\*\*(.*)$/)
        if (textMatch) {
          elements.push(
            <li key={i} className="text-gray-400 ml-4 my-1">
              <span className="text-white font-medium">{textMatch[1]}</span>{textMatch[2]}
            </li>
          )
        }
      }
    }
    else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="text-gray-400 ml-4 my-1 list-disc list-inside">{line.slice(2)}</li>)
    }
    else if (line.match(/^\d+\. /)) {
      elements.push(<li key={i} className="text-gray-400 ml-4 my-1 list-decimal list-inside">{line.replace(/^\d+\. /, '')}</li>)
    }
    // Bold paragraphs
    else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="text-white font-semibold my-3">{line.replace(/\*\*/g, '')}</p>)
    }
    // Empty lines
    else if (line.trim() === '') {
      // skip
    }
    // Regular paragraphs
    else {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-medium">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary-400 hover:underline">$1</a>')
        .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-nyx-bg rounded text-primary-300 text-xs font-mono">$1</code>')

      elements.push(<p key={i} className="text-gray-400 leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: html }} />)
    }

    i++
  }

  if (inTable) flushTable()

  return elements
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlugFromDb(slug)

  if (!post) notFound()

  const allPosts = await getAllPostsFromDb()
  const currentIdx = allPosts.findIndex(p => p.slug === slug)
  const relatedPosts = allPosts.filter((_, i) => i !== currentIdx).slice(0, 2)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author?.name ?? 'Tynkerlab.ai',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tynkerlab.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tynkerlab.ai/icon.png',
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    url: `https://tynkerlab.ai/blog/${post.slug}`,
    ...(post.coverImage ? { image: post.coverImage } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tynkerlab.ai/blog/${post.slug}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tynkerlab.ai',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://tynkerlab.ai/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://tynkerlab.ai/blog/${post.slug}`,
      },
    ],
  }

  return (
    <div className="min-h-screen relative z-[1]">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Navbar />

      {/* Cover */}
      <div className="relative h-48 md:h-72 overflow-hidden">
        {post.coverImage && !post.coverImage.includes('.jpg') ? (
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-nyx-bg to-accent-900/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/15 via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 -mt-20 relative pb-20">
        <Link href="/blog" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog
        </Link>

        <div className="bg-nyx-surface border border-nyx-border rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="default" className="gradient-primary text-white">{post.category}</Badge>
            <span className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-2 mb-8 pb-8 border-b border-nyx-border">
            <div className="p-2 rounded-full bg-primary-500/10">
              <User className="h-4 w-4 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">{post.author.name}</p>
              <p className="text-xs text-gray-500">{post.author.role}</p>
            </div>
          </div>

          <div className="prose-nyx">
            {renderMarkdown(post.content)}
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-white mb-4">Continue Reading</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                  <div className="bg-nyx-surface border border-nyx-border rounded-xl p-5 hover:border-primary-500/30 transition-colors">
                    <Badge variant="outline" className="text-[10px] mb-2">{rp.category}</Badge>
                    <h4 className="text-sm font-semibold text-white mb-1 hover:text-primary-400 transition-colors">{rp.title}</h4>
                    <p className="text-xs text-gray-500">{rp.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  )
}
