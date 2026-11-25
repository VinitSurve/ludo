import React from 'react';
import { X, Settings, Volume2, VolumeX, Shield, Award, Gauge } from 'lucide-react';

export function SettingsModal({
  isOpen,
  onClose,
  soundMuted,
  onToggleSound,
  movementSpeed = 'normal',
  onSetMovementSpeed,
  rules,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings className="text-blue-600" size={24} />
            <h2 className="modal-title">Game Settings</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Movement Speed Setting */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gauge size={20} className="text-blue-600" />
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Pawn Movement Speed</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Smooth step-by-step movement sequential square traversal.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {[
                { id: 'slow', label: 'Slow (350ms)' },
                { id: 'normal', label: 'Normal (Default)' },
                { id: 'fast', label: 'Fast (190ms)' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onSetMovementSpeed?.(sp.id)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: movementSpeed === sp.id ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: movementSpeed === sp.id ? '#EFF6FF' : '#FFFFFF',
                    color: movementSpeed === sp.id ? '#1D4ED8' : '#475569',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sp.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '6px' }}>
              ♿ Reduced-motion accessibility is respected automatically based on device preferences.
            </p>
          </div>

          {/* Audio Setting */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {soundMuted ? <VolumeX size={20} className="text-slate-400" /> : <Volume2 size={20} className="text-blue-600" />}
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Game Sound Effects</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B' }}>Web Audio synthesized sound effects for dice, moves, captures, and victory.</p>
              </div>
            </div>
            <button
              type="button"
              className={soundMuted ? 'btn-secondary' : 'btn-primary'}
              onClick={onToggleSound}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              {soundMuted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          {/* Active Rules Info */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Engine Rules Active
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#475569' }}>
              <div>✔ Roll 6 to leave base: <strong>Enabled</strong></div>
              <div>✔ Bonus turn on rolling 6: <strong>Enabled</strong></div>
              <div>✔ Bonus turn on capture: <strong>Enabled</strong></div>
              <div>✔ Safe squares protection: <strong>Enabled</strong></div>
              <div>✔ Exact dice roll for finish: <strong>Enabled</strong></div>
              <div>✔ Full snapshot state undo: <strong>Enabled</strong></div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
