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
import { useCategories, Category } from '@/hooks/useCategories';

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ visible, onClose }) => {
  const { categories, addCategory, deleteCategory, getCategoriesByType } = useCategories();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await addCategory(newCategoryName.trim(), activeTab);
      if (error) {
        Alert.alert('Error', error);
      } else {
        setNewCategoryName('');
        Alert.alert('Success', 'Category added successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteCategory(category.id);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Category deleted successfully!');
            }
          },
        },
      ]
    );
  };

  const TabButton = ({ type, label }: { type: 'expense' | 'income'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === type && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(type)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === type && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const currentCategories = getCategoriesByType(activeTab);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Categories</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TabButton type="expense" label="Expense Categories" />
          <TabButton type="income" label="Income Categories" />
        </View>

        {/* Add New Category */}
        <View style={styles.addSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="add-circle" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder={`Add new ${activeTab} category`}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <TouchableOpacity onPress={handleAddCategory} disabled={loading}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={[styles.addButton, loading && styles.disabledButton]}
            >
              <Text style={styles.addButtonText}>
                {loading ? 'Adding...' : 'Add'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
          {currentCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open" size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>
                No {activeTab} categories yet
              </Text>
            </View>
          ) : (
            currentCategories.map(category => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[
                    styles.categoryIcon,
                    { backgroundColor: activeTab === 'income' ? '#DCFCE7' : '#FEE2E2' }
                  ]}>
                    <Ionicons
                      name={activeTab === 'income' ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={activeTab === 'income' ? '#10B981' : '#EF4444'}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#1E293B',
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesList: {
    flex: 1,
    paddingHorizontal: 16,
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
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryManager;