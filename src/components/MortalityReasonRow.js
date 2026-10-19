/**
 * MortalityReasonRow Component & Mortality Section
 * Supports multiple reasons for mortality:
 * - Dynamic rows with Sr.No, Reason picker, and Quantity input
 * - Live summary box: Total mortality | Distributed | Remaining
 * - Turns green with ✓ when balanced, red when unbalanced/invalid
 * - Used reasons marked "(already used)" in dropdown picker
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, layout, spacing } from '../theme';
import { formConfig } from '../config/formConfig';
import { calculateMortalitySummary, getUsedReasons } from '../utils/mortalityCalculations';

export default function MortalitySection({
  rows = [],
  enteredTotal = 0,
  mode = formConfig.MORTALITY_TOTAL_MODE,
  onAddRow,
  onRemoveRow,
  onChangeRow,
  onChangeEnteredTotal,
  errors = {},
}) {
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [activePickerRowIndex, setActivePickerRowIndex] = useState(null);

  const summary = calculateMortalitySummary(rows, enteredTotal, mode);
  const availableReasons = formConfig.mortalityReasons;
  const usedReasons = getUsedReasons(rows, activePickerRowIndex);

  const handleOpenPicker = (rowIndex) => {
    setActivePickerRowIndex(rowIndex);
    setPickerModalVisible(true);
  };

  const handleSelectReason = (reason) => {
    if (activePickerRowIndex !== null) {
      onChangeRow(activePickerRowIndex, 'reason', reason);
    }
    setPickerModalVisible(false);
    setActivePickerRowIndex(null);
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Daily Transaction Mortality</Text>
      </View>

      <View style={styles.body}>
        {/* If 'entered' mode, show entered total field */}
        {mode === 'entered' && (
          <View style={styles.enteredTotalRow}>
            <Text style={styles.enteredTotalLabel}>Total Mortality (Enter Total):</Text>
            <View style={styles.enteredTotalInputWrapper}>
              <TextInput
                style={styles.enteredTotalInput}
                keyboardType="numeric"
                value={String(enteredTotal || '')}
                onChangeText={onChangeEnteredTotal}
                placeholder="0"
                placeholderTextColor="#888888"
              />
            </View>
          </View>
        )}

        {/* Live Summary Box */}
        <View
          style={[
            styles.summaryBox,
            summary.isBalanced && summary.totalMortality > 0
              ? styles.summaryBoxValid
              : summary.totalMortality > 0 && !summary.isBalanced
              ? styles.summaryBoxInvalid
              : null,
          ]}
        >
          <View style={styles.summaryStats}>
            <Text style={styles.summaryItem}>
              Total mortality: <Text style={styles.summaryValue}>{summary.totalMortality}</Text>
            </Text>
            <Text style={styles.summaryItem}>
              Distributed: <Text style={styles.summaryValue}>{summary.distributedMortality}</Text>
            </Text>
            {mode === 'entered' && (
              <Text style={styles.summaryItem}>
                Remaining: <Text style={styles.summaryValue}>{summary.remainingMortality}</Text>
              </Text>
            )}
          </View>

          {summary.totalMortality > 0 && (
            <View style={styles.statusIndicator}>
              {summary.isBalanced ? (
                <View style={styles.balancedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#28A745" />
                  <Text style={styles.balancedText}>✓ Balanced</Text>
                </View>
              ) : (
                <View style={styles.unbalancedBadge}>
                  <Ionicons name="alert-circle" size={18} color="#DC3545" />
                  <Text style={styles.unbalancedText}>Check Distribution</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Rows Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCol, styles.colSr]}>Sr.</Text>
          <Text style={[styles.headerCol, styles.colReason]}>Mortality Reason</Text>
          <Text style={[styles.headerCol, styles.colQty]}>Qty</Text>
          <Text style={[styles.headerCol, styles.colAction]}>Action</Text>
        </View>

        {/* Rows */}
        {rows.map((row, index) => {
          const rowError = errors[index];
          return (
            <View key={index} style={styles.rowWrapper}>
              <View style={styles.tableRow}>
                {/* Sr.No */}
                <View style={[styles.cell, styles.colSr]}>
                  <Text style={styles.srText}>{index + 1}</Text>
                </View>

                {/* Mortality Reason Dropdown */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenPicker(index)}
                  style={[styles.cell, styles.colReason, styles.reasonSelector]}
                >
                  <Text
                    style={[styles.reasonText, !row.reason && styles.placeholderText]}
                    numberOfLines={1}
                  >
                    {row.reason || '--select--'}
                  </Text>
                  <Ionicons name="caret-down" size={14} color={colors.link} />
                </TouchableOpacity>

                {/* Quantity */}
                <View style={[styles.cell, styles.colQty, styles.qtyWrapper]}>
                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="numeric"
                    value={row.quantity !== undefined ? String(row.quantity) : ''}
                    onChangeText={val => onChangeRow(index, 'quantity', val)}
                    placeholder="0"
                    placeholderTextColor="#888888"
                  />
                </View>

                {/* Remove button */}
                <View style={[styles.cell, styles.colAction]}>
                  {rows.length > 1 ? (
                    <TouchableOpacity
                      onPress={() => onRemoveRow(index)}
                      style={styles.removeBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.dimmedDash}>-</Text>
                  )}
                </View>
              </View>

              {rowError ? <Text style={styles.rowErrorText}>{rowError}</Text> : null}
            </View>
          );
        })}

        {/* Add Reason Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onAddRow}
          style={styles.addReasonButton}
        >
          <Ionicons name="add-circle" size={18} color="#005580" style={{ marginRight: 4 }} />
          <Text style={styles.addReasonText}>+ Add Reason</Text>
        </TouchableOpacity>
      </View>

      {/* Reason Picker Modal */}
      <Modal
        visible={pickerModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Mortality Reason</Text>
              <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableReasons}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isAlreadyUsed = usedReasons.includes(item);
                return (
                  <TouchableOpacity
                    disabled={isAlreadyUsed}
                    onPress={() => handleSelectReason(item)}
                    style={[
                      styles.reasonOptionItem,
                      isAlreadyUsed && styles.reasonOptionDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reasonOptionText,
                        isAlreadyUsed && styles.reasonOptionTextDisabled,
                      ]}
                    >
                      {item} {isAlreadyUsed ? '(already used)' : ''}
                    </Text>
                    {isAlreadyUsed && (
                      <Ionicons name="lock-closed" size={14} color="#999999" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  body: {
    padding: spacing.sm,
  },
  enteredTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  enteredTotalLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
  },
  enteredTotalInputWrapper: {
    backgroundColor: colors.inputEditable,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
    minHeight: layout.minTouchTarget,
    width: 90,
    justifyContent: 'center',
  },
  enteredTotalInput: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#F7FAFA',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryBoxValid: {
    borderColor: '#28A745',
    backgroundColor: '#EDF8EE',
  },
  summaryBoxInvalid: {
    borderColor: '#DC3545',
    backgroundColor: '#FDEDEE',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    fontSize: typography.fontSize.tiny + 1,
    color: '#333333',
    fontWeight: typography.fontWeight.semiBold,
    marginRight: spacing.sm,
  },
  summaryValue: {
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
  },
  statusIndicator: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  balancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balancedText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: '#28A745',
    marginLeft: 4,
  },
  unbalancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unbalancedText: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: '#DC3545',
    marginLeft: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEFEF',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: layout.borderRadius.xs,
    marginBottom: 4,
  },
  headerCol: {
    fontSize: typography.fontSize.tiny,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  colSr: { width: 32, textAlign: 'center' },
  colReason: { flex: 1, paddingHorizontal: 4 },
  colQty: { width: 65, textAlign: 'center' },
  colAction: { width: 44, alignItems: 'center', justifyContent: 'center' },
  rowWrapper: {
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  srText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: '#555555',
    textAlign: 'center',
  },
  reasonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputEditable, // Cream #FFFCF9
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.xs + 2,
    marginRight: 4,
  },
  reasonText: {
    fontSize: typography.fontSize.small,
    color: '#000000',
    flex: 1,
  },
  placeholderText: {
    color: '#888888',
  },
  qtyWrapper: {
    backgroundColor: colors.inputEditable, // Cream #FFFCF9
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 4,
    marginRight: 4,
    justifyContent: 'center',
  },
  qtyInput: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 4,
  },
  removeBtn: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmedDash: {
    color: '#CCCCCC',
    textAlign: 'center',
  },
  rowErrorText: {
    fontSize: typography.fontSize.tiny,
    color: colors.error,
    marginLeft: 36,
    marginTop: 2,
  },
  addReasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTouchTarget - 4,
    backgroundColor: '#E7F2F5',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    marginTop: spacing.xs,
  },
  addReasonText: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: '#005580',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  pickerModalContent: {
    width: '90%',
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: layout.borderRadius.sm,
    overflow: 'hidden',
  },
  pickerModalHeader: {
    height: 48,
    backgroundColor: colors.appBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  pickerModalTitle: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
  },
  reasonOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F2',
  },
  reasonOptionDisabled: {
    backgroundColor: '#F5F5F5',
  },
  reasonOptionText: {
    fontSize: typography.fontSize.body,
    color: '#000000',
  },
  reasonOptionTextDisabled: {
    color: '#999999',
  },
});
