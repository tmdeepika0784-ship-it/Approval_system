import React from 'react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'primary', // primary, danger, warning, success
  showSingleButton = false // If true, shows only one button (OK/Close)
}) => {
  if (!isOpen) return null;

  const getButtonClass = () => {
    switch(type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'success': return 'btn-primary';
      default: return 'btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        
        <div style={{ marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
          {message}
        </div>

        <div className="modal-footer">
          {showSingleButton ? (
            <button
              type="button"
              className={`btn ${getButtonClass()}`}
              onClick={onClose}
            >
              OK
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${getButtonClass()}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
