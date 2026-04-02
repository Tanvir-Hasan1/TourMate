import { Trip, Member, Expense, Split } from '../store/types';

export interface Transaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export const calculateSettlements = (trip: Trip): Transaction[] => {
  const balances: Record<string, number> = {};

  // Initialize balances for physical members
  trip.members.forEach((m) => {
    balances[m.id] = 0;
  });
  
  // Track Group Fund separately based on deposits
  balances['group_fund'] = 0;

  // Process Deposits
  const deposits = trip.deposits || [];
  deposits.forEach((dep) => {
    balances[dep.memberId] = (balances[dep.memberId] || 0) + dep.amount;
    balances['group_fund'] -= dep.amount; // Fund takes cash, it becomes debt
  });

  // Calculate net balances: Paid - Shared
  trip.expenses.forEach((expense) => {
    // Add paid amount to the payer's balance (group_fund or member)
    balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.amount;

    // Subtract each member's share from their balance
    expense.splits.forEach((split) => {
      balances[split.memberId] = (balances[split.memberId] || 0) - split.amount;
    });
  });

  // Separate debtors and creditors
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, balance]) => {
    if (balance < -0.01) {
      debtors.push({ id, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id, amount: balance });
    }
  });

  const transactions: Transaction[] = [];

  // Sort to optimize transactions (optional, greedy approach)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    const p1Name = debtor.id === 'group_fund' ? 'Group Fund' : trip.members.find((m) => m.id === debtor.id)?.name || 'Unknown';
    const p2Name = creditor.id === 'group_fund' ? 'Group Fund' : trip.members.find((m) => m.id === creditor.id)?.name || 'Unknown';

    transactions.push({
      from: debtor.id,
      fromName: p1Name,
      to: creditor.id,
      toName: p2Name,
      amount: Number(amount.toFixed(2)),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
};

export const getMemberBalance = (trip: Trip, memberId: string): number => {
  let balance = 0;
  
  const deposits = trip.deposits || [];
  deposits.forEach((dep) => {
    if (dep.memberId === memberId) balance += dep.amount;
  });

  trip.expenses.forEach((expense) => {
    if (expense.paidById === memberId) {
      balance += expense.amount;
    }
    const split = expense.splits.find((s) => s.memberId === memberId);
    if (split) {
      balance -= split.amount;
    }
  });
  return Number(balance.toFixed(2));
};

export const getTotalSpent = (trip: Trip): number => {
  return trip.expenses.reduce((sum, e) => sum + e.amount, 0);
};

export const getFundBalance = (trip: Trip): number => {
  const totalDeposits = (trip.deposits || []).reduce((sum, d) => sum + d.amount, 0);
  const fundSpent = trip.expenses
    .filter(e => e.paidById === 'group_fund')
    .reduce((sum, e) => sum + e.amount, 0);
  return totalDeposits - fundSpent;
};

export const getMemberContribution = (trip: Trip, memberId: string): { total: number, direct: number, fund: number } => {
  const direct = trip.expenses
    .filter((e) => e.paidById === memberId)
    .reduce((sum, e) => sum + e.amount, 0);
    
  const fund = (trip.deposits || [])
    .filter((d) => d.memberId === memberId)
    .reduce((sum, d) => sum + d.amount, 0);
    
  return {
    total: direct + fund,
    direct,
    fund
  };
};
