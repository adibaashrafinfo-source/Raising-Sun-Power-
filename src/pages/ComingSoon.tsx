export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-[1280px] flex-col items-center justify-center px-4 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-extrabold text-text">{title}</h1>
      <p className="mt-2 text-sm text-muted">This page is coming in a later build phase.</p>
    </main>
  )
}
