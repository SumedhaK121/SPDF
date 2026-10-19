/**
 * BranchSelectionScreen
 * Step 1 of workflow: Select from 25 branches.
 * Features:
 * - Searchable list of all 25 branches
 * - Selected state indicator
 * - "Reset demo data" button with confirmation modal
 * - Navigates to SupervisorSelectionScreen upon choice
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, layout, spacing } from '../theme';
import { branchService } from '../services/branchService';
import { demoDataService } from '../services/demoDataService';
import { useSession } from '../context/SessionContext';
import AppBar from '../components/AppBar';
import SearchBar from '../components/SearchBar';
import SelectionCard from '../components/SelectionCard';
import AppButton from '../components/AppButton';
import { LoadingView, EmptyView } from '../components/StateViews';
import { Ionicons } from '@expo/vector-icons';

export default function BranchSelectionScreen({ navigation }) {
  const { activeBranch, selectBranch, logout } = useSession();
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load branches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const filteredBranches = branches.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return b.name.toLowerCase().includes(q) || (b.code && b.code.toLowerCase().includes(q));
  });

  const handleSelectBranch = (branch) => {
    selectBranch(branch);
    navigation.navigate('SupervisorSelection');
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will clear any newly saved daily transactions and re-seed fresh demo history for the first two farms. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setResetting(true);
              await demoDataService.resetDemoData();
              await loadBranches();
              Alert.alert('Success', 'Demo data has been reset to default initial state.');
            } catch (e) {
              Alert.alert('Error', 'Could not reset demo data.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Select Branch"
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.headerInfo}>
        <Text style={styles.stepTitle}>Step 1: Choose Branch ({branches.length} Available)</Text>
        <Text style={styles.stepSubtitle}>Select your working branch to view its supervisors.</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search among ${branches.length} branches...`}
        />
      </View>

      {/* Branch List */}
      {loading ? (
        <LoadingView message="Loading branches..." />
      ) : (
        <FlatList
          data={filteredBranches}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isSelected = activeBranch && activeBranch.id === item.id;
            return (
              <SelectionCard
                title={`${index + 1}. ${item.name}`}
                subtitle={`Branch Code: ${item.code || item.id}`}
                badgeText={item.isSampleData ? 'DEMO' : 'ACTIVE'}
                isSelected={isSelected}
                onPress={() => handleSelectBranch(item)}
              />
            );
          }}
          ListEmptyComponent={
            <EmptyView
              icon="business-outline"
              title="No Branches Found"
              message="No branch matches your search query."
            />
          }
        />
      )}

      {/* Bottom Bar with Reset Demo Data Button */}
      <View style={styles.bottomBar}>
        <AppButton
          title="Reset Demo Data"
          onPress={handleResetData}
          loading={resetting}
          variant="secondary"
          icon={<Ionicons name="refresh-circle-outline" size={18} color={colors.buttonText} />}
          style={styles.resetBtn}
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
  logoutBtn: {
    padding: spacing.xs,
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
    paddingBottom: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resetBtn: {
    width: '100%',
  },
});
