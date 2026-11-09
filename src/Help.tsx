import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

export function Help({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  function position() {
    if (!trigger.current || !panel.current) return;

    const anchor = trigger.current.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = panel.current;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const gutter = 12;
    const gap = 8;
    const left = Math.max(gutter, Math.min(anchor.left, viewportWidth - offsetWidth - gutter));
    const below = anchor.bottom + gap;
    const above = anchor.top - gap - offsetHeight;
    const top = below + offsetHeight <= viewportHeight - gutter ? below : above;

    panel.current.style.left = `${left}px`;
    panel.current.style.top = `${Math.max(gutter, top)}px`;
  }

  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="help-trigger"
        aria-label={`Ayuda: ${title}`}
        aria-expanded={open}
        popoverTarget={id}
      >
        <HelpCircle size={19} aria-hidden="true" />
      </button>
      <div
        ref={panel}
        id={id}
        className="help-popover"
        popover="auto"
        role="region"
        aria-label={title}
        tabIndex={0}
        onToggle={(event) => {
          const shown = event.newState === 'open';
          if (shown) position();
          setOpen(shown);
        }}
      >
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </>
  );
}
