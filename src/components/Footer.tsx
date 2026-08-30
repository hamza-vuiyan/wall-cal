export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-surface-border)] py-6">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          &copy; {year} hamza@brainfreezed.org
        </p>
      </div>
    </footer>
  )
}
