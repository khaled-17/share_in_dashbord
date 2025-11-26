import React from 'react';
import { Card } from '../../components/ui';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'إجمالي المقبوضات',
      value: '125,000 ج.م',
      change: '+12.5%',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'إجمالي المصروفات',
      value: '87,500 ج.م',
      change: '+8.2%',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'red',
    },
    {
      title: 'الرصيد الحالي',
      value: '37,500 ج.م',
      change: '+15.3%',
      changeType: 'increase',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'عروض الأسعار',
      value: '24 عرض',
      change: '+3 جديد',
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
    },
  ];

  const recentTransactions = [
    { id: 1, type: 'قبض', description: 'دفعة من العميل أحمد محمد', amount: 15000, date: '2025-11-25' },
    { id: 2, type: 'صرف', description: 'شراء مواد خام', amount: -8500, date: '2025-11-24' },
    { id: 3, type: 'قبض', description: 'دفعة من العميل محمود علي', amount: 22000, date: '2025-11-23' },
    { id: 4, type: 'صرف', description: 'رواتب الموظفين', amount: -12000, date: '2025-11-22' },
    { id: 5, type: 'قبض', description: 'دفعة من العميل سارة أحمد', amount: 18000, date: '2025-11-21' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorClasses = {
            green: { border: 'bg-green-500', icon: 'bg-green-100 text-green-600' },
            red: { border: 'bg-red-500', icon: 'bg-red-100 text-red-600' },
            blue: { border: 'bg-blue-500', icon: 'bg-blue-100 text-blue-600' },
            purple: { border: 'bg-purple-500', icon: 'bg-purple-100 text-purple-600' },
          };
          const colors = colorClasses[stat.color as keyof typeof colorClasses];
          
          return (
            <Card key={index} hover className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${colors.border}`}></div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stat.changeType === 'increase' 
                      ? 'bg-green-100 text-green-700' 
                      : stat.changeType === 'decrease'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${colors.icon}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <Card title="آخر العمليات المالية" subtitle="عرض أحدث 5 عمليات">
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-6 h-6 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {transaction.amount > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-left">
                <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ar-EG')} ج.م
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  transaction.type === 'قبض' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {transaction.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="إجراءات سريعة">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-primary-700">سند قبض جديد</span>
            </div>
          </button>
          
          <button className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-primary-700">سند صرف جديد</span>
            </div>
          </button>
          
          <button className="p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-primary-700">عرض سعر جديد</span>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};
