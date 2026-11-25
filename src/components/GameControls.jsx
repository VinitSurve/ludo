import React from 'react';
import { Undo2, RotateCcw, BookOpen, Settings } from 'lucide-react';

export function GameControls({
  canUndo = false,
  onUndo,
  onResetAllScores,
  onOpenRules,
  onOpenSettings,
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
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
        <span>Undo</span>
      </button>

      {/* Reset All Scores Button */}
      <button
        type="button"
        className="btn-secondary"
        onClick={onResetAllScores}
        style={{ flex: 1 }}
        title="Reset all player scores"
      >
        <RotateCcw size={16} />
        <span>Reset Scores</span>
      </button>
    </div>
  );
}
