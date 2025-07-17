import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';
import { useAuth } from './useAuth';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedTransactions: Transaction[] = data.map(transaction => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: new Date(transaction.date),
        type: transaction.type as 'income' | 'expense',
        accountId: transaction.account_id,
      }));

      setTransactions(formattedTransactions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: transaction.accountId,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          date: transaction.date.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        date: new Date(data.date),
        type: data.type as 'income' | 'expense',
        accountId: data.account_id,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      return { data: newTransaction, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateTransaction = async (transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const updateData: any = {};
      
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.accountId !== undefined) updateData.account_id = updates.accountId;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTransaction: Transaction = {
        id: data.id,
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        date: new Date(data.date),
        type: data.type as 'income' | 'expense',
        accountId: data.account_id,
      };

      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? updatedTransaction : t
      ));

      return { data: updatedTransaction, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}