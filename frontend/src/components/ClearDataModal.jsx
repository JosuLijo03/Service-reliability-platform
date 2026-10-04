function ClearDataModal({
  isOpen,
  onCancel,
  onConfirm,
  isClearing,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="warning-modal"
      className="warning-modal show"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="warning-box">
        <div className="warning-icon">
          <span>!</span>
        </div>

        <h2>Clear All Monitoring Data?</h2>

        <p>
          This will permanently delete{" "}
          <strong>
            all services, monitoring history, incidents, and alerts
          </strong>
          . This action cannot be undone.
        </p>

        <div className="warning-actions">
          <button
            className="warning-cancel"
            onClick={onCancel}
            disabled={isClearing}
          >
            Cancel
          </button>

          <button
            className="warning-confirm"
            onClick={onConfirm}
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear All Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearDataModal;