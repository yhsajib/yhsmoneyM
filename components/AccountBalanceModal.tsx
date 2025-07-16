import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Account } from '@/types';

interface AccountBalanceModalProps {
  account: Account;
  visible: boolean;
  onClose: () => void;
  onUpdate: (accountId: string, newBalance: number) => Promise<void>;
}

const AccountBalanceModal: React.FC<AccountBalanceModalProps> = ({
  account,
  visible,
  onClose,
  onUpdate,
}) => {
  const [balance, setBalance] = useState(account.balance.toString());
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    const newBalance = parseFloat(balance);
    
    if (isNaN(newBalance)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(account.id, newBalance);
      Alert.alert('Success', 'Account balance updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update account balance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Account Balance</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>
                {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account
              </Text>
              <Text style={styles.currentBalance}>
                Current Balance: {formatCurrency(account.balance)}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Balance</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  selectTextOnFocus
                />
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleUpdate} disabled={loading}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={[styles.updateButton, loading && styles.disabledButton]}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? 'Updating...' : 'Update Balance'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
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
  content: {
    padding: 20,
  },
  accountInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  currentBalance: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  inputGroup: {
    marginBottom: 24,
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
    backgroundColor: '#F8FAFC',
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
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});

export default AccountBalanceModal;