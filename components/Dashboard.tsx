import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Transaction, Account, BudgetCategory } from '@/types';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  budgetCategories: BudgetCategory[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, budgetCategories }) => {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
  });
  
  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const SummaryCard = ({ title, amount, icon, color, gradientColors }: {
    title: string;
    amount: string;
    icon: string;
    color: string;
    gradientColors: string[];
  }) => (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <LinearGradient colors={gradientColors} style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="white" />
        </LinearGradient>
      </View>
      <Text style={[styles.cardAmount, { color }]}>{amount}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Total Balance"
          amount={formatCurrency(totalBalance)}
          icon="wallet"
          color="#1E293B"
          gradientColors={['#10B981', '#059669']}
        />
        <SummaryCard
          title="Monthly Income"
          amount={formatCurrency(monthlyIncome)}
          icon="trending-up"
          color="#10B981"
          gradientColors={['#10B981', '#059669']}
        />
        <SummaryCard
          title="Monthly Expenses"
          amount={formatCurrency(monthlyExpenses)}
          icon="trending-down"
          color="#EF4444"
          gradientColors={['#EF4444', '#DC2626']}
        />
        <SummaryCard
          title="Budget Used"
          amount={`${((totalSpent / totalBudgeted) * 100).toFixed(0)}%`}
          icon="target"
          color="#3B82F6"
          gradientColors={['#3B82F6', '#2563EB']}
        />
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Ionicons name="pulse" size={20} color="#64748B" />
        </View>
        <View style={styles.transactionsList}>
          {transactions.slice(0, 5).map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'income' ? '#DCFCE7' : '#FEE2E2' }
                ]}>
                  <Ionicons
                    name={transaction.type === 'income' ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={transaction.type === 'income' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Budget Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Overview</Text>
          <Ionicons name="target" size={20} color="#64748B" />
        </View>
        <View style={styles.budgetList}>
          {budgetCategories.map(category => {
            const percentage = (category.spent / category.budgeted) * 100;
            return (
              <View key={category.id} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetName}>{category.name}</Text>
                  <Text style={styles.budgetAmount}>
                    {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: category.color
                      }
                    ]}
                  />
                </View>
                <Text style={styles.budgetPercentage}>{percentage.toFixed(1)}% used</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748B',
  },
  budgetList: {
    gap: 16,
  },
  budgetItem: {
    gap: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  budgetAmount: {
    fontSize: 12,
    color: '#64748B',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetPercentage: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
});

export default Dashboard;