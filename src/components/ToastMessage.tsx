import React from 'react';

export interface ToastData {
  text: string;
  icon?: string;
  color?: string;
}

interface ToastMessageProps {
  toast: ToastData | null;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 pointer-events-none z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-slate-900/90 backdrop-blur-md border-2 border-amber-400/80 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm sm:max-w-md text-center">
        <span className="text-lg">{toast.icon || '✨'}</span>
        <span style={{ color: toast.color || '#fef08a' }}>{toast.text}</span>
      </div>
    </div>
  );
};
