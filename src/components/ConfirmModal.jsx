import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          {title}
        </h3>

        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '20px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            {cancelText}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            style={{ flex: 1, background: '#EF4444', borderColor: '#DC2626' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
