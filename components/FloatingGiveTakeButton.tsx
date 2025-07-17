import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface FloatingGiveTakeButtonProps {
  onPress: () => void;
}

const FloatingGiveTakeButton: React.FC<FloatingGiveTakeButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.button}
      >
        <Ionicons name="swap-horizontal" size={20} color="white" />
        <Text style={styles.text}>Give/Take</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 6,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FloatingGiveTakeButton;