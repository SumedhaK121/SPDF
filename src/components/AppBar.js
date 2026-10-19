/**
 * AppBar Component
 * Replicates the exact SPBF website header:
 * - Slate blue background (#394A59)
 * - "SPBF" logo text in soft peach (#FFBF96)
 * - Branch name and Employee ID in light purple (#DA8CFF)
 * - Navigation back / action buttons with 44px min touch target
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSession } from '../context/SessionContext';

export default function AppBar({
  title,
  showBack = false,
  onBack,
  rightAction,
}) {
  const navigation = useNavigation();
  const { activeBranch, activeSupervisor, currentUser } = useSession();

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const branchDisplay = activeBranch?.name || '';
  const empDisplay = activeSupervisor?.employeeId || currentUser?.employeeId || '';

  return (
    <View style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.appBar} />
      <View style={styles.header}>
        {/* Left: Back / Menu button */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.iconButton}
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.brandContainer}>
            <Text style={styles.logoText}>SPBF</Text>
            {title ? (
              <Text style={styles.screenTitle} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right: Branch & Employee ID in light purple */}
        <View style={styles.rightSection}>
          {branchDisplay || empDisplay ? (
            <View style={styles.metaContainer}>
              {branchDisplay ? (
                <Text style={styles.accentText} numberOfLines={1}>
                  {branchDisplay}
                </Text>
              ) : null}
              {empDisplay ? (
                <Text style={styles.accentSubText} numberOfLines={1}>
                  [{empDisplay}]
                </Text>
              ) : null}
            </View>
          ) : null}
          {rightAction ? <View style={styles.actionContainer}>{rightAction}</View> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: colors.appBar,
    paddingTop: StatusBar.currentHeight || 36,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.appBar,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },
  logoText: {
    color: colors.logoText,
    fontSize: typography.fontSize.logo,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginRight: spacing.sm,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.medium,
    flexShrink: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '45%',
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  accentText: {
    color: colors.appBarAccent,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  accentSubText: {
    color: colors.appBarAccent,
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionContainer: {
    marginLeft: spacing.sm,
  },
});
