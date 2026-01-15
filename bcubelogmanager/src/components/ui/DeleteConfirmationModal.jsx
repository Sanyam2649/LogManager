// src/components/ui/DeleteConfirmationModal.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  title = "Confirm Delete", 
  message, 
  confirmText = "DELETE",
  onClose, 
  onConfirm,
  isLoading = false 
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleConfirm = () => {
    if (inputValue !== confirmText) {
      alert(`Please type "${confirmText}" to confirm deletion`);
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal modal-open">
        <div className="modal-box">
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            
            {/* Message */}
            <p className="text-base-content/70 mb-6">
              {message}
            </p>

            {/* Confirmation Input */}
            <div className="w-full mb-6">
              <label className="label">
                <span className="label-text">
                  Type <span className="font-bold text-error">{confirmText}</span> to confirm
                </span>
              </label>
              <input
                type="text"
                placeholder={`Type "${confirmText}" here`}
                className="input input-bordered w-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
                disabled={isLoading}
              />
            </div>

            {/* Warning Alert */}
            <div className="alert alert-warning mb-6 w-full">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm">
                This action cannot be undone. Data will be permanently deleted.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={onClose}
                className="btn btn-ghost flex-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-error flex-1 gap-2"
                disabled={isLoading || inputValue !== confirmText}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Variant for simpler confirmation (no text input required)
export const SimpleDeleteModal = ({ 
  title = "Confirm Delete", 
  message, 
  onClose, 
  onConfirm,
  isLoading = false,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel"
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal modal-open">
        <div className="modal-box">
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            
            {/* Message */}
            <p className="text-base-content/70 mb-6">
              {message}
            </p>

            {/* Warning Alert */}
            <div className="alert alert-warning mb-6 w-full">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-sm">
                This action cannot be undone.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full">
              <button
                onClick={onClose}
                className="btn btn-ghost flex-1"
                disabled={isLoading}
              >
                {cancelButtonText}
              </button>
              <button
                onClick={onConfirm}
                className="btn btn-error flex-1 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Variant for project deletion
export const ProjectDeleteModal = ({ project, onClose, onConfirm, isLoading = false }) => {
  return (
    <DeleteConfirmationModal
      title="Delete Project"
      message={`Are you sure you want to delete the project "${project?.name}"? All associated logs and data will be permanently deleted.`}
      confirmText="DELETE PROJECT"
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
};

// Variant for user deletion
export const UserDeleteModal = ({ user, onClose, onConfirm, isLoading = false }) => {
  return (
    <DeleteConfirmationModal
      title="Delete User"
      message={`Are you sure you want to delete user "${user?.username}" (${user?.email})? This action cannot be undone.`}
      confirmText="DELETE USER"
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
};

// Variant for log deletion
export const LogDeleteModal = ({ log, onClose, onConfirm, isLoading = false }) => {
  return (
    <SimpleDeleteModal
      title="Delete Log"
      message={`Are you sure you want to delete log #${log?.id}? This action cannot be undone.`}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
};

// Variant for multiple items deletion
export const BulkDeleteModal = ({ 
  count, 
  itemType = "items", 
  onClose, 
  onConfirm, 
  isLoading = false 
}) => {
  return (
    <DeleteConfirmationModal
      title={`Delete ${count} ${itemType}`}
      message={`Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`}
      confirmText={`DELETE ${count}`}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
};

export default DeleteConfirmationModal;