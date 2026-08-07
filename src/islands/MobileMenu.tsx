import { useEffect, useRef, useState } from 'react';

interface NavItem { label: string; href: string; }
interface Props { items: NavItem[]; }

export default function MobileMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      (previouslyFocused ?? triggerRef.current)?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-md border border-gf-border md:hidden"
      >
        <span aria-hidden="true" className="text-xl leading-none">☰</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-gf-bg p-6 md:hidden"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-gf-border"
            >
              <span aria-hidden="true" className="text-xl leading-none">✕</span>
            </button>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-4 font-display text-3xl uppercase text-gf-text"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/beta"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-md bg-gf-lime px-4 py-4 text-center font-bold text-gf-bg"
            >
              Join waitlist
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
