import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: user?.email || '',
  });
console.log(user?.email);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(prev => ({
          ...prev,
          full_name: data.full_name || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async () => {
    if (!user || profile.email === user.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: profile.email,
      });

      if (error) throw error;

      Alert.alert(
        'Email Update',
        'Please check your new email address for a confirmation link to complete the update.'
      );
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', 'Failed to update email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = () => {
    Alert.prompt(
      'Update Password',
      'Enter your new password:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newPassword) => {
            if (!newPassword || newPassword.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters long');
              return;
            }

            setLoading(true);
            try {
              const { error } = await supabase.auth.updateUser({
                password: newPassword,
              });

              if (error) throw error;

              Alert.alert('Success', 'Password updated successfully!');
            } catch (error) {
              console.error('Error updating password:', error);
              Alert.alert('Error', 'Failed to update password. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleSignOut = async () => {
    await signOut(); 
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#64748B" />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#10B981', '#3B82F6']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profile.full_name}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={user?.email}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={updateProfile} disabled={loading}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={[styles.updateButton, loading && styles.disabledButton]}
                >
                  <Text style={styles.updateButtonText}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {profile.email !== user?.email && (
                <TouchableOpacity onPress={updateEmail} disabled={loading}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={[styles.updateButton, loading && styles.disabledButton]}
                  >
                    <Text style={styles.updateButtonText}>Update Email</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="lock-closed"
              title="Change Password"
              subtitle="Update your account password"
              onPress={updatePassword}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="notifications"
              title="Notifications"
              subtitle="Configure notification preferences"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="color-palette"
              title="Theme"
              subtitle="Light mode"
              onPress={() => Alert.alert('Coming Soon', 'Dark mode will be available soon!')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="globe"
              title="Currency"
              subtitle="USD ($)"
              onPress={() => Alert.alert('Coming Soon', 'Multiple currencies will be available soon!')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => Alert.alert('Help', 'For support, please contact us at support@moneywise.app')}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleSignOut}>
            <View style={styles.signOutButton}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  inputGroup: {
    marginBottom: 16,
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
    gap: 12,
    marginTop: 8,
  },
  updateButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 68,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default SettingsScreen;