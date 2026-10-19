/**
 * SelectionCard Component
 * Interactive cards for Branch and Supervisor lists.
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, layout, spacing } from '../theme';

export default function SelectionCard({
  title,
  subtitle,
  badgeText,
  isSelected = false,
  onPress,
  icon = 'chevron-forward',
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, isSelected && styles.cardSelected, style]}
    >
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isSelected && styles.titleSelected]} numberOfLines={1}>
            {title}
          </Text>
          {badgeText ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Ionicons
        name={isSelected ? 'checkmark-circle' : icon}
        size={22}
        color={isSelected ? colors.success : colors.link}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: layout.minTouchTarget + 8,
  },
  cardSelected: {
    backgroundColor: '#F0F9F8',
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: typography.fontSize.body + 1,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
  },
  titleSelected: {
    color: '#0A5C22',
  },
  badge: {
    backgroundColor: colors.sectionHeader,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: layout.borderRadius.xs,
    marginLeft: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  subtitle: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
