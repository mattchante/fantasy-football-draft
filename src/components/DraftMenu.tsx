import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { useTheme } from '../lib/theme';

type PendingAction = 'restart' | 'mainMenu' | null;

interface DraftMenuProps {
  onRestartDraft: () => void;
  onMainMenu: () => void;
}

export function DraftMenu({ onRestartDraft, onMainMenu }: DraftMenuProps) {
  const { openThemeSelector } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const closeMenu = () => setMenuOpen(false);

  const handleRestartClick = () => {
    closeMenu();
    setPendingAction('restart');
  };

  const handleMainMenuClick = () => {
    closeMenu();
    setPendingAction('mainMenu');
  };

  const handleConfirm = () => {
    if (pendingAction === 'restart') {
      onRestartDraft();
    } else if (pendingAction === 'mainMenu') {
      onMainMenu();
    }
    setPendingAction(null);
  };

  const handleCancelConfirm = () => setPendingAction(null);

  return (
    <>
      <div className="absolute top-0 right-0 z-20">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="menu-trigger"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          Menu
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <div className="menu-popover z-20">
              <button type="button" className="menu-popover-item" onClick={handleRestartClick}>
                Restart Draft
              </button>
              <button type="button" className="menu-popover-item" onClick={handleMainMenuClick}>
                Main Menu
              </button>
              <button
                type="button"
                className="menu-popover-item"
                onClick={() => {
                  closeMenu();
                  openThemeSelector();
                }}
              >
                Appearance
              </button>
              <button type="button" className="menu-popover-item menu-popover-item--muted" onClick={closeMenu}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {pendingAction === 'restart' && (
        <ConfirmDialog
          title="Restart draft?"
          message="Your current draft progress will be lost."
          confirmLabel="Restart"
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}

      {pendingAction === 'mainMenu' && (
        <ConfirmDialog
          title="Return to main menu?"
          message="Your current draft progress will be lost."
          confirmLabel="Main Menu"
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}
    </>
  );
}
