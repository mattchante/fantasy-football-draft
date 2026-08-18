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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
        <p className="mt-3 text-sm text-theme-muted leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn-secondary btn-secondary--danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
