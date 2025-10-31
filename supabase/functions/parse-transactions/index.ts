import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ParsedJournalEntry {
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  narration: string;
}

interface ParseResponse {
  journals: ParsedJournalEntry[];
  summary: string;
}

function parseTransactionText(text: string, currency: string = '₹'): ParseResponse {
  const lines = text.split('\n').filter(line => line.trim());
  const journals: ParsedJournalEntry[] = [];
  let totalAmount = 0;

  const patterns = [
    {
      regex: /^(\d+\s+\w+)\s*[-–]\s*(?:sold?|revenue|income)\s*([\d,.]+)/i,
      type: 'sale'
    },
    {
      regex: /^(\d+\s+\w+)\s*[-–]\s*(?:paid?|expense)\s*(?:rent|salary|utilities?|insurance)\s*([\d,.]+)/i,
      type: 'expense'
    },
    {
      regex: /^(\d+\s+\w+)\s*[-–]\s*(?:paid?|bought?|purchase)\s*([\w\s]+?)\s+([\d,.]+)/i,
      type: 'purchase'
    },
    {
      regex: /^(\d+\s+\w+)\s*[-–]\s*(?:received?|income)\s*([\d,.]+)/i,
      type: 'income'
    },
    {
      regex: /^(\d+\s+\w+)\s*[-–]\s*([\w\s]+?)\s+([\d,.]+)/i,
      type: 'generic'
    }
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let matched = false;
    const cleanAmount = (str: string) => parseFloat(str.replace(/[₹,]/g, ''));

    for (const pattern of patterns) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        let date = match[1]?.trim() || 'TBD';
        let amount = 0;
        let description = '';
        let debitAccount = '';
        let creditAccount = '';
        let narration = '';

        switch (pattern.type) {
          case 'sale':
            amount = cleanAmount(match[2]);
            debitAccount = 'Cash A/c';
            creditAccount = 'Sales A/c';
            narration = 'Being goods sold for cash';
            break;
          case 'expense':
            const expenseType = trimmed.match(/(?:rent|salary|utilities?|insurance)/i)?.[0] || 'expenses';
            const typeMap: Record<string, string> = {
              'rent': 'Rent Expense A/c',
              'salary': 'Salary Expense A/c',
              'utilities': 'Utilities Expense A/c',
              'utility': 'Utilities Expense A/c',
              'insurance': 'Insurance Expense A/c'
            };
            debitAccount = typeMap[expenseType.toLowerCase()] || 'General Expense A/c';
            amount = cleanAmount(match[2]);
            creditAccount = 'Cash A/c';
            narration = `Being ${expenseType.toLowerCase()} paid`;
            break;
          case 'purchase':
            date = match[1]?.trim() || 'TBD';
            description = match[2]?.trim() || 'assets';
            amount = cleanAmount(match[3]);
            const accountName = description.charAt(0).toUpperCase() + description.slice(1);
            debitAccount = `${accountName} A/c`;
            creditAccount = 'Cash A/c';
            narration = `Being ${description.toLowerCase()} purchased`;
            break;
          case 'income':
            amount = cleanAmount(match[2]);
            debitAccount = 'Cash A/c';
            creditAccount = 'Income A/c';
            narration = 'Being income received';
            break;
          case 'generic':
            date = match[1]?.trim() || 'TBD';
            description = match[2]?.trim() || 'transaction';
            amount = cleanAmount(match[3]);
            if (description.toLowerCase().includes('sold') || description.toLowerCase().includes('revenue')) {
              debitAccount = 'Cash A/c';
              creditAccount = 'Sales A/c';
              narration = 'Being goods sold for cash';
            } else if (description.toLowerCase().includes('purchased') || description.toLowerCase().includes('bought')) {
              debitAccount = `${description} A/c`;
              creditAccount = 'Cash A/c';
              narration = `Being ${description.toLowerCase()} purchased`;
            } else {
              debitAccount = 'Account A/c';
              creditAccount = 'Cash A/c';
              narration = `Being ${description.toLowerCase()} transaction`;
            }
            break;
        }

        if (amount > 0) {
          journals.push({
            date,
            debitAccount,
            creditAccount,
            amount,
            narration
          });
          totalAmount += amount;
          matched = true;
          break;
        }
      }
    }
  });

  const summary = `💡 Total of ${journals.length} transactions parsed successfully. All entries balanced.`;

  return { journals, summary };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, currency = '₹' } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No transaction text provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = parseTransactionText(text, currency);

    if (result.journals.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No transactions could be parsed from the input' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error parsing transactions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to parse transactions' }),
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