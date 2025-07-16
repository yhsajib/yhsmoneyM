import React from 'react';
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Account } from '@/types';
import AccountBalanceModal from '@/components/AccountBalanceModal';

interface AccountCardsProps {
  accounts: Account[];
  onUpdateBalance: (accountId: string, newBalance: number) => Promise<void>;
}

const AccountCards: React.FC<AccountCardsProps> = ({ accounts, onUpdateBalance }) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return 'wallet';
      case 'savings':
        return 'library';
      case 'credit':
        return 'card';
      default:
        return 'wallet';
    }
  };

  const getAccountGradient = (type: string) => {
    switch (type) {
      case 'checking':
        return ['#3B82F6', '#2563EB'];
      case 'savings':
        return ['#10B981', '#059669'];
      case 'credit':
        return ['#8B5CF6', '#7C3AED'];
      default:
        return ['#64748B', '#475569'];
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const handleEditBalance = (account: Account) => {
    setSelectedAccount(account);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAccount(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Accounts Overview</Text>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>{formatCurrency(totalBalance)}</Text>
          </View>
        </View>
      </View>

      {/* Account Cards */}
      <View style={styles.cardsContainer}>
        {accounts.map(account => (
          <View key={account.id} style={styles.accountCard}>
            {/* Card Header */}
            <LinearGradient
              colors={getAccountGradient(account.type)}
              style={styles.cardHeader}
            >
              <View style={styles.cardHeaderContent}>
                <View>
                  <Text style={styles.accountType}>{account.type.toUpperCase()} ACCOUNT</Text>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <Ionicons name={getAccountIcon(account.type) as any} size={24} color="white" />
                </View>
              </View>
              
              {/* Background Pattern */}
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
            </LinearGradient>

            {/* Card Content */}
            <View style={styles.cardContent}>
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={[
                    styles.balanceAmount,
                    { color: account.balance >= 0 ? '#1E293B' : '#EF4444' }
                  ]}>
                    {formatCurrency(account.balance)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditBalance(account)}
                  >
                    <Ionicons name="pencil" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.statusContainer}>
                  <Ionicons
                    name={account.balance >= 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={account.balance >= 0 ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[
                    styles.statusText,
                    { color: account.balance >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {account.balance >= 0 ? 'Active' : 'Overdrawn'}
                  </Text>
                </View>
              </View>

              {/* Account Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Type:</Text>
                  <Text style={styles.detailValue}>{account.type.charAt(0).toUpperCase() + account.type.slice(1)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Currency:</Text>
                  <Text style={styles.detailValue}>{account.currency}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsSection}>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Transfer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Account Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Account Summary</Text>
        <View style={styles.summaryGrid}>
          {[
            { type: 'checking', label: 'Checking Accounts' },
            { type: 'savings', label: 'Savings Accounts' },
            { type: 'credit', label: 'Credit Cards' }
          ].map(({ type, label }) => {
            const typeAccounts = accounts.filter(a => a.type === type);
            const typeBalance = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
            
            return (
              <View key={type} style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  {typeAccounts.length > 0 && (
                    <TouchableOpacity 
                      style={styles.summaryEditButton}
                      onPress={() => {
                        // For summary cards, we'll edit the first account of this type
                        const firstAccount = typeAccounts[0];
                        if (firstAccount) handleEditBalance(firstAccount);
                      }}
                    >
                      <Ionicons name="pencil" size={14} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.summaryAmount}>
                  {formatCurrency(typeBalance)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Balance Update Modal */}
      {selectedAccount && (
        <AccountBalanceModal
          account={selectedAccount}
          visible={modalVisible}
          onClose={handleCloseModal}
          onUpdate={onUpdateBalance}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
  },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  accountType: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 60,
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
  },
  cardContent: {
    padding: 20,
  },
  balanceSection: {
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 20,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  summarySection: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  summaryEditButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
});

export default AccountCards;