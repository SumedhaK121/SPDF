/**
 * FeedSection Component
 * Displays feed consumption metrics as adapted mobile cards:
 * - One card per feed type (Pre-Starter, Starter, Finisher)
 * - Cyan blue border (#34AADC)
 * - Read-only fields (grey) vs Editable fields (cream)
 * - Red note at bottom
 * - Orange hint when future-dated feed was excluded
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { formConfig } from '../config/formConfig';
import { Ionicons } from '@expo/vector-icons';

export default function FeedSection({
  feedCards = [],
  inputs = {},
  onChangeInput,
  hasExcludedLateFeed = false,
  excludedLateFeedKg = 0,
}) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Feed Consumption</Text>
      </View>

      <View style={styles.contentBody}>
        {feedCards.map((card, idx) => {
          const typeId = card.feedTypeId;
          const currentConsumed = inputs[typeId]?.consumed || '';
          const currentFeeder = inputs[typeId]?.feederFeed || '';

          return (
            <View key={typeId || idx} style={styles.feedCard}>
              {/* Feed Card Title */}
              <View style={styles.feedCardHeader}>
                <Text style={styles.feedCardTitle}>{card.feedName}</Text>
                <View style={styles.balanceBadge}>
                  <Text style={styles.balanceBadgeText}>
                    Bal: {card.feedBalance} kg
                  </Text>
                </View>
              </View>

              {/* Read-Only Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total Supply</Text>
                  <Text style={styles.statValue}>{card.totalSupply} kg</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Feed IN</Text>
                  <Text style={styles.statValue}>{card.feedIn} kg</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Feed Out</Text>
                  <Text style={styles.statValue}>{card.feedOut} kg</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total Consumed</Text>
                  <Text style={styles.statValue}>{card.totalConsumed} kg</Text>
                </View>
              </View>

              {/* Editable Fields Row */}
              <View style={styles.inputsRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Feed Consumed (kg)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={String(currentConsumed)}
                      onChangeText={val => onChangeInput(typeId, 'consumed', val)}
                      placeholder="0"
                      placeholderTextColor="#888888"
                    />
                  </View>
                </View>

                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Feeder Feed (kg)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={String(currentFeeder)}
                      onChangeText={val => onChangeInput(typeId, 'feederFeed', val)}
                      placeholder="0"
                      placeholderTextColor="#888888"
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Orange Late-Feed Exclusion Hint */}
        {hasExcludedLateFeed ? (
          <View style={styles.lateFeedHintBox}>
            <Ionicons name="information-circle" size={18} color={colors.warning} style={styles.hintIcon} />
            <Text style={styles.lateFeedHintText}>
              {formConfig.notes.lateFeedHint} ({excludedLateFeedKg} kg received after transaction date was excluded).
            </Text>
          </View>
        ) : null}

        {/* Official Website Red Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{formConfig.notes.feedNote}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: colors.sectionHeader,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  sectionHeaderText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  contentBody: {
    padding: spacing.sm,
  },
  feedCard: {
    borderWidth: 1.5,
    borderColor: colors.tableBorder, // Cyan #34AADC
    borderRadius: layout.borderRadius.xs,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4F5',
    paddingBottom: 4,
  },
  feedCardTitle: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  balanceBadge: {
    backgroundColor: '#E7F7FF',
    paddingHorizontal: spacing.xs + 4,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.tableBorder,
  },
  balanceBadgeText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: '#006699',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statBox: {
    width: '48%',
    backgroundColor: colors.inputReadOnly, // Grey #DCE1E2
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    padding: 6,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: typography.fontSize.tiny,
    color: '#333333',
    fontWeight: typography.fontWeight.bold,
  },
  statValue: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    marginTop: 2,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  inputCol: {
    width: '48%',
  },
  inputLabel: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: colors.inputEditable, // Cream #FFFCF9
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: typography.fontSize.body,
    color: '#000000',
    paddingVertical: 4,
  },
  lateFeedHintBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    alignItems: 'center',
  },
  hintIcon: {
    marginRight: spacing.xs,
  },
  lateFeedHintText: {
    flex: 1,
    fontSize: typography.fontSize.tiny + 1,
    color: '#8D6E63',
    fontWeight: typography.fontWeight.medium,
  },
  noteBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  noteText: {
    fontSize: typography.fontSize.tiny + 1,
    color: colors.noteRed,
    fontWeight: typography.fontWeight.bold,
    fontStyle: 'italic',
  },
});
