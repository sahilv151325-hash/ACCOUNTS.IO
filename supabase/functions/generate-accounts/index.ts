import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Transaction {
  id?: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense' | 'Asset' | 'Liability';
}

interface JournalEntry {
  date: string;
  debit: string;
  credit: string;
  amount: number;
  narration: string;
}

interface Ledger {
  [accountName: string]: {
    debit: number;
    credit: number;
    balance: number;
  };
}

interface TrialBalance {
  total_debit: number;
  total_credit: number;
  status: string;
}

interface ProfitAndLoss {
  income: number;
  expense: number;
  net_profit: number;
}

interface AccountingOutput {
  journals: JournalEntry[];
  ledgers: Ledger;
  trial_balance: TrialBalance;
  p_and_l: ProfitAndLoss;
}

function generateAccounting(transactions: Transaction[]): AccountingOutput {
  const journals: JournalEntry[] = [];
  const ledgers: Ledger = {};
  let totalIncome = 0;
  let totalExpense = 0;

  const addToLedger = (account: string, debit: number, credit: number) => {
    if (!ledgers[account]) {
      ledgers[account] = { debit: 0, credit: 0, balance: 0 };
    }
    ledgers[account].debit += debit;
    ledgers[account].credit += credit;
    ledgers[account].balance = ledgers[account].debit - ledgers[account].credit;
  };

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount);
    let debitAccount = '';
    let creditAccount = '';

    switch (transaction.type) {
      case 'Income':
        debitAccount = 'Cash';
        creditAccount = 'Revenue';
        totalIncome += amount;
        break;
      case 'Expense':
        debitAccount = transaction.description.includes('rent') ? 'Rent Expense' :
                       transaction.description.includes('salary') ? 'Salary Expense' :
                       transaction.description.includes('utility') ? 'Utility Expense' :
                       'General Expense';
        creditAccount = 'Cash';
        totalExpense += amount;
        break;
      case 'Asset':
        debitAccount = transaction.description;
        creditAccount = 'Cash';
        break;
      case 'Liability':
        debitAccount = 'Cash';
        creditAccount = transaction.description;
        break;
    }

    journals.push({
      date: transaction.date,
      debit: debitAccount,
      credit: creditAccount,
      amount: amount,
      narration: transaction.description
    });

    addToLedger(debitAccount, amount, 0);
    addToLedger(creditAccount, 0, amount);
  });

  let totalDebit = 0;
  let totalCredit = 0;
  Object.values(ledgers).forEach(ledger => {
    totalDebit += ledger.debit;
    totalCredit += ledger.credit;
  });

  const trialBalance: TrialBalance = {
    total_debit: totalDebit,
    total_credit: totalCredit,
    status: Math.abs(totalDebit - totalCredit) < 0.01 ? 'Balanced' : 'Unbalanced'
  };

  const profitAndLoss: ProfitAndLoss = {
    income: totalIncome,
    expense: totalExpense,
    net_profit: totalIncome - totalExpense
  };

  return {
    journals,
    ledgers,
    trial_balance: trialBalance,
    p_and_l: profitAndLoss
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { transactions } = await req.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No transactions provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const accountingOutput = generateAccounting(transactions);

    return new Response(
      JSON.stringify(accountingOutput),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating accounts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate accounting reports' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});