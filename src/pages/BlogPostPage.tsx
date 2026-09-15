import { ArrowLeft, ArrowRight, ChevronRight, Clock, MessageCircle, Phone } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { RichText } from "@/components/ProductDescription"
import { Button } from "@/components/ui/button"
import { COMPANY, SEO_KEYWORDS, telLink, whatsappLink } from "@/data/company"
import { getPostBySlug, getRelatedPosts } from "@/data/blog-posts"
import { useSeo } from "@/hooks/use-seo"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = getPostBySlug(slug ?? "")

  useSeo({
    title: post?.title ?? "Article not found",
    description: post?.excerpt,
    keywords: SEO_KEYWORDS,
    noIndex: !post,
  })

  if (!post) {
    return (
      <main className="mx-auto max-w-[720px] px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-extrabold text-text">Article not found</h1>
        <p className="mt-3 text-muted">The article you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="mt-6">
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </main>
    )
  }

  const related = getRelatedPosts(post)

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/blog" className="text-muted no-underline hover:text-blue">
          Blog
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 font-semibold text-text">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <span className="inline-block rounded-full bg-blue/12 px-3 py-1 text-[11.5px] font-extrabold text-blue">
            {post.category}
          </span>
          <h1 className="mt-4 text-balance font-heading text-[clamp(26px,3.8vw,40px)] font-extrabold leading-tight tracking-tight text-text">
            {post.title}
          </h1>
          <div className="mt-3.5 flex flex-wrap items-center gap-4 text-[13px] text-muted">
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {post.readMinutes} min read
            </span>
          </div>

          <p className="mt-5 border-l-[3px] border-orange-500 pl-4 text-[15.5px] leading-relaxed text-muted">
            {post.excerpt}
          </p>

          <div className="mt-8">
            <RichText text={post.content} />
          </div>

          {/* Inline CTA */}
          <div className="mt-10 rounded-[22px] bg-[linear-gradient(160deg,#052C6E,#04214f_55%,#03163a)] p-6 sm:p-8">
            <h2 className="font-heading text-[clamp(20px,2.6vw,26px)] font-extrabold tracking-tight text-white">
              আপনার জন্য সঠিক সিস্টেম কোনটি?
            </h2>
            <p className="mt-2.5 max-w-[560px] text-[14.5px] leading-relaxed text-[#C9DAF2]">
              আমাদের প্রকৌশলীরা বিনামূল্যে আপনার লোড ও ছাদ বিশ্লেষণ করে সঠিক সমাধান ও স্বচ্ছ কোটেশন দেবেন।
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/solar-assessment">Get Free Solar Assessment</Link>
              </Button>
              <a
                href={whatsappLink("Hi, I read your blog and want a solar assessment.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white no-underline hover:bg-white/20"
              >
                <MessageCircle className="size-[17px]" /> WhatsApp
              </a>
            </div>
          </div>

          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue no-underline"
          >
            <ArrowLeft className="size-4" /> Back to all articles
          </Link>
        </article>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-3 font-heading text-sm font-extrabold uppercase tracking-wide text-text">
              Talk to an engineer
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={telLink()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue px-4 py-3 text-sm font-bold text-white no-underline"
              >
                <Phone className="size-4" /> {COMPANY.phone}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-[#053a1d] no-underline"
              >
                <MessageCircle className="size-4" /> {COMPANY.whatsapp}
              </a>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-3 font-heading text-sm font-extrabold uppercase tracking-wide text-text">
              Related articles
            </div>
            <div className="flex flex-col gap-3.5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group block no-underline"
                >
                  <div className="text-[14px] font-bold leading-snug text-text group-hover:text-blue">
                    {r.title}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                    <Clock className="size-3" /> {r.readMinutes} min
                    <ArrowRight className="ml-auto size-3.5 text-blue opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
