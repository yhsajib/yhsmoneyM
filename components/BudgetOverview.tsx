import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BudgetCategory, Transaction } from '@/types';

interface BudgetOverviewProps {
  budgetCategories: BudgetCategory[];
  transactions: Transaction[];
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgetCategories, transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;

  const getBudgetStatus = (category: BudgetCategory) => {
    const percentage = (category.spent / category.budgeted) * 100;
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      default:
        return 'checkmark-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const SummaryCard = ({ title, amount, icon, gradientColors }: {
    title: string;
    amount: string;
    icon: string;
    gradientColors: string[];
  }) => (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <LinearGradient colors={gradientColors} style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="white" />
        </LinearGradient>
      </View>
      <Text style={styles.cardAmount}>{amount}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        <View style={styles.monthContainer}>
          <Ionicons name="calendar" size={16} color="#64748B" />
          <Text style={styles.monthText}>January 2025</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Total Budgeted"
          amount={formatCurrency(totalBudgeted)}
          icon="target"
          gradientColors={['#3B82F6', '#2563EB']}
        />
        <SummaryCard
          title="Total Spent"
          amount={formatCurrency(totalSpent)}
          icon="trending-up"
          gradientColors={['#EF4444', '#DC2626']}
        />
        <SummaryCard
          title="Remaining"
          amount={formatCurrency(remainingBudget)}
          icon={remainingBudget >= 0 ? 'checkmark-circle' : 'alert-circle'}
          gradientColors={remainingBudget >= 0 ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
        />
      </View>

      {/* Budget Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Budget Categories</Text>
        <View style={styles.categoriesList}>
          {budgetCategories.map(category => {
            const percentage = (category.spent / category.budgeted) * 100;
            const status = getBudgetStatus(category);
            const remaining = category.budgeted - category.spent;
            
            return (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[styles.categoryColor, { backgroundColor: category.color }]}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(status)}20` }
                    ]}>
                      <Ionicons
                        name={getStatusIcon(status) as any}
                        size={12}
                        color={getStatusColor(status)}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                        {status === 'exceeded' ? 'Over' : status === 'warning' ? 'Close' : 'Good'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.categoryDetails}>
                  <View style={styles.amountRow}>
                    <Text style={styles.spentText}>
                      Spent: {formatCurrency(category.spent)}
                    </Text>
                    <Text style={styles.budgetText}>
                      Budget: {formatCurrency(category.budgeted)}
                    </Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
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
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.percentageText}>{percentage.toFixed(1)}% used</Text>
                    <Text style={[
                      styles.remainingText,
                      { color: remaining >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {remaining >= 0 
                        ? `${formatCurrency(remaining)} remaining` 
                        : `${formatCurrency(Math.abs(remaining))} over`
                      }
                    </Text>
                  </View>
                </View>
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
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontSize: 14,
    color: '#64748B',
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
    width: '31%',
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
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  categoriesSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  categoryDetails: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    fontSize: 14,
    color: '#64748B',
  },
  budgetText: {
    fontSize: 14,
    color: '#64748B',
  },
  progressContainer: {
    marginVertical: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentageText: {
    fontSize: 12,
    color: '#64748B',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BudgetOverview;