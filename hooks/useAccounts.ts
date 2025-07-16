import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedAccounts: Account[] = data.map(account => ({
        id: account.id,
        name: account.name,
        type: account.type as 'checking' | 'savings' | 'credit',
        balance: Number(account.balance),
        currency: account.currency,
      }));

      setAccounts(formattedAccounts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        })
        .select()
        .single();

      if (error) throw error;

      const newAccount: Account = {
        id: data.id,
        name: data.name,
        type: data.type as 'checking' | 'savings' | 'credit',
        balance: Number(data.balance),
        currency: data.currency,
      };

      setAccounts(prev => [...prev, newAccount]);
      return { data: newAccount, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add account';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateAccountBalance = async (accountId: string, newBalance: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      setAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, balance: newBalance }
          : account
      ));

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update account balance';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    updateAccountBalance,
  };
}