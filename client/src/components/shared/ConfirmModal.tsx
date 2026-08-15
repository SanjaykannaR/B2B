import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function ConfirmModal({ isOpen, onClose, title, children }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 animate-dashFadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-[24px] max-w-[450px] w-full p-6 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.4)] animate-dashPopIn relative max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        {title && <h3 className="text-xl font-extrabold text-slate-900 mb-6">{title}</h3>}
        
        {children}
      </div>
    </div>
  );
}
