import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import BudgetOverview from '@/components/BudgetOverview';
import AccountCards from '@/components/AccountCards';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import { Transaction} from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgetCategories } from '@/hooks/useBudgetCategories';
import LoadingScreen from '@/components/LoadingScreen';
import AuthScreen from '@/components/AuthScreen';
import SettingsScreen from '@/components/SettingsScreen';
import NotFoundScreen from './+not-found';
import GiveTakeScreen from '@/components/GiveTakeScreen';
import FloatingGiveTakeButton from '@/components/FloatingGiveTakeButton';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  
  const { user, loading: authLoading } = useAuth();  
  const { accounts, updateAccountBalance } = useAccounts();
   const { transactions, addTransaction: addTransactionToDb, updateTransaction, deleteTransaction } = useTransactions();
  const { budgetCategories, updateBudgetCategorySpent } = useBudgetCategories();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showGiveTakeScreen, setShowGiveTakeScreen] = useState(false);

  // Show loading screen while authenticating
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    // Add transaction to database
    const { error: transactionError } = await addTransactionToDb(transaction);
    if (transactionError) {
      console.error('Failed to add transaction:', transactionError);
      return;
    }

    // Update account balance
    const account = accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const newBalance = account.balance + transaction.amount;
      await updateAccountBalance(transaction.accountId, newBalance);
    }

    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      await updateBudgetCategorySpent(transaction.category, Math.abs(transaction.amount));
    }

    // Close the form after successful submission
    setShowTransactionForm(false);
  };
  const handleUpdateTransaction = async (transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    const { error } = await updateTransaction(transactionId, updates);
    return { error };
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const { error } = await deleteTransaction(transactionId);
    return { error };
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions}
            accounts={accounts}
            budgetCategories={budgetCategories}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions}
            accounts={accounts}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'budget':
        return (
          <BudgetOverview
            budgetCategories={budgetCategories}
            transactions={transactions}
          />
        );
      case 'accounts':
        return (
          <AccountCards
            accounts={accounts}
            onUpdateBalance={updateAccountBalance}
          />
        );
      case 'settings':
        return <SettingsScreen />;
      case 'give-take':
        return <GiveTakeScreen />;
      default:
        return <NotFoundScreen/>;
    }
  };

  // If Give/Take screen is active, show it instead of the main content
  if (showGiveTakeScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.giveTakeHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowGiveTakeScreen(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        <GiveTakeScreen />
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header onAddTransaction={() => setShowTransactionForm(true)} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <View style={styles.content}>
        {renderContent()}
      </View>
        {/* Floating Give/Take Button */}
      <FloatingGiveTakeButton onPress={() => setShowGiveTakeScreen(true)} />
      {showTransactionForm && (
        <TransactionForm
          accounts={accounts}
          onSubmit={addTransaction}
          onClose={() => setShowTransactionForm(false)}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  giveTakeHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});