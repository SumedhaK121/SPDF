/**
 * BroilerRecordsScreen
 * History view for daily transactions of the selected farm and batch:
 * - Rendered as mobile cards, sorted newest first
 * - "SAVED" vs "SAMPLE" badges
 * - Date-range filter (From / To)
 * - Pull to refresh
 * - Navigates to BroilerRecordDetailScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { useSession } from '../context/SessionContext';
import { broilerRecordService } from '../services/broilerRecordService';
import AppBar from '../components/AppBar';
import SelectionSummary from '../components/SelectionSummary';
import BroilerRecordCard from '../components/BroilerRecordCard';
import { LoadingView, EmptyView } from '../components/StateViews';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../components/AppButton';

export default function BroilerRecordsScreen({ navigation }) {
  const { activeFarm, activeBatch } = useSession();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [fromDateInput, setFromDateInput] = useState('');
  const [toDateInput, setToDateInput] = useState('');
  const [activeFilter, setActiveFilter] = useState({ fromDate: '', toDate: '' });

  const loadRecords = useCallback(async (filterObj = activeFilter) => {
    if (!activeFarm || !activeBatch) return;

    try {
      setLoading(true);
      const data = await broilerRecordService.getBroilerRecords(
        activeFarm.id,
        activeBatch.batchNumber,
        filterObj
      );
      setRecords(data);
    } catch (err) {
      console.warn('[BroilerRecordsScreen] Error loading records:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFarm, activeBatch, activeFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecords(activeFilter);
  };

  const handleApplyFilter = () => {
    const newFilter = {
      fromDate: fromDateInput.trim(),
      toDate: toDateInput.trim(),
    };
    setActiveFilter(newFilter);
    setShowFilterModal(false);
    loadRecords(newFilter);
  };

  const handleClearFilter = () => {
    setFromDateInput('');
    setToDateInput('');
    const emptyFilter = { fromDate: '', toDate: '' };
    setActiveFilter(emptyFilter);
    setShowFilterModal(false);
    loadRecords(emptyFilter);
  };

  const hasFilterActive = Boolean(activeFilter.fromDate || activeFilter.toDate);

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Broiler Records"
        showBack
        onBack={() => navigation.navigate('DailyTransaction')}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={styles.filterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={hasFilterActive ? 'funnel' : 'funnel-outline'}
              size={20}
              color={hasFilterActive ? colors.appBarAccent : '#FFFFFF'}
            />
          </TouchableOpacity>
        }
      />
      <SelectionSummary />

      {/* Header Info */}
      <View style={styles.headerInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.farmTitle} numberOfLines={1}>
            {activeFarm?.farmName || 'Farm Records'}
          </Text>
          <View style={styles.batchPill}>
            <Text style={styles.batchPillText}>Batch: {activeBatch?.batchNumber}</Text>
          </View>
        </View>
        <Text style={styles.subTitle}>
          Total entries: {records.length} {hasFilterActive ? '(filtered)' : ''}
        </Text>
      </View>

      {/* Filter Active Bar */}
      {hasFilterActive && (
        <View style={styles.filterBar}>
          <Text style={styles.filterBarText}>
            Filter: {activeFilter.fromDate || 'Start'} → {activeFilter.toDate || 'Today'}
          </Text>
          <TouchableOpacity onPress={handleClearFilter}>
            <Text style={styles.filterClearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Records List */}
      {loading && !refreshing ? (
        <LoadingView message="Loading broiler history..." />
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.appBar]}
            />
          }
          renderItem={({ item }) => (
            <BroilerRecordCard
              record={item}
              onViewDetails={() =>
                navigation.navigate('BroilerRecordDetail', {
                  recordId: item.id,
                  farmId: activeFarm.id,
                  batchNumber: activeBatch.batchNumber,
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyView
              icon="document-text-outline"
              title="No Broiler Records"
              message={
                hasFilterActive
                  ? 'No records match the applied date filter.'
                  : `No daily transactions found for ${activeFarm?.farmName || 'this farm'}. Save today's transaction to see it here.`
              }
              actionLabel="Add Daily Transaction"
              onAction={() => navigation.navigate('DailyTransaction')}
            />
          }
        />
      )}

      {/* Date Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Records by Date</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>From Date (YYYY-MM-DD):</Text>
              <TextInput
                style={styles.modalInput}
                value={fromDateInput}
                onChangeText={setFromDateInput}
                placeholder="e.g. 2026-10-01"
                placeholderTextColor="#888888"
              />

              <Text style={styles.inputLabel}>To Date (YYYY-MM-DD):</Text>
              <TextInput
                style={styles.modalInput}
                value={toDateInput}
                onChangeText={setToDateInput}
                placeholder="e.g. 2026-10-19"
                placeholderTextColor="#888888"
              />

              <View style={styles.modalActions}>
                <AppButton
                  title="Clear"
                  onPress={handleClearFilter}
                  style={styles.modalBtn}
                  variant="secondary"
                />
                <AppButton
                  title="Apply Filter"
                  onPress={handleApplyFilter}
                  style={[styles.modalBtn, { backgroundColor: '#C5DFE2' }]}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3F4',
  },
  filterBtn: {
    padding: spacing.xs,
  },
  headerInfo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmTitle: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
    flex: 1,
  },
  batchPill: {
    backgroundColor: '#E8F4F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  batchPillText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  subTitle: {
    fontSize: typography.fontSize.tiny + 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  filterBarText: {
    fontSize: typography.fontSize.tiny,
    color: '#0D47A1',
    fontWeight: typography.fontWeight.medium,
  },
  filterClearText: {
    fontSize: typography.fontSize.tiny,
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.borderRadius.xs,
    overflow: 'hidden',
  },
  modalHeader: {
    height: 48,
    backgroundColor: colors.appBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
  },
  modalBody: {
    padding: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
    height: layout.minTouchTarget,
    fontSize: typography.fontSize.body,
    backgroundColor: colors.inputEditable,
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
