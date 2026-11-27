import React from 'react';
import { Undo2 } from 'lucide-react';

export function GameControls({
  canUndo = false,
  onUndo,
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      {/* Undo Move Button */}
      <button
        type="button"
        className="btn-secondary"
        onClick={onUndo}
        disabled={!canUndo}
        style={{ flex: 1, opacity: canUndo ? 1 : 0.45 }}
        title="Undo last move"
      >
        <Undo2 size={16} />
        <span>Undo Move</span>
      </button>
    </div>
  );
}
