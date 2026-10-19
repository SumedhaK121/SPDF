/**
 * SupervisorSelectionScreen
 * Step 2 of workflow: Select supervisor of chosen branch.
 * Features:
 * - Shows ONLY supervisors belonging to the selected branch (never mixes branches)
 * - Search by supervisor name or Employee ID
 * - Displays Employee ID (e.g. E1870) and phone number
 * - Navigates directly to DailyTransactionScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { supervisorService } from '../services/supervisorService';
import { useSession } from '../context/SessionContext';
import AppBar from '../components/AppBar';
import SearchBar from '../components/SearchBar';
import SelectionCard from '../components/SelectionCard';
import SelectionSummary from '../components/SelectionSummary';
import { LoadingView, EmptyView } from '../components/StateViews';

export default function SupervisorSelectionScreen({ navigation }) {
  const { activeBranch, activeSupervisor, selectSupervisor } = useSession();
  const [supervisors, setSupervisors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSupervisors = async () => {
    if (!activeBranch) {
      navigation.replace('BranchSelection');
      return;
    }

    try {
      setLoading(true);
      const data = await supervisorService.getSupervisorsByBranch(activeBranch.id);
      setSupervisors(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load supervisors for this branch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, [activeBranch]);

  const filteredSupervisors = supervisors.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.employeeId && s.employeeId.toLowerCase().includes(q))
    );
  });

  const handleSelectSupervisor = (sup) => {
    selectSupervisor(sup);
    navigation.navigate('DailyTransaction');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Select Supervisor" showBack onBack={() => navigation.navigate('BranchSelection')} />
      <SelectionSummary />

      <View style={styles.headerInfo}>
        <Text style={styles.stepTitle}>
          Step 2: Choose Supervisor ({supervisors.length} in {activeBranch?.name})
        </Text>
        <Text style={styles.stepSubtitle}>
          Select a supervisor to access their assigned broiler farms.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by supervisor name or Emp ID (e.g. E1870)..."
        />
      </View>

      {/* Supervisor List */}
      {loading ? (
        <LoadingView message="Loading supervisors..." />
      ) : (
        <FlatList
          data={filteredSupervisors}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isSelected = activeSupervisor && activeSupervisor.id === item.id;
            return (
              <SelectionCard
                title={`${index + 1}. ${item.name}`}
                subtitle={`Emp ID: ${item.employeeId}  •  ${item.phone || 'Branch Staff'}`}
                badgeText={item.employeeId}
                isSelected={isSelected}
                onPress={() => handleSelectSupervisor(item)}
              />
            );
          }}
          ListEmptyComponent={
            <EmptyView
              icon="people-outline"
              title="No Supervisors Found"
              message={`No supervisors assigned to branch "${activeBranch?.name}".`}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3F4',
  },
  headerInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },
  stepTitle: {
    fontSize: typography.fontSize.subtitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.sectionHeaderText,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.tiny + 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E9EA',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 24,
  },
});
