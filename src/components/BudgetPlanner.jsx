import React, { useState, useMemo } from 'react';
import { Target, Settings, HelpCircle, Save } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const EXPENSE_CATEGORIES = [
  'Ăn uống',
  'Thuê nhà / Phòng',
  'Di chuyển / Đi lại',
  'Mua sắm',
  'Giải trí',
  'Hóa đơn / Dịch vụ',
  'Khác'
];

export default function BudgetPlanner({ transactions, budgets, onUpdateBudget }) {
  const { locale, t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');

  // Calculate current month's total spending per category
  const categorySpending = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const spending = {};
    // Initialize with 0
    EXPENSE_CATEGORIES.forEach(cat => {
      spending[cat] = 0;
    });

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const transDate = new Date(t.date);
        // Only calculate for current month and year
        if (transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear) {
          spending[t.category] = (spending[t.category] || 0) + (parseFloat(t.amount) || 0);
        }
      }
    });

    return spending;
  }, [transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!limitAmount || parseFloat(limitAmount) < 0) return;

    onUpdateBudget(selectedCategory, parseFloat(limitAmount), () => {
      // onSuccess: Clear limitAmount input
      setLimitAmount('');
    });
  };

  // Format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get Progress Bar Color
  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
    if (percentage >= 80) return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]';
    return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
  };

  // Get Text Color for percentage
  const getPercentageColor = (percentage) => {
    if (percentage >= 100) return 'text-rose-400 font-bold';
    if (percentage >= 80) return 'text-yellow-400 font-semibold';
    return 'text-emerald-400';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-gray-200 text-lg flex items-center gap-2">
            <Target className="text-indigo-400" size={20} />
            {t('budget.title')}
          </h4>
          <p className="text-xs text-gray-400 mt-1">{t('budget.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Set budget limits form (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-gray-955 border border-gray-900 rounded-xl p-4 self-start">
          <h5 className="font-semibold text-gray-300 text-sm mb-4 flex items-center gap-1.5">
            <Settings size={15} className="text-indigo-400" />
            {t('budget.settingTitle')}
          </h5>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">{t('budget.labelCategory')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-950/80 border border-gray-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-gray-200 cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{t('categories.' + cat)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-semibold">{t('budget.labelLimit')}</label>
              <input
                type="number"
                placeholder={locale === 'vi' ? 'Ví dụ: 2000000' : 'e.g., 2000000'}
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                className="w-full bg-gray-955 border border-gray-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-gray-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              {t('budget.submit')}
            </button>
          </form>
        </div>

        {/* Budgets list tracking (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {EXPENSE_CATEGORIES.map((category) => {
            const limit = budgets[category] || 0;
            const spent = categorySpending[category] || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            
            return (
              <div key={category} className="space-y-2 bg-gray-900/10 border border-gray-800/40 rounded-xl p-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300">{t('categories.' + category)}</span>
                  <span className="text-gray-400">
                    {t('budget.spent')}: <strong className="text-gray-200 font-display">{formatVND(spent).replace('VND', '').replace('₫', '')}</strong> 
                    {limit > 0 ? ` / ${formatVND(limit).replace('VND', '').replace('₫', '')}` : ` ${t('budget.noLimit')}`}
                  </span>
                </div>

                {limit > 0 ? (
                  <div className="space-y-1">
                    {/* Progress Bar Container */}
                    <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-900">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    {/* Status Info */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={getPercentageColor(percentage)}>
                        {percentage.toFixed(0)}% {t('budget.used')}
                      </span>
                      {percentage >= 100 ? (
                        <span className="text-rose-400 font-medium">{t('budget.overLimit')}</span>
                      ) : percentage >= 80 ? (
                        <span className="text-yellow-400 font-medium">{t('budget.closeToLimit')}</span>
                      ) : (
                        <span className="text-gray-500">{t('budget.safe')}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 italic flex items-center gap-1">
                    <HelpCircle size={10} />
                    {t('budget.placeholder')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
