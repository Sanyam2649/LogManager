// src/components/logs/TimezoneDeleteModal.jsx
import React, { useState } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';

const TimezoneDeleteModal = ({ onClose, onConfirm }) => {
  const [timezoneOffset, setTimezoneOffset] = useState('+05:30');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    await onConfirm(timezoneOffset);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal modal-open">
        <div className="modal-box">
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">Bulk Delete Logs</h3>
            <p className="text-base-content/70 mb-6">
              Delete all logs from a specific timezone
            </p>

            <div className="w-full space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timezone Offset
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={timezoneOffset}
                  onChange={(e) => setTimezoneOffset(e.target.value)}
                >
                  <option value="+05:30">IST (+05:30)</option>
                  <option value="+00:00">UTC (+00:00)</option>
                  <option value="-05:00">EST (-05:00)</option>
                  <option value="-08:00">PST (-08:00)</option>
                  <option value="+01:00">CET (+01:00)</option>
                  <option value="+09:00">JST (+09:00)</option>
                </select>
                <label className="label">
                  <span className="label-text-alt">
                    Logs with timestamp ending in "{timezoneOffset}" will be deleted
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Type <span className="font-bold text-error">DELETE</span> to confirm
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Type DELETE here"
                  className="input input-bordered"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>

              <div className="alert alert-warning">
                <AlertTriangle className="w-5 h-5" />
                <span>
                  This action cannot be undone. All logs from timezone {timezoneOffset} will be permanently deleted.
                </span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={onClose}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-error gap-2"
                disabled={loading || confirmText !== 'DELETE'}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                Delete Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneDeleteModal;