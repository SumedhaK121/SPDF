/**
 * SelectionSummary Banner Component
 * Displays the persistent active hierarchy:
 * Branch › Supervisor › Farm › Batch
 *
 * Clickable badges allow quick navigation/switching if needed.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import { useNavigation } from '@react-navigation/native';

export default function SelectionSummary({ style, compact = false }) {
  const { activeBranch, activeSupervisor, activeFarm, activeBatch } = useSession();
  const navigation = useNavigation();

  if (!activeBranch) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.breadcrumbRow}>
        {/* Branch */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('BranchSelection')}
          style={styles.crumbButton}
        >
          <Text style={styles.crumbText} numberOfLines={1}>
            {activeBranch.name}
          </Text>
        </TouchableOpacity>

        <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={styles.separator} />

        {/* Supervisor */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SupervisorSelection')}
          style={styles.crumbButton}
          disabled={!activeSupervisor}
        >
          <Text
            style={[styles.crumbText, !activeSupervisor && styles.crumbTextMuted]}
            numberOfLines={1}
          >
            {activeSupervisor ? activeSupervisor.name.split(' ')[0] : 'Supervisor'}
          </Text>
        </TouchableOpacity>

        {activeFarm ? (
          <>
            <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={styles.separator} />
            <View style={styles.crumbActive}>
              <Text style={styles.crumbTextActive} numberOfLines={1}>
                {activeFarm.farmerName || activeFarm.farmName}
              </Text>
            </View>
          </>
        ) : null}

        {activeBatch ? (
          <>
            <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={styles.separator} />
            <View style={styles.batchTag}>
              <Text style={styles.batchText}>{activeBatch.batchNumber}</Text>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF3F4',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  crumbButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: layout.borderRadius.xs,
  },
  crumbText: {
    fontSize: typography.fontSize.tiny + 1,
    color: colors.link,
    fontWeight: typography.fontWeight.bold,
  },
  crumbTextMuted: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.regular,
  },
  separator: {
    marginHorizontal: 2,
  },
  crumbActive: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    maxWidth: 130,
  },
  crumbTextActive: {
    fontSize: typography.fontSize.tiny + 1,
    color: colors.sectionHeaderText,
    fontWeight: typography.fontWeight.bold,
  },
  batchTag: {
    backgroundColor: colors.sectionHeader,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginLeft: 2,
  },
  batchText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
});
