import { useState } from 'react';
import { FileDown, BookOpen, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { AccountingOutput } from '../lib/supabase';

interface ReportViewerProps {
  data: AccountingOutput | null;
}

export default function ReportViewer({ data }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<'journals' | 'ledgers' | 'trial' | 'pl'>('journals');

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
        <Calculator size={48} className="mx-auto mb-4 text-gray-400" />
        <p>No accounting data generated yet.</p>
        <p className="text-sm mt-2">Add transactions and click "Generate Accounts" to see reports.</p>
      </div>
    );
  }

  const handleDownload = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'journals' as const, label: 'Journal Entries', icon: BookOpen },
    { id: 'ledgers' as const, label: 'Ledgers', icon: Calculator },
    { id: 'trial' as const, label: 'Trial Balance', icon: TrendingUp },
    { id: 'pl' as const, label: 'P&L Statement', icon: DollarSign }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Accounting Reports</h2>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors text-sm"
        >
          <FileDown size={18} />
          Download JSON
        </button>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {activeTab === 'journals' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Journal Entries</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Date</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Debit Account</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Credit Account</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-semibold">Amount</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Narration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.journals.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{entry.date}</td>
                      <td className="px-4 py-3">{entry.debit}</td>
                      <td className="px-4 py-3">{entry.credit}</td>
                      <td className="px-4 py-3 text-right font-mono">${entry.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.narration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ledgers' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Ledgers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.ledgers).map(([account, values]) => (
                <div key={account} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3">{account}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Debit:</span>
                      <span className="font-mono">${values.debit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Credit:</span>
                      <span className="font-mono">${values.credit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-800">Balance:</span>
                      <span className="font-mono font-semibold">${values.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trial' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Trial Balance</h3>
            <div className="max-w-md mx-auto">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>Particulars</span>
                    <span>Amount</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-700">Total Debit</span>
                    <span className="font-mono">${data.trial_balance.total_debit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-700">Total Credit</span>
                    <span className="font-mono">${data.trial_balance.total_credit.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between px-4 py-3 font-semibold ${
                    data.trial_balance.status === 'Balanced'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <span>Status</span>
                    <span>{data.trial_balance.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pl' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Profit & Loss Statement</h3>
            <div className="max-w-md mx-auto">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>Particulars</span>
                    <span>Amount</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-700">Total Income</span>
                    <span className="font-mono text-green-600">${data.p_and_l.income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-700">Total Expense</span>
                    <span className="font-mono text-red-600">${data.p_and_l.expense.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between px-4 py-3 font-semibold text-lg ${
                    data.p_and_l.net_profit >= 0
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <span>Net {data.p_and_l.net_profit >= 0 ? 'Profit' : 'Loss'}</span>
                    <span className="font-mono">${Math.abs(data.p_and_l.net_profit).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
