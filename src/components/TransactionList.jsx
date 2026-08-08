import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, ArrowUpDown, Tag, Calendar, AlertCircle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function TransactionList({ transactions, onDeleteTransaction }) {
  const { locale, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

  // Group all categories from transactions to dynamically show in filter select
  const availableCategories = useMemo(() => {
    const cats = new Set();
    transactions.forEach(t => cats.add(t.category));
    return Array.from(cats);
  }, [transactions]);

  // Format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter and Sort Logic
  const filteredSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) || 
        t.category.toLowerCase().includes(term) ||
        t('categories.' + t.category).toLowerCase().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      } else if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy, t]);

  // Category Icon Background Colors
  const getCategoryStyles = (category, type) => {
    if (type === 'income') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    
    const colors = {
      'Ăn uống': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'Thuê nhà / Phòng': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'Di chuyển / Đi lại': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Mua sắm': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'Giải trí': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Hóa đơn / Dịch vụ': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      'Khác': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return colors[category] || 'bg-violet-500/10 text-violet-400 border-violet-500/20';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-semibold text-gray-200 text-lg">{t('list.title')}</h4>
          <p className="text-xs text-gray-400 mt-1">{t('list.subtitle')}</p>
        </div>
        
        {/* Total results badge */}
        <span className="bg-gray-900 border border-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full font-semibold flex items-center shrink-0">
          {t('list.totalCount')}: {filteredSortedTransactions.length}
        </span>
      </div>

      {/* Filter and search bar controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={16} />
          <input
            type="text"
            placeholder={t('list.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-955 border border-gray-800/80 focus:border-indigo-500/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-100 placeholder-gray-550 transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 text-gray-500" size={16} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-gray-955 border border-gray-800/80 focus:border-indigo-500/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-300 cursor-pointer"
          >
            <option value="all">{t('list.filterTypeAll')}</option>
            <option value="expense">{t('list.filterTypeExpense')}</option>
            <option value="income">{t('list.filterTypeIncome')}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-3 text-gray-500" size={16} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-gray-955 border border-gray-800/80 focus:border-indigo-500/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-300 cursor-pointer"
          >
            <option value="all">{t('list.filterCatAll')}</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{t('categories.' + cat)}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-3 text-gray-500" size={16} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-gray-955 border border-gray-800/80 focus:border-indigo-500/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-300 cursor-pointer"
          >
            <option value="date-desc">{t('list.sortNewest')}</option>
            <option value="date-asc">{t('list.sortOldest')}</option>
            <option value="amount-desc">{t('list.sortAmountDesc')}</option>
            <option value="amount-asc">{t('list.sortAmountAsc')}</option>
          </select>
        </div>
      </div>

      {/* Transaction List Items */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredSortedTransactions.length > 0 ? (
          filteredSortedTransactions.map((tItem) => (
            <div
              key={tItem.id}
              className="glass-panel-hover flex items-center justify-between p-4 bg-gray-955 border border-gray-800/50 rounded-xl group hover:border-gray-700/80"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Category Icon and styling */}
                <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold shrink-0 ${getCategoryStyles(tItem.category, tItem.type)}`}>
                  {t('categories.' + tItem.category)}
                </div>
                
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate pr-2" title={tItem.title}>
                    {tItem.title}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center mt-1">
                    <Calendar size={10} className="mr-1" />
                    {new Date(tItem.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                  </p>
                </div>
              </div>

              {/* Amount and delete button */}
              <div className="flex items-center space-x-4 shrink-0">
                <span className={`text-sm font-bold font-display ${tItem.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tItem.type === 'income' ? '+' : '-'}{formatVND(tItem.amount)}
                </span>
                
                <button
                  onClick={() => onDeleteTransaction(tItem.id)}
                  className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors duration-200 cursor-pointer"
                  title={t('list.deleteTitle')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-550 border border-dashed border-gray-800/80 rounded-xl flex flex-col items-center">
            <AlertCircle size={32} className="text-gray-700 mb-2" />
            <p className="text-sm">{t('list.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
