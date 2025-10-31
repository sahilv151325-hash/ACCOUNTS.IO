import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Transaction {
  id?: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense' | 'Asset' | 'Liability';
  created_at?: string;
}

export interface JournalEntry {
  date: string;
  debit: string;
  credit: string;
  amount: number;
  narration: string;
}

export interface Ledger {
  [accountName: string]: {
    debit: number;
    credit: number;
    balance: number;
  };
}

export interface TrialBalance {
  total_debit: number;
  total_credit: number;
  status: string;
}

export interface ProfitAndLoss {
  income: number;
  expense: number;
  net_profit: number;
}

export interface AccountingOutput {
  journals: JournalEntry[];
  ledgers: Ledger;
  trial_balance: TrialBalance;
  p_and_l: ProfitAndLoss;
}
