import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GiveTake } from '@/types';
import { useAuth } from './useAuth';

export function useGiveTake() {
  const [giveTakeRecords, setGiveTakeRecords] = useState<GiveTake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchGiveTakeRecords = async () => {
    if (!user) {
      setGiveTakeRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('give_take')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedRecords: GiveTake[] = data.map(record => ({
        id: record.id,
        name: record.name,
        amount: Number(record.amount),
        date: new Date(record.date),
        type: record.type as 'give' | 'take',
        status: record.status as 'pending' | 'settled',
        description: record.description || '',
      }));

      setGiveTakeRecords(formattedRecords);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch give/take records');
      setGiveTakeRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const addGiveTakeRecord = async (record: Omit<GiveTake, 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('give_take')
        .insert({
          user_id: user.id,
          name: record.name,
          amount: record.amount,
          date: record.date.toISOString().split('T')[0],
          type: record.type,
          status: record.status,
          description: record.description,
        })
        .select()
        .single();

      if (error) throw error;

      const newRecord: GiveTake = {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        date: new Date(data.date),
        type: data.type as 'give' | 'take',
        status: data.status as 'pending' | 'settled',
        description: data.description || '',
      };

      setGiveTakeRecords(prev => [newRecord, ...prev]);
      return { data: newRecord, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add give/take record';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateGiveTakeRecord = async (recordId: string, updates: Partial<Omit<GiveTake, 'id'>>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('give_take')
        .update(updateData)
        .eq('id', recordId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedRecord: GiveTake = {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        date: new Date(data.date),
        type: data.type as 'give' | 'take',
        status: data.status as 'pending' | 'settled',
        description: data.description || '',
      };

      setGiveTakeRecords(prev => prev.map(r => 
        r.id === recordId ? updatedRecord : r
      ));

      return { data: updatedRecord, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update give/take record';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteGiveTakeRecord = async (recordId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('give_take')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGiveTakeRecords(prev => prev.filter(r => r.id !== recordId));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete give/take record';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const markAsSettled = async (recordId: string) => {
    return updateGiveTakeRecord(recordId, { status: 'settled' });
  };

  useEffect(() => {
    fetchGiveTakeRecords();
  }, [user]);

  return {
    giveTakeRecords,
    loading,
    error,
    fetchGiveTakeRecords,
    addGiveTakeRecord,
    updateGiveTakeRecord,
    deleteGiveTakeRecord,
    markAsSettled,
  };
}