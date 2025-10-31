import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

export interface ParsedJournalEntry {
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
}

interface TransactionParserProps {
  onParsed: (entries: ParsedJournalEntry[], summary: string) => void;
}

export default function TransactionParser({ onParsed }: TransactionParserProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) {
      alert('Please paste transaction data first!');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-transactions`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse transactions');
      }

      const { journals, summary } = await response.json();
      onParsed(journals, summary);
      setText('');
    } catch (error) {
      console.error('Error parsing transactions:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse transactions');
    } finally {
      setLoading(false);
    }
  };

  const copyExample = () => {
    const example = `01 Oct - Sold goods 15000
02 Oct - Paid rent 5000
03 Oct - Bought furniture 3000`;
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
        <Sparkles size={20} className="text-yellow-500" />
        THUNDER JOURNAL AI
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Paste unstructured transaction data and AI will create proper journal entries
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste Transaction Data
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Example:
01 Oct - Sold goods 15000
02 Oct - Paid rent 5000
03 Oct - Bought furniture 3000"
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleParse}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles size={18} />
          {loading ? 'Parsing...' : 'Parse with AI'}
        </button>

        <button
          onClick={copyExample}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Example'}
        </button>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>Format tips:</strong> Date - Description Amount (e.g., "01 Oct - Sold goods 15000")
      </div>
    </div>
  );
}
