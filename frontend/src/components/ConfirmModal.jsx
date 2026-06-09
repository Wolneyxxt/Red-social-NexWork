import './ConfirmModal.css'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, danger }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className={`modal-icon ${danger ? 'danger' : 'warning'}`}>
          {danger ? (
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          ) : (
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button
            className={`modal-confirm ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="modal-spinner" /> : null}
            {loading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
