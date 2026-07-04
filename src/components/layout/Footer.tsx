export function Footer() {
  return (
    <footer className="border-t border-(--color-line)">
      <div className="mx-auto max-w-2xl px-4 py-6 text-xs text-(--color-ink-faded)">
        <p>© {new Date().getFullYear()} Reframe — 見方はひとつじゃない。</p>
      </div>
    </footer>
  );
}
