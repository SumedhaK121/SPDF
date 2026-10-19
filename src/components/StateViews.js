/**
 * StateViews Component
 * Reusable views for Loading, Empty, and Error states.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import AppButton from './AppButton';

export function LoadingView({ message = 'Loading data...' }) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={colors.appBar} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function EmptyView({
  icon = 'document-text-outline',
  title = 'No Records Found',
  message = 'There are no entries to display.',
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name={icon} size={48} color={colors.textSecondary} style={styles.stateIcon} />
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.messageText}>{message}</Text>
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
}

export function ErrorView({
  title = 'Something Went Wrong',
  message = 'Unable to load data.',
  onRetry,
}) {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} style={styles.stateIcon} />
      <Text style={[styles.titleText, { color: colors.error }]}>{title}</Text>
      <Text style={styles.messageText}>{message}</Text>
      {onRetry ? (
        <AppButton
          title="Retry"
          onPress={onRetry}
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.pageBg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  stateIcon: {
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  actionBtn: {
    minWidth: 140,
    marginTop: spacing.xs,
  },
});

export default {
  LoadingView,
  EmptyView,
  ErrorView,
};
