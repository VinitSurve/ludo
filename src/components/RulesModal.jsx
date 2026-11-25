import React from 'react';
import { X, BookOpen, Shield, Dices, Swords, Trophy, Sparkles } from 'lucide-react';

export function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen className="text-blue-600" size={24} />
            <h2 className="modal-title">Official Ludo Rules</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem', color: '#334155' }}>
          {/* Rule 1 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Dices size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Entering the Track (Roll 6)</h4>
              <p>Each player begins with 4 pieces in their home base. A piece can only leave the base and enter the starting square upon rolling a <strong>6</strong>.</p>
            </div>
          </div>

          {/* Rule 2 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF9C3', color: '#854D0E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Extra Turns (Bonus Rolls)</h4>
              <p>A player receives an immediate extra turn whenever they roll a <strong>6</strong>, <strong>capture an opponent</strong>, or safely <strong>finish a piece</strong> in the center.</p>
            </div>
          </div>

          {/* Rule 3 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Swords size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Capturing Opponents</h4>
              <p>Landing on an opponent's piece on any regular track square captures it! The captured piece is sent back to its owner's base.</p>
            </div>
          </div>

          {/* Rule 4 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Safe Squares (Star & Start Cells)</h4>
              <p>Starting squares and squares marked with a star (★) are safe zones. Pieces resting on safe squares cannot be captured, and multiple pieces can safely share them.</p>
            </div>
          </div>

          {/* Rule 5 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F3E8FF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Home Lane, Exact Finish & Winning</h4>
              <p>After completing the main circuit, pieces enter the player's colored home lane. An <strong>exact roll</strong> is required to land directly on the center finish. The first player to finish all <strong>4 pieces</strong> wins!</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-primary" onClick={onClose}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
