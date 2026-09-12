import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = dialog.current;
    panel?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
      if (event.key !== 'Tab') return;
      const buttons = panel?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons?.length) return;
      const first = buttons[0],
        last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    panel?.addEventListener('keydown', handleKey);
    return () => {
      panel?.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, [onCancel]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ background: 'var(--theme-bg-overlay)' }}
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-theme bg-theme-secondary p-6 shadow-2xl">
        <h3
          id="confirm-dialog-title"
          className="font-display text-2xl text-theme-primary uppercase tracking-wide"
        >
          {title}
        </h3>
        <p className="mt-3 text-sm text-theme-muted leading-relaxed">
          {message}
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            data-cancel
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-secondary btn-secondary--danger"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
