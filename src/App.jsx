import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Sparkles, RefreshCw, Sun, Moon, LogOut, User } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetPlanner from './components/BudgetPlanner';
import ConfirmModal from './components/ConfirmModal';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import { useTranslation } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import { supabase } from './supabaseClient';

const DEFAULT_TRANSACTIONS = [];

const DEFAULT_BUDGETS = {};

export default function App() {
  const { locale, setLocale, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#user-menu-button')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  // Manage user session
  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
      setAuthChecking(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveProfile = async (displayName, avatarUrl, onSuccess, onError) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, display_name: displayName, avatar_url: avatarUrl });

      if (error) throw error;

      setProfile((prev) => ({
        ...prev,
        display_name: displayName,
        avatar_url: avatarUrl,
      }));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error saving profile:', err);
      if (onError) onError(err.message || 'Failed to update profile.');
    }
  };

  // Load Data from Supabase with localStorage backup
  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        // Fallback to localStorage or defaults
        const savedTrans = localStorage.getItem('fino_transactions');
        setTransactions(savedTrans ? JSON.parse(savedTrans) : DEFAULT_TRANSACTIONS);
        
        const savedBudgets = localStorage.getItem('fino_budgets');
        setBudgets(savedBudgets ? JSON.parse(savedBudgets) : DEFAULT_BUDGETS);
        
        setLoading(false);
        return;
      }

      if (authChecking) return;

      if (!user) {
        setTransactions([]);
        setBudgets({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch transactions from Supabase
        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (transError) throw transError;

        // Fetch budgets from Supabase
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('*');

        if (budgetError) throw budgetError;

        // Map budgets array to object
        const budgetMap = {};
        if (budgetData && budgetData.length > 0) {
          budgetData.forEach(b => {
            budgetMap[b.category] = Number(b.limit_amount);
          });
        }

        // Fetch profiles from Supabase
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setTransactions(transData || []);
        setBudgets(budgetMap);
        setProfile(profData || null);
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
        setTransactions([]);
        setBudgets({});
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authChecking]);

  // Sync with LocalStorage ONLY if Supabase is not configured
  useEffect(() => {
    if (!supabase && transactions.length > 0) {
      localStorage.setItem('fino_transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (!supabase && Object.keys(budgets).length > 0) {
      localStorage.setItem('fino_budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  // Actions
  const handleAddTransaction = (newTrans, onSuccess) => {
    setConfirmModal({
      isOpen: true,
      title: t('form.title'),
      message: t('app.confirmSave'),
      onConfirm: async () => {
        if (supabase && user) {
          try {
            const { error } = await supabase
              .from('transactions')
              .insert([{ ...newTrans, user_id: user.id }]);
            if (error) throw error;
          } catch (err) {
            console.error('Error inserting transaction to Supabase:', err);
            alert(locale === 'vi' ? 'Lỗi lưu dữ liệu lên cơ sở dữ liệu.' : 'Failed to save to database.');
          }
        } else {
          const updated = [newTrans, ...transactions];
          localStorage.setItem('fino_transactions', JSON.stringify(updated));
        }

        setTransactions((prev) => [newTrans, ...prev]);
        if (onSuccess) onSuccess();
        closeConfirm();
      }
    });
  };

  const handleDeleteTransaction = (id) => {
    setConfirmModal({
      isOpen: true,
      title: t('list.deleteTitle'),
      message: t('app.confirmDelete'),
      onConfirm: async () => {
        if (supabase) {
          try {
            const { error } = await supabase
              .from('transactions')
              .delete()
              .eq('id', id);
            if (error) throw error;
          } catch (err) {
            console.error('Error deleting transaction from Supabase:', err);
            alert(locale === 'vi' ? 'Lỗi xóa dữ liệu trên cơ sở dữ liệu.' : 'Failed to delete from database.');
          }
        } else {
          const updated = transactions.filter(t => t.id !== id);
          localStorage.setItem('fino_transactions', JSON.stringify(updated));
        }

        setTransactions((prev) => prev.filter(t => t.id !== id));
        closeConfirm();
      }
    });
  };

  const handleUpdateBudget = (category, limit, onSuccess) => {
    setConfirmModal({
      isOpen: true,
      title: t('budget.settingTitle'),
      message: t('app.confirmBudget'),
      onConfirm: async () => {
        if (supabase && user) {
          try {
            const { error } = await supabase
              .from('budgets')
              .upsert({ user_id: user.id, category, limit_amount: limit }, { onConflict: 'user_id,category' });
            if (error) throw error;
          } catch (err) {
            console.error('Error updating budget in Supabase:', err);
            alert(locale === 'vi' ? 'Lỗi cập nhật ngân sách.' : 'Failed to update budget.');
          }
        } else {
          const updated = { ...budgets, [category]: limit };
          localStorage.setItem('fino_budgets', JSON.stringify(updated));
        }

        setBudgets((prev) => ({
          ...prev,
          [category]: limit
        }));
        if (onSuccess) onSuccess();
        closeConfirm();
      }
    });
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: t('app.resetData'),
      message: t('app.confirmReset'),
      onConfirm: async () => {
        if (supabase && user) {
          try {
            // Delete all records from both tables for current user
            const { error: delTransErr } = await supabase.from('transactions').delete().eq('user_id', user.id);
            const { error: delBudgetErr } = await supabase.from('budgets').delete().eq('user_id', user.id);
            
            if (delTransErr) throw delTransErr;
            if (delBudgetErr) throw delBudgetErr;
          } catch (err) {
            console.error('Error resetting database in Supabase:', err);
            alert(locale === 'vi' ? 'Lỗi reset dữ liệu.' : 'Failed to reset database.');
          }
        } else {
          localStorage.setItem('fino_transactions', JSON.stringify([]));
          localStorage.setItem('fino_budgets', JSON.stringify({}));
        }

        setTransactions([]);
        setBudgets({});
        closeConfirm();
      }
    });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-955 text-gray-200">
        <div className="flex flex-col items-center space-y-4 p-8 glass-panel border border-indigo-500/20 rounded-2xl shadow-xl max-w-sm w-full mx-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 animate-spin">
            <RefreshCw size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-200 font-display">
            {locale === 'vi' ? 'Đang kiểm tra phiên đăng nhập...' : 'Checking session...'}
          </h2>
        </div>
      </div>
    );
  }

  if (supabase && !user) {
    return <Auth />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-955 text-gray-200">
        <div className="flex flex-col items-center space-y-4 p-8 glass-panel border border-indigo-500/20 rounded-2xl shadow-xl max-w-sm w-full mx-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 animate-spin">
            <RefreshCw size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-200 font-display">
            {locale === 'vi' ? 'Đang tải dữ liệu...' : 'Loading data...'}
          </h2>
          <p className="text-xs text-gray-400 text-center">
            {locale === 'vi' ? 'Kết nối tới cơ sở dữ liệu Supabase của bạn' : 'Connecting to your Supabase database'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60 py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-gray-150 flex items-center gap-1.5 leading-none">
                {t('app.name')}
                <span className="text-[10px] py-0.5 px-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-semibold">
                  Personal
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 mt-1">{t('app.tagline')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-gray-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-gray-400 hover:text-indigo-400 rounded-xl transition-all duration-200 cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-gray-955 border border-gray-800 rounded-xl p-1">
              <button
                onClick={() => setLocale('vi')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  locale === 'vi'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                VI
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  locale === 'en'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={handleResetData}
              className="py-2 px-3 border border-gray-800/80 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-gray-400 hover:text-indigo-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
              title={t('app.resetData')}
            >
              <RefreshCw size={14} />
              {t('app.resetData')}
            </button>
            
            {supabase && user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-gray-800/20 border border-transparent hover:border-gray-800 rounded-xl transition-all duration-200 cursor-pointer"
                  id="user-menu-button"
                  title={profile && profile.display_name ? profile.display_name : user.email}
                >
                  {profile && profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-gray-850"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs border border-indigo-400/20">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs text-gray-300 font-semibold max-w-[120px] truncate">
                    {profile && profile.display_name ? profile.display_name : user.email?.split('@')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-gray-955 border border-gray-800/60 shadow-2xl py-1.5 z-50 animate-fade-in-up">
                    <div className="px-4 py-2.5 border-b border-gray-900 text-left">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{locale === 'vi' ? 'Tài khoản' : 'Account'}</p>
                      <p className="text-xs text-gray-300 font-semibold truncate mt-0.5" title={user.email}>{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setProfileModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:text-indigo-400 hover:bg-indigo-500/5 flex items-center gap-2 transition-all duration-150 cursor-pointer"
                    >
                      <User size={14} />
                      {locale === 'vi' ? 'Cập nhật hồ sơ' : 'Update Profile'}
                    </button>
                    
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        const { error } = await supabase.auth.signOut();
                        if (error) console.error('Error logging out:', error);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/5 flex items-center gap-2 border-t border-gray-900 transition-all duration-150 cursor-pointer font-semibold"
                    >
                      <LogOut size={14} />
                      {locale === 'vi' ? 'Đăng xuất' : 'Log Out'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-xl font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {t('app.active')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 flex-grow w-full space-y-8 pb-12">
        
        {/* Step 1: Dashboard overview with SVG charts */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-200 font-display">{t('dashboard.title')}</h2>
          </div>
          <Dashboard transactions={transactions} />
        </section>

        {/* Step 2: Form & Budget in 1 side, list in another side */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Budget Planner (5/12 width) */}
          <div className="lg:col-span-5 space-y-8">
            <TransactionForm onAddTransaction={handleAddTransaction} />
            <BudgetPlanner 
              transactions={transactions} 
              budgets={budgets} 
              onUpdateBudget={handleUpdateBudget} 
            />
          </div>

          {/* Right Column: Transaction List (7/12 width) */}
          <div className="lg:col-span-7">
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={handleDeleteTransaction} 
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-955/40 py-6 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>{t('app.footerText')}</p>
          <div className="flex space-x-4">
            <span className="hover:text-gray-400 cursor-pointer">{t('app.privacy')}</span>
            <span className="hover:text-gray-400 cursor-pointer">{t('app.terms')}</span>
            <span className="hover:text-gray-400 cursor-pointer">{t('app.help')}</span>
          </div>
        </div>
      </footer>

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Custom Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

