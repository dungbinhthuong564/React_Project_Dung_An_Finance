import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Sparkles, RefreshCw, Sun, Moon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetPlanner from './components/BudgetPlanner';
import ConfirmModal from './components/ConfirmModal';
import { useTranslation } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';

const DEFAULT_TRANSACTIONS = [
  { id: '1', title: 'Lương tháng 8', amount: 32500000, type: 'income', category: 'Lương', date: '2026-08-01' },
  { id: '2', title: 'Dự án Freelance thiết kế', amount: 8200000, type: 'income', category: 'Freelance', date: '2026-08-02' },
  { id: '3', title: 'Tiền thuê căn hộ', amount: 5000000, type: 'expense', category: 'Thuê nhà / Phòng', date: '2026-08-02' },
  { id: '4', title: 'Đi siêu thị Coopmart', amount: 1250000, type: 'expense', category: 'Ăn uống', date: '2026-08-03' },
  { id: '5', title: 'Hóa đơn tiền điện & Internet', amount: 890000, type: 'expense', category: 'Hóa đơn / Dịch vụ', date: '2026-08-03' },
  { id: '6', title: 'Mua sắm quần áo', amount: 1850000, type: 'expense', category: 'Mua sắm', date: '2026-08-04' },
  { id: '7', title: 'Vé xem phim & ăn tối', amount: 450000, type: 'expense', category: 'Giải trí', date: '2026-08-04' },
  { id: '8', title: 'Đổ xăng xe máy', amount: 90000, type: 'expense', category: 'Di chuyển / Đi lại', date: '2026-08-04' }
];

const DEFAULT_BUDGETS = {
  'Ăn uống': 4000000,
  'Giải trí': 1500000,
  'Mua sắm': 3000000,
  'Hóa đơn / Dịch vụ': 1200000,
  'Di chuyển / Đi lại': 500000,
  'Thuê nhà / Phòng': 6000000,
  'Khác': 1000000
};

export default function App() {
  const { locale, setLocale, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('fino_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('fino_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

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

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('fino_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fino_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Actions
  const handleAddTransaction = (newTrans, onSuccess) => {
    setConfirmModal({
      isOpen: true,
      title: t('form.title'),
      message: t('app.confirmSave'),
      onConfirm: () => {
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
      onConfirm: () => {
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
      onConfirm: () => {
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
      onConfirm: () => {
        setTransactions(DEFAULT_TRANSACTIONS);
        setBudgets(DEFAULT_BUDGETS);
        closeConfirm();
      }
    });
  };

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
    </div>
  );
}

