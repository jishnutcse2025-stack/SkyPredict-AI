import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Computing flight analytics...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-2xl bg-royal/10 text-royal animate-spin mb-4">
        <Loader2 className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-navy">{message}</p>
      <p className="text-xs text-content-muted mt-1">Interrogating ML inference pipeline</p>
    </div>
  );
};
