import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Account, Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';

interface TransactionEditModalProps {
  transaction: Transaction;
  accounts: Account[];
  visible: boolean;
  onClose: () => void;
  onUpdate: (transactionId: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<{ error: string | null }>;
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
  transaction,
  accounts,
  visible,
  onClose,
  onUpdate,
}) => {
  const { getCategoriesByType } = useCategories();
  const [formData, setFormData] = useState({
    amount: Math.abs(transaction.amount).toString(),
    description: transaction.description,
    category: transaction.category,
    date: transaction.date.toISOString().split('T')[0],
    type: transaction.type,
    accountId: transaction.accountId
  });
  const [loading, setLoading] = useState(false);

  const categories = getCategoriesByType(formData.type);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const adjustedAmount = formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    setLoading(true);
    try {
      const { error } = await onUpdate(transaction.id, {
        ...formData,
        amount: adjustedAmount,
        date: new Date(formData.date)
      });

      if (error) {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Success', 'Transaction updated successfully!');
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const TypeButton = ({ type, label }: { type: 'income' | 'expense'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        formData.type === type && styles.activeTypeButton
      ]}
      onPress={() => setFormData(prev => ({ ...prev, type, category: '' }))}
    >
      <Text style={[
        styles.typeButtonText,
        formData.type === type && styles.activeTypeButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Transaction</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Type Selection */}
          <View style={styles.typeContainer}>
            <TypeButton type="expense" label="Expense" />
            <TypeButton type="income" label="Income" />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="document-text" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.category === category.name && styles.activeCategoryButton
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: category.name }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category.name && styles.activeCategoryButtonText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Account */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {accounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.categoryButton,
                    formData.accountId === account.id && styles.activeCategoryButton
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, accountId: account.id }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    formData.accountId === account.id && styles.activeCategoryButtonText
                  ]}>
                    {account.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={[styles.submitButton, loading && styles.disabledButton]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Updating...' : 'Update Transaction'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTypeButtonText: {
    color: '#1E293B',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeCategoryButtonText: {
    color: 'white',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionEditModal;