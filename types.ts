export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

export interface GiveTake {
  id: string;
  name: string;
  amount: number;
  date: Date;
  type: 'give' | 'take';
  status: 'pending' | 'settled';
  description: string;
}