import React, { useState } from 'react';
import { PlusCircle, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
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

const INCOME_CATEGORIES = [
  'Lương',
  'Freelance',
  'Đầu tư',
  'Khác'
];

export default function TransactionForm({ onAddTransaction }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!title.trim()) newErrors.title = t('form.errTitle');
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = t('form.errAmount');
    if (!date) newErrors.date = t('form.errDate');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddTransaction(
      {
        id: Date.now().toString(),
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date
      },
      () => {
        // onSuccess: Reset Form
        setTitle('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setErrors({});
      }
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between">
      <div>
        <h4 className="font-semibold text-gray-200 text-lg mb-6 flex items-center gap-2">
          <PlusCircle className="text-indigo-400" size={20} />
          {t('form.title')}
        </h4>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Toggle Type (Income / Expense) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('form.typeExpense')}
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('form.typeIncome')}
            </button>
          </div>

          {/* Title input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <FileText size={14} className="text-gray-500" />
              {t('form.fieldTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('form.titlePlaceholder')}
              className={`w-full bg-gray-950/80 border ${
                errors.title ? 'border-rose-500/50 focus:border-rose-500' : 'border-gray-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 transition-colors`}
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1 pl-1">{errors.title}</p>}
          </div>

          {/* Amount and Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <DollarSign size={14} className="text-gray-500" />
                {t('form.fieldAmount')}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('form.amountPlaceholder')}
                className={`w-full bg-gray-950/80 border ${
                  errors.amount ? 'border-rose-500/50 focus:border-rose-500' : 'border-gray-800 focus:border-indigo-500'
                } rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 transition-colors`}
              />
              {errors.amount && <p className="text-rose-400 text-xs mt-1 pl-1">{errors.amount}</p>}
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Tag size={14} className="text-gray-500" />
                {t('form.fieldCategory')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-950/80 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 transition-colors cursor-pointer"
              >
                {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {t('categories.' + cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-500" />
              {t('form.fieldDate')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-950/80 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 transition-colors cursor-pointer"
            />
            {errors.date && <p className="text-rose-400 text-xs mt-1 pl-1">{errors.date}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 mt-4"
          >
            <PlusCircle size={18} />
            {t('form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
