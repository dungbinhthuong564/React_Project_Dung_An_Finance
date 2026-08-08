import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, Activity } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export default function Dashboard({ transactions }) {
  const { locale, t } = useTranslation();

  // Calculations
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else {
        expenses += amt;
      }
    });
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions]);

  // Expenses Category Breakdown for Donut Chart
  const categoryStats = useMemo(() => {
    const expensesOnly = transactions.filter(t => t.type === 'expense');
    const totalExp = expensesOnly.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const groups = {};
    expensesOnly.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      groups[t.category] = (groups[t.category] || 0) + amt;
    });

    const colors = {
      'Ăn uống': '#f43f5e',      // rose-500
      'Thuê nhà / Phòng': '#6366f1', // indigo-500
      'Di chuyển / Đi lại': '#3b82f6', // blue-500
      'Mua sắm': '#eab308',      // yellow-500
      'Giải trí': '#a855f7',     // purple-500
      'Hóa đơn / Dịch vụ': '#14b8a6', // teal-500
      'Khác': '#6b7280'          // gray-500
    };

    let accumulatedPercentage = 0;
    return Object.keys(groups).map((cat) => {
      const amount = groups[cat];
      const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0;
      const startPercent = accumulatedPercentage;
      accumulatedPercentage += percentage;
      return {
        category: cat,
        amount,
        percentage,
        color: colors[cat] || '#8b5cf6',
        startPercent
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Trend Data for Area Chart
  const trendData = useMemo(() => {
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group by date or just show sequential transaction values (max last 10 for simplicity & clean view)
    let currentBalance = 0;
    const points = sorted.map((t, idx) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        currentBalance += amt;
      } else {
        currentBalance -= amt;
      }
      return {
        label: t.title,
        date: new Date(t.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' }),
        balance: currentBalance
      };
    });

    // Take last 8 points to keep chart clean
    return points.slice(-8);
  }, [transactions, locale]);

  // Format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Generate SVG Path for Area Chart
  const svgChartPath = useMemo(() => {
    if (trendData.length < 2) return { line: '', area: '' };
    
    const width = 500;
    const height = 180;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const balances = trendData.map(d => d.balance);
    const minVal = Math.min(...balances, 0); // Include 0 in scale
    const maxVal = Math.max(...balances, 100000); // Avoid division by 0
    const valRange = maxVal - minVal;

    const coords = trendData.map((d, idx) => {
      const x = padding + (idx / (trendData.length - 1)) * chartWidth;
      // Invert Y because SVG 0 is top
      const y = height - padding - ((d.balance - minVal) / valRange) * chartHeight;
      return { x, y };
    });

    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      // Create a smooth cubic bezier connection
      const cpX1 = coords[i - 1].x + (coords[i].x - coords[i - 1].x) / 2;
      const cpY1 = coords[i - 1].y;
      const cpX2 = cpX1;
      const cpY2 = coords[i].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i].x} ${coords[i].y}`;
    }

    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;
    
    return { line: linePath, area: areaPath, coords };
  }, [trendData]);

  return (
    <div className="space-y-6">
      {/* 3 cards overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden animate-fade-in-up">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-indigo-500/10 pointer-events-none">
            <Wallet size={160} />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">{t('dashboard.balance')}</p>
              <h3 className="text-3xl font-bold font-display mt-2 tracking-tight">
                {formatVND(stats.balance)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-indigo-300 bg-indigo-500/5 py-1.5 px-3 rounded-lg w-max border border-indigo-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
            {t('dashboard.currentAccount')}
          </div>
        </div>

        {/* Total Income Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-emerald-500/10 pointer-events-none">
            <TrendingUp size={160} />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">{t('dashboard.income')}</p>
              <h3 className="text-3xl font-bold font-display mt-2 tracking-tight text-emerald-400">
                {formatVND(stats.income)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-300 bg-emerald-500/5 py-1.5 px-3 rounded-lg w-max border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
            {t('dashboard.incomeDesc')}
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-rose-500/10 pointer-events-none">
            <TrendingDown size={160} />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">{t('dashboard.expense')}</p>
              <h3 className="text-3xl font-bold font-display mt-2 tracking-tight text-rose-400">
                {formatVND(stats.expenses)}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-rose-300 bg-rose-500/5 py-1.5 px-3 rounded-lg w-max border border-rose-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2"></span>
            {t('dashboard.expenseDesc')}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Trend Area Chart (60% width on desktop) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="text-indigo-400" size={18} />
              <h4 className="font-semibold text-gray-200">{t('dashboard.trendTitle')}</h4>
            </div>
            <span className="text-xs text-gray-400">{t('dashboard.trendSubtitle')}</span>
          </div>

          <div className="w-full flex-grow flex items-center justify-center min-h-[180px]">
            {trendData.length >= 2 ? (
              <div className="w-full relative">
                <svg className="w-full h-auto" viewBox="0 0 500 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="20" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4"/>
                  <line x1="20" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4"/>
                  <line x1="20" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.05)"/>

                  {/* Shaded Area */}
                  <path d={svgChartPath.area} fill="url(#areaGradient)" />

                  {/* Trend Line */}
                  <path d={svgChartPath.line} stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />

                  {/* Interaction Dots */}
                  {svgChartPath.coords?.map((point, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={point.x} cy={point.y} r="5" fill="#030712" stroke="#6366f1" strokeWidth="2" />
                      <circle cx={point.x} cy={point.y} r="8" fill="#6366f1" className="opacity-0 group-hover:opacity-30 transition-opacity" />
                    </g>
                  ))}
                </svg>
                {/* Labels under SVG */}
                <div className="flex justify-between px-3 mt-2">
                  {trendData.map((d, idx) => (
                    <span key={idx} className="text-[10px] text-gray-400 font-medium text-center truncate max-w-[55px]" title={d.label}>
                      {d.date}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-12 flex flex-col items-center">
                <Activity size={32} className="text-gray-600 mb-2" />
                {t('dashboard.trendPlaceholder')}
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown (40% width on desktop) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center space-x-2 mb-4">
            <PieIcon className="text-rose-400" size={18} />
            <h4 className="font-semibold text-gray-200">{t('dashboard.breakdownTitle')}</h4>
          </div>

          {categoryStats.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center sm:justify-around space-y-4 sm:space-y-0 flex-grow">
              {/* Circular SVG Donut */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  
                  {categoryStats.map((item, idx) => {
                    const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
                    const strokeDashoffset = 100 - item.startPercent + 25; // 25 to adjust offset for starting at top
                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="3.2"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400">{t('dashboard.totalSpent')}</span>
                  <span className="text-sm font-bold font-display text-gray-200">
                    {categoryStats.reduce((sum, item) => sum + item.amount, 0) > 1000000 
                      ? `${(categoryStats.reduce((sum, item) => sum + item.amount, 0) / 1000000).toFixed(1)}M`
                      : formatVND(categoryStats.reduce((sum, item) => sum + item.amount, 0)).replace('VND', '').replace('₫', '')
                    }
                  </span>
                </div>
              </div>

              {/* Legends list */}
              <div className="space-y-2 w-full sm:w-auto max-h-[140px] overflow-y-auto pr-1">
                {categoryStats.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-300 font-medium">{t('categories.' + item.category)}</span>
                    </div>
                    <span className="text-gray-400 font-bold font-display">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm py-12 flex flex-col items-center flex-grow justify-center">
              <PieIcon size={32} className="text-gray-600 mb-2" />
              {t('dashboard.breakdownPlaceholder')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

