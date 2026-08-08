import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  const { locale } = useTranslation();

  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with fade-in */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Container with scale-in animation */}
      <div className="relative glass-panel w-full max-w-md rounded-2xl p-6 overflow-hidden z-10 animate-fade-in-up">
        {/* Header decoration line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 rounded-lg transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-start space-x-4 mt-2">
          {/* Warning Icon */}
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl shrink-0">
            <AlertTriangle size={22} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-100 font-display">
              {title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-900/60">
          <button
            onClick={onCancel}
            className="py-2.5 px-4 bg-transparent border border-gray-800 hover:bg-gray-900/60 text-gray-400 hover:text-gray-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            {locale === 'vi' ? 'Hủy bỏ' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/15"
          >
            {locale === 'vi' ? 'Xác nhận' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
