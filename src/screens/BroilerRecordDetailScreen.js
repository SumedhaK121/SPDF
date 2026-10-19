/**
 * BroilerRecordDetailScreen
 * Full inspection of a specific saved daily record:
 * - Complete 14 metrics from specification
 * - Reason-wise mortality breakdown table
 * - Feed consumption lines per feed type
 * - "SAVED" vs "SAMPLE" status badge
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { broilerRecordService } from '../services/broilerRecordService';
import { formatNumber } from '../utils/numberUtils';
import AppBar from '../components/AppBar';
import ReadOnlyField from '../components/ReadOnlyField';
import { LoadingView } from '../components/StateViews';

export default function BroilerRecordDetailScreen({ route, navigation }) {
  const { recordId, farmId, batchNumber } = route.params || {};
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecordDetail() {
      try {
        setLoading(true);
        const data = await broilerRecordService.getBroilerRecordDetails(
          recordId,
          farmId,
          batchNumber
        );
        if (data) {
          setRecord(data);
        } else {
          Alert.alert('Not Found', 'Record details could not be found.');
          navigation.goBack();
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load record details.');
      } finally {
        setLoading(false);
      }
    }

    loadRecordDetail();
  }, [recordId, farmId, batchNumber, navigation]);

  if (loading || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar title="Record Details" showBack />
        <LoadingView message="Loading record details..." />
      </SafeAreaView>
    );
  }

  const isSaved = !record.isSampleData;

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Record Details" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Farm & Status Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.farmTitle}>{record.farmName}</Text>
              <Text style={styles.batchSub}>
                Batch: {record.batchNumber}  •  Age: {record.age} days
              </Text>
            </View>
            <View style={[styles.badge, isSaved ? styles.badgeSaved : styles.badgeSample]}>
              <Text style={[styles.badgeText, isSaved ? styles.badgeTextSaved : styles.badgeTextSample]}>
                {isSaved ? 'SAVED' : 'SAMPLE'}
              </Text>
            </View>
          </View>
          <Text style={styles.dateBanner}>Transaction Date: {record.displayDate}</Text>
        </View>

        {/* 14 Key Metrics Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelHeaderText}>Flock & Weight Metrics</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="Transaction Date" value={record.displayDate} />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Flock Age" value={`${record.age} days`} />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="No Of Chicks" value={formatNumber(record.chicks)} />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Sold Birds" value={formatNumber(record.soldBirds)} />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="Actual Weight (ABW)" value={`${formatNumber(record.actualWeight)} g`} highlight />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Total Culls" value={record.culls} />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="Today Mortality" value={record.mortality} highlight />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Cumulative Mortality" value={record.cumulativeMortality} />
              </View>
            </View>
          </View>
        </View>

        {/* Feed Metrics Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelHeaderText}>Feed Figures</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="Feed Used Today" value={`${formatNumber(record.feedUsed)} kg`} />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Feeder Feed" value={`${formatNumber(record.feederFeed)} kg`} />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="Feed Received" value={`${formatNumber(record.feedReceived)} kg`} />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Feed IN" value={`${formatNumber(record.feedIn)} kg`} />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.col}>
                <ReadOnlyField label="Feed Out" value={`${formatNumber(record.feedOut)} kg`} />
              </View>
              <View style={styles.col}>
                <ReadOnlyField label="Feed Balance" value={`${formatNumber(record.feedBalance)} kg`} highlight />
              </View>
            </View>
          </View>
        </View>

        {/* Mortality Reasons Breakdown */}
        {record.mortalityReasons && record.mortalityReasons.length > 0 && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelHeaderText}>Mortality Reasons Breakdown</Text>
            </View>
            <View style={styles.panelBody}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: 40 }]}>Sr.</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>Reason</Text>
                <Text style={[styles.headerCell, { width: 80, textAlign: 'right' }]}>Quantity</Text>
              </View>
              {record.mortalityReasons.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.cellText, { width: 40, fontWeight: 'bold' }]}>{idx + 1}</Text>
                  <Text style={[styles.cellText, { flex: 1 }]}>{item.reason}</Text>
                  <Text style={[styles.cellText, { width: 80, textAlign: 'right', fontWeight: 'bold' }]}>
                    {item.quantity} birds
                  </Text>
                </View>
              ))}
              <View style={styles.tableTotalRow}>
                <Text style={styles.tableTotalLabel}>Total Distributed Mortality:</Text>
                <Text style={styles.tableTotalValue}>{record.mortality} birds</Text>
              </View>
            </View>
          </View>
        )}

        {/* Feed Lines Table (if available) */}
        {record.feedLines && record.feedLines.length > 0 && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelHeaderText}>Feed Lines Ledger</Text>
            </View>
            <View style={styles.panelBody}>
              {record.feedLines.map((line, idx) => (
                <View key={idx} style={styles.feedLineCard}>
                  <Text style={styles.feedLineTitle}>{line.feedName}</Text>
                  <View style={styles.feedLineStats}>
                    <Text style={styles.feedLineStatText}>Supply: {line.totalSupply} kg</Text>
                    <Text style={styles.feedLineStatText}>Consumed: {line.consumed || 0} kg</Text>
                    <Text style={styles.feedLineStatText}>Bal: {line.feedBalance} kg</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3F4',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmTitle: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
  },
  batchSub: {
    fontSize: typography.fontSize.tiny + 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateBanner: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#EEF3F4',
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
  panel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  panelHeader: {
    backgroundColor: colors.sectionHeader,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  panelHeaderText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  panelBody: {
    padding: spacing.md,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEF4F5',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: layout.borderRadius.xs,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F5',
  },
  cellText: {
    fontSize: typography.fontSize.small,
    color: '#000000',
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: colors.panelBorder,
  },
  tableTotalLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
  },
  tableTotalValue: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: '#C62828',
  },
  feedLineCard: {
    backgroundColor: '#F9FCFC',
    borderWidth: 1,
    borderColor: '#E2EBEB',
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  feedLineTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
    marginBottom: 2,
  },
  feedLineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedLineStatText: {
    fontSize: typography.fontSize.tiny,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});
