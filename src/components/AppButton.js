/**
 * AppButton Component
 * Styled according to SPBF website buttons:
 * - Soft grey-teal background (#B8D4D6)
 * - Dark bold text (#333333)
 * - Optional green accent border (#4CD964) for "Broiler Record" button
 * - Minimum touch target 44px
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { colors, typography, layout, spacing } from '../theme';

export default function AppButton({
  title,
  onPress,
  variant = 'default', // 'default' | 'primary' | 'secondary' | 'accent' | 'danger'
  hasGreenBorder = false,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) {
  const isButtonDisabled = disabled || loading;

  const getBorderColor = () => {
    if (hasGreenBorder) return colors.buttonAccentBorder;
    if (variant === 'accent') return colors.buttonAccentBorder;
    return colors.panelBorder;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[
        styles.buttonBase,
        { borderColor: getBorderColor() },
        hasGreenBorder && styles.greenBorder,
        variant === 'danger' && styles.dangerButton,
        isButtonDisabled && styles.disabledButton,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.buttonText} style={styles.spinner} />
        ) : (
          <>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text
              style={[
                styles.buttonText,
                variant === 'danger' && styles.dangerButtonText,
                isButtonDisabled && styles.disabledButtonText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.buttonBg,
    borderRadius: layout.borderRadius.xs,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  greenBorder: {
    borderColor: colors.buttonAccentBorder,
    borderWidth: 2,
  },
  dangerButton: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.error,
  },
  disabledButton: {
    backgroundColor: '#E5EAEA',
    borderColor: '#CCD3D4',
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: spacing.xs + 2,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  dangerButtonText: {
    color: colors.error,
  },
  disabledButtonText: {
    color: '#888888',
  },
  spinner: {
    paddingVertical: 2,
  },
});
