import React, { useState } from 'react';
import { Mail, Lock, Landmark, ArrowLeft, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import authBg from '../assets/auth_bg.png';

export default function Auth() {
  const { t, locale } = useTranslation();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!supabase) {
      setErrorMsg(locale === 'vi' ? 'Supabase chưa được cấu hình.' : 'Supabase is not configured.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMsg(t('auth.passwordMismatch'));
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg(t('auth.registerSuccess'));
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        setSuccessMsg(t('auth.resetSuccess'));
        setEmail('');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMsg(err.message || t('auth.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="h-screen w-screen flex bg-gray-955 overflow-hidden">
      {/* Container */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Artwork (Crimson Forest) */}
        <div 
          className="hidden md:flex relative flex-col justify-between p-12 lg:p-16 bg-cover bg-center h-full overflow-hidden"
          style={{ backgroundImage: `url(${authBg})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-955 via-gray-955/40 to-transparent z-0"></div>

          {/* Logo */}
          <div className="relative z-10 flex items-center space-x-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 backdrop-blur-md">
              <Landmark size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display text-white tracking-wide">
                {t('app.name')}
              </h2>
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mt-0.5">
                {locale === 'vi' ? 'Quản lý Tài chính' : 'Finance Manager'}
              </p>
            </div>
          </div>

          {/* Slogan */}
          <div className="relative z-10 max-w-sm space-y-4">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl inline-flex items-center gap-1.5 text-xs text-indigo-300 font-semibold backdrop-blur-md">
              <Sparkles size={14} className="animate-pulse" />
              {locale === 'vi' ? 'Ứng dụng cao cấp' : 'Premium Application'}
            </div>
            <h3 className="text-3xl font-extrabold text-white leading-tight font-display">
              {locale === 'vi' ? 'Làm chủ tài chính, nâng tầm cuộc sống' : 'Master your money, elevate your life'}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('auth.brandDescription')}
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-[11px] text-gray-400">
            {t('app.footerText')}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-20 bg-gray-955/50 backdrop-blur-sm relative h-full overflow-y-auto">
          <div className="w-full max-w-md space-y-6">
            
            {/* Mobile logo */}
            <div className="flex items-center space-x-2 md:hidden mb-6">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Landmark size={20} />
              </div>
              <h2 className="text-lg font-bold font-display text-gray-200">
                {t('app.name')}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Header Text */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-150">
                  {mode === 'login' && t('auth.login')}
                  {mode === 'register' && t('auth.register')}
                  {mode === 'forgot' && t('auth.forgotTitle')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  {mode === 'login' && (locale === 'vi' ? 'Chào mừng bạn quay lại! Hãy đăng nhập.' : 'Welcome back! Please enter your details.')}
                  {mode === 'register' && (locale === 'vi' ? 'Bắt đầu hành trình quản lý tài chính thông minh.' : 'Start your smart financial management journey.')}
                  {mode === 'forgot' && (locale === 'vi' ? 'Nhập email để nhận liên kết khôi phục mật khẩu.' : 'Enter your email to receive a password reset link.')}
                </p>
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success messages */}
              {successMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-gray-200 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Input */}
                {mode !== 'forgot' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-300">
                        {t('auth.password')}
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-150 cursor-pointer"
                        >
                          {t('auth.forgotPassword')}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.passwordPlaceholder')}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-gray-200 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      {t('auth.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('auth.passwordPlaceholder')}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-gray-200 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('auth.loading')}
                    </>
                  ) : (
                    <>
                      {mode === 'login' && t('auth.login')}
                      {mode === 'register' && t('auth.register')}
                      {mode === 'forgot' && t('auth.sendResetLink')}
                    </>
                  )}
                </button>
              </form>

              {/* Mode switchers */}
              <div className="pt-4 border-t border-gray-800/60 text-center">
                {mode === 'login' && (
                  <p className="text-xs text-gray-400">
                    {t('auth.dontHaveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors duration-150 cursor-pointer"
                    >
                      {t('auth.register')}
                    </button>
                  </p>
                )}
                {mode === 'register' && (
                  <p className="text-xs text-gray-400">
                    {t('auth.alreadyHaveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors duration-150 cursor-pointer"
                    >
                      {t('auth.login')}
                    </button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors duration-150 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    {t('auth.backToLogin')}
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
