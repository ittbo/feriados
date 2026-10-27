export function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <section>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-prose text-sm text-slate-600">{description}</p>
    </section>
  )
}
