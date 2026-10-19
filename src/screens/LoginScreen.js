/**
 * LoginScreen
 * Authentication screen with SPBF branding and demo credentials:
 * - SPBF peach logo on slate background
 * - Username / Employee ID input
 * - Password input with visibility toggle
 * - Explicit demo notice (DEMO LOGIN — not real authentication)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, layout, spacing } from '../theme';
import { appConfig } from '../config/appConfig';
import { useSession } from '../context/SessionContext';
import { authService } from '../services/authService';
import AppButton from '../components/AppButton';

export default function LoginScreen({ navigation }) {
  const { login } = useSession();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!username.trim()) {
      setErrorMessage('Please enter Username or Employee ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter Password.');
      return;
    }

    try {
      setLoading(true);
      const user = await authService.login(username, password);
      login(user);
      navigation.replace('BranchSelection');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.appBar} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Banner */}
          <View style={styles.brandSection}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>SPBF</Text>
            </View>
            <Text style={styles.appTitle}>{appConfig.appName}</Text>
            <Text style={styles.appTagline}>{appConfig.tagline}</Text>
          </View>

          {/* Login Form Panel */}
          <View style={styles.formPanel}>
            <View style={styles.panelTitleBar}>
              <Text style={styles.panelTitleText}>Supervisor Login</Text>
            </View>

            <View style={styles.panelBody}>
              {/* Notice Banner */}
              <View style={styles.demoNoticeBox}>
                <Ionicons name="information-circle-outline" size={18} color="#005580" style={{ marginRight: 6 }} />
                <Text style={styles.demoNoticeText}>
                  {appConfig.demoAuth.notice}
                </Text>
              </View>

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username / Employee ID *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="e.g. demo or E1870"
                    placeholderTextColor="#888888"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#888888"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Login Button */}
              <AppButton
                title="Login to Portal"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
              />

              {/* Demo Hint Helper */}
              <View style={styles.credentialsHint}>
                <Text style={styles.credHintLabel}>Demo Credentials:</Text>
                <Text style={styles.credHintValue}>Username: demo  |  Password: Demo@123</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3F4',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    backgroundColor: colors.appBar,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: layout.borderRadius.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  logoText: {
    color: colors.logoText,
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: typography.fontSize.header,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  formPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  panelTitleBar: {
    backgroundColor: colors.sectionHeader,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  panelTitleText: {
    fontSize: typography.fontSize.body + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  panelBody: {
    padding: spacing.md,
  },
  demoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FA',
    borderWidth: 1,
    borderColor: '#B3DCF2',
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: typography.fontSize.tiny,
    color: '#004466',
    fontWeight: typography.fontWeight.medium,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.inputEditable,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
  },
  fieldIcon: {
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: '#000000',
    paddingVertical: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDEE',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.tiny + 1,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  loginBtn: {
    marginTop: spacing.xs,
    minHeight: layout.minTouchTarget + 4,
  },
  credentialsHint: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF3F4',
  },
  credHintLabel: {
    fontSize: typography.fontSize.tiny,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
  },
  credHintValue: {
    fontSize: typography.fontSize.tiny,
    color: colors.link,
    marginTop: 2,
    fontWeight: typography.fontWeight.semiBold,
  },
});
