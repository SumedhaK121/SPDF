/**
 * DailyTransactionScreen
 * Core screen of the application matching SPBF / PoultryFlo web application:
 * - Farm selection mandatory first step (rest of form hidden until farm chosen)
 * - Exact fields in website order: editable (cream) vs calculated (grey)
 * - Locked today transaction date (strictly read-only, no date picker)
 * - Feed Consumption section with cards, cyan border, and late-feed rule
 * - Daily Transaction Mortality section with multi-reason breakdown
 * - Fixed bottom bar: Broiler Record (green border) | Cancel Entry | Save
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { formConfig } from '../config/formConfig';
import { useSession } from '../context/SessionContext';
import { farmService } from '../services/farmService';
import { feedService } from '../services/feedService';
import { transactionService } from '../services/transactionService';
import { getTodayDateString, formatWebsiteDate, isToday } from '../utils/dateUtils';
import { parseSafeNumber, formatNumber } from '../utils/numberUtils';
import { calculateFeedFigures } from '../utils/feedCalculations';
import { calculateMortalitySummary } from '../utils/mortalityCalculations';
import { validateDailyTransaction } from '../utils/validation';

import AppBar from '../components/AppBar';
import SelectionSummary from '../components/SelectionSummary';
import SelectField from '../components/SelectField';
import FormInput from '../components/FormInput';
import ReadOnlyField from '../components/ReadOnlyField';
import FeedSection from '../components/FeedSection';
import MortalitySection from '../components/MortalityReasonRow';
import AppButton from '../components/AppButton';
import { LoadingView } from '../components/StateViews';
import { Ionicons } from '@expo/vector-icons';

export default function DailyTransactionScreen({ navigation }) {
  const {
    activeBranch,
    activeSupervisor,
    activeFarm,
    activeBatch,
    selectFarm,
  } = useSession();

  // Screen state
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [farmsList, setFarmsList] = useState([]);
  const [feedLedger, setFeedLedger] = useState([]);
  const [pastTransactions, setPastTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isAlreadyEnteredToday, setIsAlreadyEnteredToday] = useState(false);

  // Form input fields
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [averageBodyWeight, setAverageBodyWeight] = useState('');
  const [totalCulls, setTotalCulls] = useState('0');
  const [enteredMortalityTotal, setEnteredMortalityTotal] = useState('');
  const [mortalityRows, setMortalityRows] = useState([
    { reason: '', quantity: '' },
  ]);
  const [feedInputs, setFeedInputs] = useState({
    pre_starter: { consumed: '', feederFeed: '' },
    starter: { consumed: '', feederFeed: '' },
    finisher: { consumed: '', feederFeed: '' },
  });

  // Yesterday metrics
  const [yesterdayMetrics, setYesterdayMetrics] = useState({
    yesterdayABW: '-',
    yesterdayMortality: '-',
  });

  // Track if user typed any values (for confirm-on-farm-switch)
  const isDirty = useMemo(() => {
    return (
      Boolean(averageBodyWeight) ||
      (totalCulls !== '0' && totalCulls !== '') ||
      mortalityRows.some(r => r.reason || r.quantity) ||
      Object.values(feedInputs).some(f => f.consumed || f.feederFeed)
    );
  }, [averageBodyWeight, totalCulls, mortalityRows, feedInputs]);

  // Midnight checker: update date if device date crosses midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToday = getTodayDateString();
      if (transactionDate !== currentToday) {
        setTransactionDate(currentToday);
        Alert.alert(
          'Date Refreshed',
          `The date has advanced to ${currentToday}. Please review your inputs before saving.`
        );
      }
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [transactionDate]);

  // Load farms assigned to the active supervisor
  const loadSupervisorFarms = useCallback(async () => {
    if (!activeSupervisor) {
      navigation.replace('SupervisorSelection');
      return;
    }
    try {
      setLoadingFarms(true);
      const data = await farmService.getFarmsBySupervisor(activeSupervisor.id);
      setFarmsList(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load supervisor farms.');
    } finally {
      setLoadingFarms(false);
    }
  }, [activeSupervisor, navigation]);

  useEffect(() => {
    loadSupervisorFarms();
  }, [loadSupervisorFarms]);

  // When active farm or batch changes, load history, feed ledger, and check duplicate
  const loadFarmData = useCallback(async () => {
    if (!activeFarm || !activeBatch) return;

    try {
      const ledger = await feedService.getFeedLedger(activeBatch);
      setFeedLedger(ledger);

      const txns = await transactionService.getTransactionsByBatch(
        activeFarm.id,
        activeBatch.batchNumber
      );
      setPastTransactions(txns);

      // Check if entry already made today
      const alreadyEntered = txns.some(t => t.date === transactionDate);
      setIsAlreadyEnteredToday(alreadyEntered);

      // Load yesterday's metrics
      const yMetrics = await transactionService.getYesterdayMetrics(
        activeFarm.id,
        activeBatch.batchNumber,
        transactionDate
      );
      setYesterdayMetrics(yMetrics);
    } catch (e) {
      console.warn('[DailyTransactionScreen] Error loading farm data:', e);
    }
  }, [activeFarm, activeBatch, transactionDate]);

  useEffect(() => {
    loadFarmData();
  }, [loadFarmData]);

  // Handle farm selection from dropdown
  const handleSelectFarmOption = (farmOption) => {
    if (activeFarm && activeFarm.id === farmOption.id) return;

    if (isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved entries for the current farm. Changing farm will reset your inputs. Continue?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Change Farm',
            style: 'destructive',
            onPress: () => {
              resetFormFields();
              selectFarm(farmOption);
            },
          },
        ]
      );
    } else {
      resetFormFields();
      selectFarm(farmOption);
    }
  };

  const resetFormFields = () => {
    setAverageBodyWeight('');
    setTotalCulls('0');
    setEnteredMortalityTotal('');
    setMortalityRows([{ reason: '', quantity: '' }]);
    setFeedInputs({
      pre_starter: { consumed: '', feederFeed: '' },
      starter: { consumed: '', feederFeed: '' },
      finisher: { consumed: '', feederFeed: '' },
    });
    setFormErrors({});
  };

  // Mortality row actions
  const handleAddMortalityRow = () => {
    setMortalityRows(prev => [...prev, { reason: '', quantity: '' }]);
  };

  const handleRemoveMortalityRow = (index) => {
    setMortalityRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleChangeMortalityRow = (index, field, value) => {
    setMortalityRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Feed inputs handler
  const handleChangeFeedInput = (typeId, field, value) => {
    setFeedInputs(prev => ({
      ...prev,
      [typeId]: {
        ...(prev[typeId] || {}),
        [field]: value,
      },
    }));
  };

  // Calculated figures
  const mortSummary = useMemo(() => {
    return calculateMortalitySummary(
      mortalityRows,
      enteredMortalityTotal,
      formConfig.MORTALITY_TOTAL_MODE
    );
  }, [mortalityRows, enteredMortalityTotal]);

  const todayMortality = mortSummary.totalMortality;
  const todayCullsNum = parseSafeNumber(totalCulls, 0);

  // Cumulative mortality and culls from earlier saved entries
  const cumulativePriorMortality = useMemo(() => {
    return pastTransactions
      .filter(tx => tx.date < transactionDate)
      .reduce((acc, t) => acc + parseSafeNumber(t.todayTotalMortality, 0), 0);
  }, [pastTransactions, transactionDate]);

  const cumulativePriorCulls = useMemo(() => {
    return pastTransactions
      .filter(tx => tx.date < transactionDate)
      .reduce((acc, t) => acc + parseSafeNumber(t.totalCulls, 0), 0);
  }, [pastTransactions, transactionDate]);

  const farmTotalMortality = cumulativePriorMortality + todayMortality;
  const farmTotalCulls = cumulativePriorCulls + todayCullsNum;

  // Batch constants
  const noOfChicks = activeBatch ? parseSafeNumber(activeBatch.noOfChicks, 0) : 0;
  const birdsSold = activeBatch ? parseSafeNumber(activeBatch.birdsSold, 0) : 0;
  const medicineAmount = activeBatch ? parseSafeNumber(activeBatch.medicineAmount, 0) : 0;
  const totalSaleWeight = activeBatch ? parseSafeNumber(activeBatch.saleWeight, 0) : 0;

  // Bird Balance: chicks − birds sold − total mortality − total culls
  const birdBalance = Math.max(0, noOfChicks - birdsSold - farmTotalMortality - farmTotalCulls);

  // Feed calculations
  const feedFigures = useMemo(() => {
    return calculateFeedFigures(
      feedLedger,
      pastTransactions,
      feedInputs,
      transactionDate,
      formConfig.feedTypes
    );
  }, [feedLedger, pastTransactions, feedInputs, transactionDate]);

  // Cancel Entry button handler
  const handleCancelEntry = () => {
    if (!isDirty) {
      Alert.alert('Notice', 'Form is already empty.');
      return;
    }
    Alert.alert(
      'Cancel Entry',
      'Are you sure you want to discard your entered data and reset the form?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Clear Form',
          style: 'destructive',
          onPress: resetFormFields,
        },
      ]
    );
  };

  // Save handler
  const handleSave = async () => {
    if (!activeFarm || !activeBatch) {
      Alert.alert('Error', 'Please select a farm first.');
      return;
    }

    if (isAlreadyEnteredToday) {
      Alert.alert('Blocked', formConfig.notes.alreadyEnteredNotice);
      return;
    }

    // Build payload
    const payload = {
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      supervisorId: activeSupervisor.id,
      supervisorEmployeeId: activeSupervisor.employeeId,
      supervisorName: activeSupervisor.name,
      farmId: activeFarm.id,
      farmName: activeFarm.farmName,
      farmCode: activeFarm.farmCode,
      farm: activeFarm,
      batchNumber: activeBatch.batchNumber,
      transactionDate: transactionDate,
      averageBodyWeight: averageBodyWeight,
      totalCulls: totalCulls,
      enteredMortalityTotal: enteredMortalityTotal,
      mortalityRows: mortalityRows,
      feedInputs: feedInputs,
      totalFeedConsumedToday: feedFigures.summary.totalFeedUsedToday,
      totalFeederFeedToday: feedFigures.summary.totalFeederFeedToday,
      totalFeedSupply: feedFigures.summary.totalFeedSupply,
      totalFeedBalance: feedFigures.summary.totalFeedBalance,
      feedReceived: feedFigures.summary.totalFeedIn,
      feedIn: feedFigures.summary.totalFeedIn,
      feedOut: feedFigures.summary.totalFeedOut,
      birdBalance: birdBalance,
      feedLines: feedFigures.feedCards.map(c => ({
        feedTypeId: c.feedTypeId,
        feedName: c.feedName,
        totalSupply: c.totalSupply,
        feedIn: c.feedIn,
        feedOut: c.feedOut,
        totalConsumed: c.totalConsumed,
        feedBalance: c.feedBalance,
        consumed: c.feedConsumedToday,
        feederFeed: c.feederFeedToday,
      })),
    };

    // Client-side validation before save
    const validation = validateDailyTransaction(payload, {
      activeSupervisor,
      activeBranch,
      activeBatch,
      existingTransactions: pastTransactions,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      Alert.alert('Validation Error', validation.summaryErrors.join('\n'));
      return;
    }

    try {
      setSaving(true);
      await transactionService.saveDailyTransaction(payload, {
        activeSupervisor,
        activeBranch,
        activeBatch,
        existingTransactions: pastTransactions,
      });

      // Reload updated history for the farm
      await loadFarmData();
      setIsAlreadyEnteredToday(true);

      // Success prompt with 2 choices
      Alert.alert(
        'Saved Successfully',
        `Daily transaction for ${activeFarm.farmName} on ${formatWebsiteDate(transactionDate)} has been recorded.`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              resetFormFields();
            },
          },
          {
            text: 'View Broiler Record',
            style: 'default',
            onPress: () => {
              navigation.navigate('BroilerRecords');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Save Failed', err.message || 'Unable to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  // Broiler Record navigation
  const handleOpenBroilerRecord = () => {
    if (!activeFarm) {
      Alert.alert('Select Farm', 'Please select a farm first to view its Broiler Record.');
      return;
    }
    navigation.navigate('BroilerRecords');
  };

  if (loadingFarms) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar title="Daily Transaction" showBack onBack={() => navigation.navigate('SupervisorSelection')} />
        <LoadingView message="Loading supervisor farms..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Daily Transaction" showBack onBack={() => navigation.navigate('SupervisorSelection')} />
      <SelectionSummary />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* A. Farm Selection Dropdown (Mandatory First Step §7.A) */}
          <View style={styles.farmSelectPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelHeaderText}>Select Farmer</Text>
            </View>
            <View style={styles.panelBody}>
              <SelectField
                label="Farmer Name"
                required
                value={activeFarm}
                options={farmsList}
                onSelect={handleSelectFarmOption}
                placeholder="--select--"
                labelExtractor={f => f.farmName || f.farmerName}
                subLabelExtractor={f => `[${f.farmCode || f.id}]`}
                error={formErrors.farmId}
              />
              {!activeFarm && (
                <View style={styles.farmHintBox}>
                  <Ionicons name="information-circle-outline" size={18} color="#005580" style={{ marginRight: 6 }} />
                  <Text style={styles.farmHintText}>
                    {formConfig.notes.farmRequiredNotice}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Form appears ONLY AFTER farm is chosen (§3, §7.A) */}
          {activeFarm && activeBatch && (
            <>
              {/* Already entered today banner (§6) */}
              {isAlreadyEnteredToday && (
                <View style={styles.alreadyEnteredBanner}>
                  <Ionicons name="alert-circle" size={20} color="#B71C1C" style={{ marginRight: 8 }} />
                  <Text style={styles.alreadyEnteredText}>
                    {formConfig.notes.alreadyEnteredNotice}
                  </Text>
                </View>
              )}

              {/* B. Daily Transaction General Information Panel (§7.B) */}
              <View style={styles.panel}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelHeaderText}>Daily Transaction</Text>
                </View>

                <View style={styles.panelBody}>
                  {/* Supervisor Name (Read-only) */}
                  <ReadOnlyField
                    label="Supervisor Name"
                    value={activeSupervisor?.name}
                  />

                  {/* Transaction Date (Read-only = Today §6) */}
                  <ReadOnlyField
                    label="Transaction Date"
                    value={`${formatWebsiteDate(transactionDate)} (Today)`}
                    highlight
                  />

                  {/* Average body Weight * (Editable, Required, Cream) */}
                  <FormInput
                    label="Average body Weight"
                    required
                    value={averageBodyWeight}
                    onChangeText={setAverageBodyWeight}
                    keyboardType="numeric"
                    placeholder="e.g. 850"
                    suffix="g"
                    error={formErrors.averageBodyWeight}
                  />

                  {/* Total Culls (Editable, Default 0, Cream) */}
                  <FormInput
                    label="Total Culls"
                    value={totalCulls}
                    onChangeText={setTotalCulls}
                    keyboardType="numeric"
                    placeholder="0"
                    suffix="birds"
                    error={formErrors.totalCulls}
                  />

                  {/* Two-Column Grid for Metrics */}
                  <View style={styles.twoColRow}>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Today Total Mortality"
                        value={todayMortality}
                        suffix="birds"
                      />
                    </View>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Farm Total Mortality"
                        value={farmTotalMortality}
                        suffix="birds"
                      />
                    </View>
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Farm Total Culls"
                        value={farmTotalCulls}
                        suffix="birds"
                      />
                    </View>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Farm Total Feed Consumed"
                        value={feedFigures.summary.totalFeedConsumed}
                        suffix="kg"
                      />
                    </View>
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Farm Total Feed Supply"
                        value={feedFigures.summary.totalFeedSupply}
                        suffix="kg"
                      />
                    </View>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="No Of Chicks"
                        value={formatNumber(noOfChicks)}
                        suffix="birds"
                      />
                    </View>
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Bird Balance"
                        value={formatNumber(birdBalance)}
                        suffix="birds"
                        highlight
                      />
                    </View>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Medicine Amount"
                        value={`₹ ${formatNumber(medicineAmount)}`}
                      />
                    </View>
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Total Bird Sale / Sale Weight"
                        value={`${birdsSold} / ${totalSaleWeight} kg`}
                      />
                    </View>
                    <View style={styles.col}>
                      <ReadOnlyField
                        label="Yesterday ABW"
                        value={yesterdayMetrics.yesterdayABW}
                      />
                    </View>
                  </View>

                  <ReadOnlyField
                    label="Yesterday Mortality"
                    value={yesterdayMetrics.yesterdayMortality}
                  />
                </View>
              </View>

              {/* C. Feed Consumption Section (§7.C) */}
              <FeedSection
                feedCards={feedFigures.feedCards}
                inputs={feedInputs}
                onChangeInput={handleChangeFeedInput}
                hasExcludedLateFeed={feedFigures.hasExcludedLateFeed}
                excludedLateFeedKg={feedFigures.totalExcludedLateFeedKg}
              />

              {/* D. Daily Transaction Mortality Section (§7.D) */}
              <MortalitySection
                rows={mortalityRows}
                enteredTotal={enteredMortalityTotal}
                mode={formConfig.MORTALITY_TOTAL_MODE}
                onAddRow={handleAddMortalityRow}
                onRemoveRow={handleRemoveMortalityRow}
                onChangeRow={handleChangeMortalityRow}
                onChangeEnteredTotal={setEnteredMortalityTotal}
                errors={formErrors.mortalityRows || {}}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* E. Fixed Bottom Bar (§5, §7.E) */}
      <View style={styles.fixedBottomBar}>
        {/* 1. Broiler Record Button (Thin Green Border #4CD964) */}
        <AppButton
          title="Broiler Record"
          onPress={handleOpenBroilerRecord}
          hasGreenBorder
          disabled={!activeFarm}
          style={styles.actionBtn}
          textStyle={{ fontSize: typography.fontSize.small }}
        />

        {/* 2. Cancel Entry Button */}
        <AppButton
          title="Cancel Entry"
          onPress={handleCancelEntry}
          disabled={!activeFarm || saving}
          style={styles.actionBtn}
          textStyle={{ fontSize: typography.fontSize.small }}
        />

        {/* 3. Save Button (Disabled when saving or already entered) */}
        <AppButton
          title={isAlreadyEnteredToday ? 'Already Saved' : 'Save'}
          onPress={handleSave}
          loading={saving}
          disabled={!activeFarm || isAlreadyEnteredToday || saving}
          variant="primary"
          style={[styles.actionBtn, styles.saveBtn]}
          textStyle={{ fontSize: typography.fontSize.small }}
        />
      </View>
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
    paddingBottom: 90, // Leave clearance for fixed bottom bar
  },
  farmSelectPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    marginBottom: spacing.md,
    overflow: 'hidden',
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
  farmHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F2F5',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  farmHintText: {
    flex: 1,
    fontSize: typography.fontSize.tiny + 1,
    color: '#004466',
    fontWeight: typography.fontWeight.medium,
  },
  alreadyEnteredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 1.5,
    borderColor: '#EF9A9A',
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  alreadyEnteredText: {
    flex: 1,
    fontSize: typography.fontSize.small,
    color: '#B71C1C',
    fontWeight: typography.fontWeight.bold,
  },
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
    elevation: 6,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 3,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 4,
  },
  saveBtn: {
    backgroundColor: '#C5DFE2',
  },
});
