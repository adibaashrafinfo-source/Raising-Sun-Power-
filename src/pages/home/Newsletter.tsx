import { useState } from "react"
import { toast } from "sonner"

export function Newsletter() {
  const [email, setEmail] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success("Subscribed! Watch your inbox for deals.")
    setEmail("")
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-14 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0B3F94,#052C6E)] p-7 shadow-[0_24px_60px_rgba(5,44,110,.4)] sm:p-11">
        <div
          className="pointer-events-none absolute -right-8 -top-16 size-[280px] rounded-full opacity-30 blur-[10px]"
          style={{ background: "radial-gradient(circle,#F49E09,transparent 68%)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-7">
          <div className="max-w-[520px]">
            <h3 className="font-heading text-[clamp(22px,3vw,30px)] font-extrabold leading-tight text-white">
              Get deals &amp; new-stock alerts
            </h3>
            <p className="mt-3 text-[15px] text-[#B7D2F2]">
              Solar tips, price drops, and restocks — no spam.
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex min-w-[280px] max-w-[440px] flex-1 gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-[52px] flex-1 rounded-2xl border border-white/20 bg-white/12 px-4 text-sm text-white outline-none placeholder:text-white/60 focus-visible:shadow-[0_0_0_3px_rgba(244,213,96,.4)]"
            />
            <button
              type="submit"
              className="h-[52px] whitespace-nowrap rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 text-[15px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.45)] transition-transform hover:-translate-y-0.5"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
