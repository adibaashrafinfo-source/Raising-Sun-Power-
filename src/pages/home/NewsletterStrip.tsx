import { useState } from "react"
import { Mail, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateContactMessage } from "@/hooks/use-contact"
import { getErrorMessage } from "@/lib/utils"

/**
 * Email capture. There is no mailing-list table, so a sign-up is filed as a
 * contact message — it lands in Admin → Contact Messages with a clear subject,
 * which is where the team already looks.
 */
export function NewsletterStrip() {
  const createMessage = useCreateContactMessage()
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      toast.error("Enter a valid email address")
      return
    }
    try {
      await createMessage.mutateAsync({
        name: "Newsletter subscriber",
        email: value,
        phone: null,
        subject: "Newsletter signup",
        message: `${value} asked to receive solar tips and offers from the website.`,
      })
      setDone(true)
      setEmail("")
      toast.success("You're on the list — thank you!")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't sign you up. Try again."))
    }
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-6 shadow-[0_18px_44px_rgba(5,44,110,.32)] sm:p-9">
        <div
          className="pointer-events-none absolute -right-10 -top-16 size-[260px] rounded-full opacity-30 blur-[40px]"
          style={{ background: "radial-gradient(circle,#F49E09,transparent 70%)" }}
        />
        <div className="relative flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-[520px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              <Mail className="size-3.5" /> Stay in the loop
            </span>
            <h2 className="mt-3 font-heading text-[clamp(20px,2.8vw,28px)] font-extrabold leading-tight text-white">
              Get solar tips &amp; exclusive deals
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#C9DAF2]">
              New arrivals, package prices and practical sizing advice — a short email, only when we
              have something worth sending.
            </p>
          </div>

          {done ? (
            <p className="rounded-2xl bg-white/15 px-5 py-4 text-[14px] font-semibold text-white">
              Thank you — we'll be in touch.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex w-full max-w-[440px] flex-col gap-2.5 sm:flex-row">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="h-12 flex-1 border-white/25 bg-white/15 text-white placeholder:text-white/60"
              />
              <Button type="submit" size="lg" disabled={createMessage.isPending}>
                <Send className="size-[17px]" />
                {createMessage.isPending ? "Sending…" : "Subscribe"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
