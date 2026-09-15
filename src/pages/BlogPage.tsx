import { useState } from "react"
import { ArrowRight, BookOpen, ChevronRight, Clock } from "lucide-react"
import { Link } from "react-router-dom"

import { SEO_KEYWORDS } from "@/data/company"
import { blogCategories, blogPosts } from "@/data/blog-posts"
import { useSeo } from "@/hooks/use-seo"
import { cn } from "@/lib/utils"

const CATEGORY_TINT: Record<string, string> = {
  "Solar Basics": "#67A70E",
  "System Design": "#217CCA",
  "Net Metering": "#F49E09",
  Maintenance: "#0B3F94",
  "Electrical Safety": "#E23B3B",
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function BlogPage() {
  useSeo({
    title: "Solar Knowledge Base & Blog",
    description:
      "Guides on solar systems, net metering, inverters, batteries and electrical safety in Bangladesh — from Rising Sun Power BD.",
    keywords: SEO_KEYWORDS,
  })
  const [category, setCategory] = useState<string>("")
  const posts = category ? blogPosts.filter((p) => p.category === category) : blogPosts
  const [featured, ...rest] = posts

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Blog</span>
      </div>

      <div className="mx-auto mb-8 max-w-[720px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)]">
          <BookOpen className="size-3.5 text-orange-500" />
          Knowledge Base
        </span>
        <h1 className="mt-4 text-balance font-heading text-[clamp(28px,4vw,42px)] font-extrabold leading-tight tracking-tight text-text">
          Solar guides for{" "}
          <span className="bg-[linear-gradient(120deg,#217CCA,#F49E09_52%,#67A70E)] bg-clip-text text-transparent">
            Bangladesh
          </span>
        </h1>
        <p className="mt-3.5 text-[clamp(15px,2vw,17px)] leading-relaxed text-muted">
          সোলার সিস্টেম, নেট মিটারিং, ইনভার্টার, ব্যাটারি ও বৈদ্যুতিক নিরাপত্তা নিয়ে সহজ ভাষায় বিস্তারিত গাইড।
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-7 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setCategory("")}
          className={cn(
            "rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
            !category
              ? "border-blue bg-blue text-white"
              : "border-border bg-surface text-muted hover:border-blue/40",
          )}
        >
          All
        </button>
        {blogCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
              category === c
                ? "border-blue bg-blue text-white"
                : "border-border bg-surface text-muted hover:border-blue/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <Link
          to={`/blog/${featured.slug}`}
          className="group mb-5 block overflow-hidden rounded-[24px] border border-border bg-[linear-gradient(160deg,#052C6E,#04214f_55%,#03163a)] p-7 no-underline shadow-[0_20px_50px_rgba(5,44,110,.3)] sm:p-10"
        >
          <span
            className="inline-block rounded-full px-3 py-1 text-[11.5px] font-extrabold text-white"
            style={{ background: CATEGORY_TINT[featured.category] ?? "#217CCA" }}
          >
            {featured.category}
          </span>
          <h2 className="mt-4 text-balance font-heading text-[clamp(22px,3.2vw,32px)] font-extrabold leading-tight tracking-tight text-white">
            {featured.title}
          </h2>
          <p className="mt-3 max-w-[680px] text-[15px] leading-relaxed text-[#C9DAF2]">{featured.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-[12.5px] text-[#9DB6DA]">
            <span>{formatDate(featured.date)}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {featured.readMinutes} min read
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-bold text-gold-400">
              Read article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group flex flex-col rounded-[18px] border border-border bg-surface p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
          >
            <span
              className="w-fit rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white"
              style={{ background: CATEGORY_TINT[post.category] ?? "#217CCA" }}
            >
              {post.category}
            </span>
            <h3 className="mt-3 font-heading text-[16.5px] font-bold leading-snug text-text">{post.title}</h3>
            <p className="mt-2 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-muted">{post.excerpt}</p>
            <div className="mt-4 flex items-center gap-3 text-[12px] text-muted">
              <span>{formatDate(post.date)}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> {post.readMinutes} min
              </span>
              <ArrowRight className="ml-auto size-4 text-blue transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
