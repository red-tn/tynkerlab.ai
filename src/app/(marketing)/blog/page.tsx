import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Calendar, ArrowRight, Clock } from 'lucide-react'
import { getAllPosts } from '@/lib/blog/posts'

export const metadata = {
  title: 'Blog | Tynkerlab.ai',
  description: 'News, tutorials, and insights from the Tynkerlab.ai team on AI image and video generation.',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Tynkerlab.ai <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Tutorials, product updates, and insights on AI-powered creative tools.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group bg-nyx-surface border border-nyx-border rounded-xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 h-full">
                <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/10 flex items-center justify-center">
                    <span className="text-4xl font-bold gradient-text opacity-30">{post.title.charAt(0)}</span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="default" className="gradient-primary text-white text-[10px]">{post.category}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                  <span className="inline-flex items-center text-sm text-primary-400 font-medium">
                    Read more <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
