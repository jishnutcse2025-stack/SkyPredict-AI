import React from 'react';
import { Plane, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white/60 rounded-xl border border-dashed border-blue-200">
      <div className="p-3.5 rounded-2xl bg-pale-bg text-royal mb-3">
        <Plane className="w-6 h-6 rotate-45" />
      </div>
      <h4 className="text-base font-semibold text-navy">{title}</h4>
      <p className="text-xs text-content-muted max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg bg-royal text-white text-xs font-medium hover:bg-royal-hover transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-red-50/60 rounded-xl border border-red-200">
      <div className="p-3 rounded-full bg-red-100 text-red-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-red-900">Analytics Service Interruption</h4>
      <p className="text-xs text-red-700 max-w-md mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-medium hover:bg-red-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};
