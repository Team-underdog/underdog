import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export function Checkbox({ 
  checked, 
  onCheckedChange, 
  label, 
  disabled = false 
}: CheckboxProps) {
  return (
    <Pressable
      style={[styles.container, disabled ? styles.disabled : null]}
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
    >
      <View style={[styles.checkbox, checked ? styles.checkedCheckbox : null]}>
        {checked && (
          <Feather name="check" size={16} color="#fff" />
        )}
      </View>
      {label && (
        <Text style={[styles.label, disabled ? styles.disabledText : null]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkedCheckbox: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9ca3af',
  },
});
