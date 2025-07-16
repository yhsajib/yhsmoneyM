import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BudgetCategory } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export function useBudgetCategories() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBudgetCategories = async () => {
    if (!user) {
      setBudgetCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedCategories: BudgetCategory[] = data.map(category => ({
        id: category.id,
        name: category.name,
        budgeted: Number(category.budgeted),
        spent: Number(category.spent),
        color: category.color,
      }));

      setBudgetCategories(formattedCategories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budget categories');
      setBudgetCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addBudgetCategory = async (category: Omit<BudgetCategory, 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .insert({
          user_id: user.id,
          name: category.name,
          budgeted: category.budgeted,
          spent: category.spent,
          color: category.color,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: BudgetCategory = {
        id: data.id,
        name: data.name,
        budgeted: Number(data.budgeted),
        spent: Number(data.spent),
        color: data.color,
      };

      setBudgetCategories(prev => [...prev, newCategory]);
      return { data: newCategory, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add budget category';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateBudgetCategorySpent = async (categoryName: string, additionalSpent: number) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const category = budgetCategories.find(c => c.name === categoryName);
      if (!category) return { error: 'Category not found' };

      const newSpent = category.spent + additionalSpent;

      const { error } = await supabase
        .from('budget_categories')
        .update({ spent: newSpent })
        .eq('id', category.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgetCategories(prev => prev.map(cat => 
        cat.id === category.id 
          ? { ...cat, spent: newSpent }
          : cat
      ));

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update budget category';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchBudgetCategories();
  }, [user]);

  return {
    budgetCategories,
    loading,
    error,
    fetchBudgetCategories,
    addBudgetCategory,
    updateBudgetCategorySpent,
  };
}