import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
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

export default function App() {
  
  const { user, loading: authLoading } = useAuth();  
  const { accounts, updateAccountBalance } = useAccounts();
  const { transactions, addTransaction: addTransactionToDb } = useTransactions();
  const { budgetCategories, updateBudgetCategorySpent } = useBudgetCategories();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Show loading screen while authenticating
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  console.log(accounts);
  


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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            accounts={accounts}
            budgetCategories={budgetCategories}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            accounts={accounts}
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
      default:
        return <NotFoundScreen/>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header onAddTransaction={() => setShowTransactionForm(true)} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <View style={styles.content}>
        {renderContent()}
      </View>
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
});