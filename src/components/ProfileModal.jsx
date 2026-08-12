import React, { useState, useEffect, useRef } from 'react';
import { X, User, Loader2, Sparkles, Camera } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function ProfileModal({ isOpen, onClose, profile, onSave }) {
  const { t, locale } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (file) {
      // Validate file size (< 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(locale === 'vi' ? 'Vui lòng chọn ảnh nhỏ hơn 2MB.' : 'Please select an image smaller than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const onSuccess = () => {
      setLoading(false);
      onClose();
    };

    const onError = (msg) => {
      setLoading(false);
      setErrorMsg(msg);
    };

    await onSave(displayName, avatarUrl, onSuccess, onError);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden glass-panel border border-gray-800 shadow-2xl p-6 sm:p-8 animate-fade-in-up z-10 bg-gray-955">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles size={18} className="animate-pulse" />
            <h3 className="text-lg font-bold font-display text-gray-200">
              {locale === 'vi' ? 'Cập nhật hồ sơ' : 'Update Profile'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar Upload Selection at Top */}
          <div className="flex flex-col items-center space-y-2 mb-6">
            <div 
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full border-2 border-indigo-500/50 hover:border-indigo-500 cursor-pointer overflow-hidden group transition-all duration-300 shadow-lg shadow-indigo-500/10"
              title={locale === 'vi' ? 'Nhấp để chọn ảnh' : 'Click to select image'}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-3xl">
                  {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera size={20} />
                <span className="text-[9px] font-bold uppercase mt-1">
                  {locale === 'vi' ? 'Đổi ảnh' : 'Change'}
                </span>
              </div>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] text-gray-500 text-center">
              {locale === 'vi' ? 'Định dạng hỗ trợ: JPG, PNG, WEBP (Tối đa 2MB)' : 'Formats supported: JPG, PNG, WEBP (Max 2MB)'}
            </p>
          </div>

          {/* Display Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              {locale === 'vi' ? 'Tên hiển thị' : 'Display Name'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={locale === 'vi' ? 'Ví dụ: Nguyễn Văn A' : 'e.g. John Doe'}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-gray-200 transition-all duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-850 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 bg-transparent hover:bg-gray-850 text-gray-300 border border-gray-800 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              {locale === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {locale === 'vi' ? 'Đang lưu...' : 'Saving...'}
                </>
              ) : (
                locale === 'vi' ? 'Lưu thay đổi' : 'Save Changes'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
