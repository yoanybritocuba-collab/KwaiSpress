export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)]" role="status" aria-label="Cargando">
      <div className="size-8 animate-spin rounded-full border-2 border-[#ffd700] border-t-transparent" />
    </div>
  )
}
