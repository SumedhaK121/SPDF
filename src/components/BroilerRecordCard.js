/**
 * BroilerRecordCard Component
 * Displays a single broiler transaction record as an adapted mobile card:
 * - "SAVED" badge (blue) for user-saved records
 * - "SAMPLE" badge (grey) for seeded initial demo data
 * - Key metrics preview: Date, Age, Chicks, Mortality, Cum. Mortality, Feed Used, ABW, Feed Balance
 * - "View Details" action button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { formatNumber } from '../utils/numberUtils';
import { Ionicons } from '@expo/vector-icons';

export default function BroilerRecordCard({
  record,
  onViewDetails,
}) {
  const isSaved = !record.isSampleData;

  return (
    <View style={styles.card}>
      {/* Top Header: Date, Age & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.dateAgeWrapper}>
          <Text style={styles.dateText}>{record.displayDate}</Text>
          <Text style={styles.ageBadge}>Age: {record.age} days</Text>
        </View>

        {/* Badge: SAVED vs SAMPLE */}
        <View style={[styles.badge, isSaved ? styles.badgeSaved : styles.badgeSample]}>
          <Text style={[styles.badgeText, isSaved ? styles.badgeTextSaved : styles.badgeTextSample]}>
            {isSaved ? 'SAVED' : 'SAMPLE'}
          </Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Chicks</Text>
          <Text style={styles.metricValue}>{formatNumber(record.chicks)}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Actual Wt (ABW)</Text>
          <Text style={[styles.metricValue, styles.weightValue]}>
            {formatNumber(record.actualWeight)} g
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Today Mort</Text>
          <Text style={[styles.metricValue, record.mortality > 0 && styles.mortalityValue]}>
            {record.mortality}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Cum. Mort</Text>
          <Text style={styles.metricValue}>{record.cumulativeMortality}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Feed Used</Text>
          <Text style={styles.metricValue}>{formatNumber(record.feedUsed)} kg</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Feed Balance</Text>
          <Text style={styles.metricValue}>{formatNumber(record.feedBalance)} kg</Text>
        </View>
      </View>

      {/* Card Footer: View Details Action */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onViewDetails}
          style={styles.detailsButton}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.link} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F4',
    marginBottom: spacing.sm,
  },
  dateAgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    marginRight: spacing.sm,
  },
  ageBadge: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    backgroundColor: '#E8F4F5',
    color: colors.sectionHeaderText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeSaved: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  badgeSample: {
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  badgeText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextSaved: {
    color: '#1565C0',
  },
  badgeTextSample: {
    color: '#666666',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '32%',
    backgroundColor: '#FAFCFC',
    borderWidth: 1,
    borderColor: '#E8EFEF',
    borderRadius: layout.borderRadius.xs,
    padding: 6,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: typography.fontSize.tiny - 1,
    color: '#666666',
    fontWeight: typography.fontWeight.semiBold,
  },
  metricValue: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: '#111111',
    marginTop: 2,
  },
  weightValue: {
    color: '#005580',
  },
  mortalityValue: {
    color: '#C62828',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F5',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsButtonText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.link,
  },
});
