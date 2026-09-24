import { Link } from "react-router-dom"

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[440px] flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2.5 no-underline">
          <img src="/logo.png" alt="Rising Sun Power BD" className="h-14 w-auto object-contain" />
        </Link>
        <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-text">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-7">
        {children}
      </div>
      {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
    </main>
  )
}
