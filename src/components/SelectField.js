/**
 * SelectField Component
 * Searchable modal dropdown matching SPBF website Farm Name selector:
 * - Cream background (#FFFCF9)
 * - Small blue dropdown arrow (#007AFF)
 * - Modal popup with search bar for fast selection among 25+ farmers
 * - Shows farm name + farm ID/code + village
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, layout, spacing } from '../theme';
import SearchBar from './SearchBar';

export default function SelectField({
  label,
  value,
  options = [],
  onSelect,
  placeholder = '--select--',
  required = false,
  error,
  keyExtractor = item => item.id,
  labelExtractor = item => item.farmName || item.name || item.label,
  subLabelExtractor = item => (item.farmCode ? `[${item.farmCode}]` : null),
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find(opt => keyExtractor(opt) === (typeof value === 'object' ? keyExtractor(value) : value));
  }, [value, options, keyExtractor]);

  // Filtered list based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(opt => {
      const main = labelExtractor(opt)?.toLowerCase() || '';
      const sub = subLabelExtractor(opt)?.toLowerCase() || '';
      const village = opt.village?.toLowerCase() || '';
      const farmer = opt.farmerName?.toLowerCase() || '';
      return main.includes(q) || sub.includes(q) || village.includes(q) || farmer.includes(q);
    });
  }, [options, searchQuery, labelExtractor, subLabelExtractor]);

  const handleSelectOption = (opt) => {
    setModalVisible(false);
    setSearchQuery('');
    if (onSelect) onSelect(opt);
  };

  const displayText = selectedOption ? labelExtractor(selectedOption) : '';

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setModalVisible(true)}
        style={[styles.selectBox, error && styles.selectBoxError]}
      >
        <Text
          style={[styles.selectedText, !displayText && styles.placeholderText]}
          numberOfLines={1}
        >
          {displayText || placeholder}
        </Text>
        <Ionicons name="caret-down" size={16} color={colors.link} style={styles.arrowIcon} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Searchable Options Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchQuery('');
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.modalSearchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search among ${options.length} farms...`}
            />
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isSelected = selectedOption && keyExtractor(selectedOption) === keyExtractor(item);
              const mainText = labelExtractor(item);
              const subText = subLabelExtractor(item);
              const village = item.village ? `Village: ${item.village}` : null;

              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectOption(item)}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                >
                  <View style={styles.optionIndexWrapper}>
                    <Text style={styles.optionIndex}>{index + 1}.</Text>
                  </View>
                  <View style={styles.optionTextWrapper}>
                    <View style={styles.optionMainRow}>
                      <Text style={[styles.optionMainText, isSelected && styles.optionTextBold]}>
                        {mainText}
                      </Text>
                      {subText ? <Text style={styles.optionSubCode}>{subText}</Text> : null}
                    </View>
                    {village ? <Text style={styles.optionVillageText}>{village}</Text> : null}
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={36} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No matching farms found.</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
    color: colors.labelText,
  },
  requiredStar: {
    color: colors.required,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.minTouchTarget,
    backgroundColor: colors.inputEditable, // Cream #FFFCF9
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: layout.borderRadius.xs,
    paddingHorizontal: spacing.sm,
  },
  selectBoxError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  selectedText: {
    flex: 1,
    fontSize: typography.fontSize.body,
    color: '#000000',
    fontWeight: typography.fontWeight.medium,
  },
  placeholderText: {
    color: '#888888',
    fontWeight: typography.fontWeight.regular,
  },
  arrowIcon: {
    marginLeft: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.tiny,
    color: colors.error,
    marginTop: spacing.xs / 2,
    fontWeight: typography.fontWeight.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  modalHeader: {
    height: 56,
    backgroundColor: colors.appBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalSearchWrapper: {
    padding: spacing.sm,
    backgroundColor: '#F0F4F5',
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFEF',
  },
  optionItemSelected: {
    backgroundColor: '#E6F4EA',
  },
  optionIndexWrapper: {
    width: 28,
  },
  optionIndex: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
  },
  optionTextWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  optionMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  optionMainText: {
    fontSize: typography.fontSize.body,
    color: '#000000',
  },
  optionTextBold: {
    fontWeight: typography.fontWeight.bold,
    color: '#0A5C22',
  },
  optionSubCode: {
    fontSize: typography.fontSize.tiny,
    color: colors.link,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.bold,
  },
  optionVillageText: {
    fontSize: typography.fontSize.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
