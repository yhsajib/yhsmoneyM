import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Account } from '../types';
import TransactionEditModal from '@/components/modal/TransactionEditModal';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onUpdateTransaction: (transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<{ error: string | null }>;
  onDeleteTransaction: (transactionId: string) => Promise<{ error: string | null }>;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  accounts, 
  onUpdateTransaction, 
  onDeleteTransaction 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(account => account.id === accountId)?.name || 'Unknown Account';
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await onDeleteTransaction(transaction.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Transaction deleted successfully!');
            }
          },
        },
      ]
    );
  };

  const FilterButton = ({ type, label }: { type: 'all' | 'income' | 'expense'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.activeFilterButton
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filterType === type && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <FilterButton type="all" label="All" />
          <FilterButton type="income" label="Income" />
          <FilterButton type="expense" label="Expense" />
        </ScrollView>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyStateText}>No transactions found</Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'income' ? '#DCFCE7' : '#FEE2E2' }
                ]}>
                  <Ionicons
                    name={transaction.type === 'income' ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={transaction.type === 'income' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.transactionAccount}>
                      {getAccountName(transaction.accountId)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditingTransaction(transaction)}
                  >
                    <Ionicons name="pencil" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTransaction(transaction)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          accounts={accounts}
          visible={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdate={onUpdateTransaction}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  transactionsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionAccount: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionList;