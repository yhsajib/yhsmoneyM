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
import { GiveTake } from '../types';

interface GiveTakeFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<GiveTake, 'id'>) => void;
}

const GiveTakeForm: React.FC<GiveTakeFormProps> = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'give' as 'give' | 'take',
    description: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.amount) {
      Alert.alert('Error', 'Please fill in name and amount');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    onSubmit({
      ...formData,
      amount,
      date: new Date(formData.date),
      status: 'pending'
    });

    // Reset form
    setFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'give',
      description: ''
    });
  };

  const TypeButton = ({ type, label }: { type: 'give' | 'take'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        formData.type === type && styles.activeTypeButton
      ]}
      onPress={() => setFormData(prev => ({ ...prev, type }))}
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
          <Text style={styles.title}>Add Give/Take Record</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Type Selection */}
          <View style={styles.typeContainer}>
            <TypeButton type="give" label="Give (Lent Money)" />
            <TypeButton type="take" label="Take (Borrowed Money)" />
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Person's Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter person's name"
                placeholderTextColor="#94A3B8"
              />
            </View>
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

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="document-text" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSubmit}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Add Record</Text>
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
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GiveTakeForm;