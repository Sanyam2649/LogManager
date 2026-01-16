// src/components/logs/LogDetailModal.jsx
import React from 'react';
import { X, Copy, Calendar, Server, Globe, MessageSquare, AlertCircle, Info, Hash, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LogDetailModal = ({ log, categories, onClose }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getLevelBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'badge-error';
      case 'WARN': return 'badge-warning';
      case 'INFO': return 'badge-info';
      case 'DEBUG': return 'badge-neutral';
      default: return 'badge-ghost';
    }
  };

  const getLevelIcon = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return <AlertCircle className="w-5 h-5" />;
      case 'WARN': return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'INFO': return <Info className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const category = categories.find(c => c.id === log.category_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal modal-open">
        <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Log Details</h3>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Basic Information */}
            <div className="card bg-base-200 mb-4">
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-base-content/60" />
                        <span className="font-medium">ID:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{log.id}</span>
                        <button
                          onClick={() => copyToClipboard(log.id)}
                          className="btn btn-xs btn-ghost"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-base-content/60" />
                        <span className="font-medium">Timestamp:</span>
                      </div>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-base-content/60" />
                        <span className="font-medium">Level:</span>
                      </div>
                      <span className={`badge ${getLevelBadgeClass(log.level)} gap-2`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-base-content/60" />
                        <span className="font-medium">Service:</span>
                      </div>
                      <span>{log.service || '-'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-base-content/60" />
                        <span className="font-medium">Environment:</span>
                      </div>
                      <span>{log.environment || '-'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-base-content/60" />
                        <span className="font-medium">Category:</span>
                      </div>
                      <span className={`badge ${category?.is_system ? 'badge-primary' : 'badge-secondary'}`}>
                        {category?.name || 'Unknown'}
                        {category?.is_system && ' (System)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="card bg-base-200 mb-4">
              <div className="card-body p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </h4>
                <div className="bg-base-300 p-3 rounded">
                  <pre className="whitespace-pre-wrap">{log.message}</pre>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => copyToClipboard(log.message)}
                    className="btn btn-xs btn-ghost"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Message
                  </button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {log.meta && Object.keys(log.meta).length > 0 && (
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h4 className="font-semibold mb-2">Metadata</h4>
                  <div className="bg-base-300 p-3 rounded overflow-auto max-h-64">
                    <pre className="text-sm">{JSON.stringify(log.meta, null, 2)}</pre>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(log.meta, null, 2))}
                      className="btn btn-xs btn-ghost"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Metadata
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-action mt-4">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;