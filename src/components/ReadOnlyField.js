/**
 * ReadOnlyField Component
 * Used for calculated and system fields:
 * - Unmistakable grey background (#DCE1E2)
 * - Bold label above field
 * - Border (#A4C2C5)
 * - Clear distinction from editable cream fields
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, layout, spacing } from '../theme';

export default function ReadOnlyField({
  label,
  value,
  suffix,
  style,
  valueStyle,
  highlight = false,
}) {
  const displayVal =
    value !== undefined && value !== null && value !== '' ? String(value) : '-';

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.fieldWrapper, highlight && styles.highlightWrapper]}>
        <Text style={[styles.valueText, valueStyle]} numberOfLines={1}>
          {displayVal}
          {suffix && displayVal !== '-' ? ` ${suffix}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
    marginBottom: spacing.xs,
  },
  fieldWrapper: {
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.inputReadOnly, // Grey #DCE1E2
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  highlightWrapper: {
    borderColor: colors.tableBorder,
  },
  valueText: {
    fontSize: typography.fontSize.body,
    color: '#222222',
    fontWeight: typography.fontWeight.semiBold,
  },
});
