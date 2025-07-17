import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GiveTake } from '../types';
import { useGiveTake } from '../hooks/useGiveTake';
import GiveTakeForm from './GiveTakeForm';

const GiveTakeScreen: React.FC = () => {
  const { giveTakeRecords, addGiveTakeRecord, markAsSettled, deleteGiveTakeRecord } = useGiveTake();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'give' | 'take'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'settled'>('all');

  const filteredRecords = giveTakeRecords.filter(record => {
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const totalGiven = giveTakeRecords
    .filter(r => r.type === 'give' && r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalTaken = giveTakeRecords
    .filter(r => r.type === 'take' && r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleAddRecord = async (record: Omit<GiveTake, 'id'>) => {
    const { error } = await addGiveTakeRecord(record);
    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert('Success', 'Record added successfully!');
      setShowForm(false);
    }
  };

  const handleMarkAsSettled = async (record: GiveTake) => {
    Alert.alert(
      'Mark as Settled',
      `Mark "${record.name}" as settled?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settle',
          onPress: async () => {
            const { error } = await markAsSettled(record.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Record marked as settled!');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRecord = async (record: GiveTake) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteGiveTakeRecord(record.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Record deleted successfully!');
            }
          },
        },
      ]
    );
  };

  const FilterButton = ({ 
    type, 
    label, 
    isActive, 
    onPress 
  }: { 
    type: string; 
    label: string; 
    isActive: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isActive && styles.activeFilterButton
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        isActive && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Give & Take</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Money Given</Text>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.summaryIcon}>
              <Ionicons name="arrow-up" size={16} color="white" />
            </LinearGradient>
          </View>
          <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
            {formatCurrency(totalGiven)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Money Taken</Text>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryIcon}>
              <Ionicons name="arrow-down" size={16} color="white" />
            </LinearGradient>
          </View>
          <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
            {formatCurrency(totalTaken)}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <FilterButton
            type="all"
            label="All"
            isActive={filterType === 'all'}
            onPress={() => setFilterType('all')}
          />
          <FilterButton
            type="give"
            label="Given"
            isActive={filterType === 'give'}
            onPress={() => setFilterType('give')}
          />
          <FilterButton
            type="take"
            label="Taken"
            isActive={filterType === 'take'}
            onPress={() => setFilterType('take')}
          />
          <FilterButton
            type="pending"
            label="Pending"
            isActive={filterStatus === 'pending'}
            onPress={() => setFilterStatus('pending')}
          />
          <FilterButton
            type="settled"
            label="Settled"
            isActive={filterStatus === 'settled'}
            onPress={() => setFilterStatus('settled')}
          />
        </ScrollView>
      </View>

      {/* Records List */}
      <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyStateText}>No records found</Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} style={styles.recordItem}>
              <View style={styles.recordLeft}>
                <View style={[
                  styles.recordIcon,
                  { backgroundColor: record.type === 'give' ? '#FEE2E2' : '#DCFCE7' }
                ]}>
                  <Ionicons
                    name={record.type === 'give' ? 'arrow-up' : 'arrow-down'}
                    size={20}
                    color={record.type === 'give' ? '#EF4444' : '#10B981'}
                  />
                </View>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordName}>{record.name}</Text>
                  <View style={styles.recordMeta}>
                    <Text style={styles.recordType}>
                      {record.type === 'give' ? 'Money Given' : 'Money Taken'}
                    </Text>
                    <Text style={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                  </View>
                  {record.description && (
                    <Text style={styles.recordDescription}>{record.description}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.recordRight}>
                <Text style={[
                  styles.recordAmount,
                  { color: record.type === 'give' ? '#EF4444' : '#10B981' }
                ]}>
                  {formatCurrency(record.amount)}
                </Text>
                
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: record.status === 'pending' ? '#FEF3C7' : '#D1FAE5' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: record.status === 'pending' ? '#D97706' : '#059669' }
                  ]}>
                    {record.status === 'pending' ? 'Pending' : 'Settled'}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  {record.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.settleButton}
                      onPress={() => handleMarkAsSettled(record)}
                    >
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRecord(record)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Record Form */}
      <GiveTakeForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddRecord}
      />
    </View>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  summaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
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
  recordsList: {
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
  recordItem: {
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
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordDetails: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  recordType: {
    fontSize: 12,
    color: '#64748B',
  },
  recordDate: {
    fontSize: 12,
    color: '#64748B',
  },
  recordDescription: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
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

export default GiveTakeScreen;