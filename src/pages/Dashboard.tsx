import { useState, useEffect } from 'react';
import { Zap, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import ReportViewer from '../components/ReportViewer';
import { supabase, Transaction, AccountingOutput } from '../lib/supabase';

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountingData, setAccountingData] = useState<AccountingOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAccounts = async () => {
    if (transactions.length === 0) {
      alert('Please add at least one transaction first!');
      return;
    }

    setGenerating(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-accounts`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions })
      });

      if (!response.ok) {
        throw new Error('Failed to generate accounts');
      }

      const data = await response.json();
      setAccountingData(data);
    } catch (error) {
      console.error('Error generating accounts:', error);
      alert('Failed to generate accounting reports. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTransactions();
      setAccountingData(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL transactions? This cannot be undone!')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      loadTransactions();
      setAccountingData(null);
    } catch (error) {
      console.error('Error clearing transactions:', error);
      alert('Failed to clear transactions');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={32} className="text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">THUNDER ACCOUNTANT</h1>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
            <div className="text-3xl font-bold text-gray-800">{transactions.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gray-800">
              ${transactions.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="text-xl font-bold text-green-600">
              {accountingData ? 'Reports Generated' : 'Ready to Generate'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TransactionForm onTransactionAdded={loadTransactions} />

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              {transactions.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions yet. Add your first transaction above!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{transaction.description}</div>
                      <div className="text-sm text-gray-600">
                        {transaction.date} • {transaction.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-gray-800">
                        ${Number(transaction.amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id!)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={handleGenerateAccounts}
            disabled={generating || transactions.length === 0}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Sparkles size={24} />
            {generating ? 'Generating Accounts...' : 'Generate Accounting Reports'}
          </button>
        </div>

        <ReportViewer data={accountingData} />
      </main>
    </div>
  );
}
