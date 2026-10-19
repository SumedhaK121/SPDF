/**
 * FormInput Component
 * Styled for editable fields:
 * - Cream background (#FFFCF9)
 * - Bold label above input
 * - Red asterisk for required fields
 * - Clear error message display
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, typography, layout, spacing } from '../theme';

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  keyboardType = 'default',
  editable = true,
  maxLength,
  suffix,
  style,
  inputStyle,
  ...rest
}) {
  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputWrapperError : null,
          !editable ? styles.inputWrapperDisabled : null,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#888888"
          keyboardType={keyboardType}
          editable={editable}
          maxLength={maxLength}
          {...rest}
        />
        {suffix ? <Text style={styles.suffixText}>{suffix}</Text> : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
  },
  requiredStar: {
    color: colors.required,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.inputEditable, // Cream #FFFCF9
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
  },
  inputWrapperError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.inputReadOnly,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: '#000000',
    paddingVertical: spacing.xs,
  },
  suffixText: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semiBold,
    marginLeft: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.tiny,
    color: colors.error,
    marginTop: spacing.xs / 2,
    fontWeight: typography.fontWeight.medium,
  },
});
