/**
 * Session Context
 * Central state management for:
 * - Current Auth User session
 * - Persistent active hierarchy: Branch -> Supervisor -> Farm -> Batch
 * - Survives navigation between Daily Transaction and Broiler Record
 * - Persists to AsyncStorage across app closures
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { farmService } from '../services/farmService';
import { appConfig } from '../config/appConfig';
import { demoDataService } from '../services/demoDataService';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeBranch, setActiveBranch] = useState(null);
  const [activeSupervisor, setActiveSupervisor] = useState(null);
  const [activeFarm, setActiveFarm] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore stored session on mount
  useEffect(() => {
    async function initSession() {
      try {
        await demoDataService.initializeDemoDataIfNeeded();
        const storedUser = await authService.getCurrentSession();
        if (storedUser) {
          setCurrentUser(storedUser);
        }

        const storedSelection = await storageService.getItem(appConfig.storageKeys.ACTIVE_SELECTION);
        if (storedSelection) {
          if (storedSelection.branch) setActiveBranch(storedSelection.branch);
          if (storedSelection.supervisor) setActiveSupervisor(storedSelection.supervisor);
          if (storedSelection.farm) setActiveFarm(storedSelection.farm);
          if (storedSelection.batch) setActiveBatch(storedSelection.batch);
        }
      } catch (err) {
        console.warn('[SessionContext] Error restoring session:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    initSession();
  }, []);

  // Sync active selection changes to storage
  const persistSelection = async (branch, supervisor, farm, batch) => {
    try {
      await storageService.setItem(appConfig.storageKeys.ACTIVE_SELECTION, {
        branch,
        supervisor,
        farm,
        batch,
      });
    } catch (e) {
      console.warn('[SessionContext] Could not persist active selection', e);
    }
  };

  const handleSelectBranch = (branch) => {
    setActiveBranch(branch);
    // Reset lower levels when branch changes
    setActiveSupervisor(null);
    setActiveFarm(null);
    setActiveBatch(null);
    persistSelection(branch, null, null, null);
  };

  const handleSelectSupervisor = (supervisor) => {
    setActiveSupervisor(supervisor);
    // Reset lower levels when supervisor changes
    setActiveFarm(null);
    setActiveBatch(null);
    persistSelection(activeBranch, supervisor, null, null);
  };

  const handleSelectFarm = async (farm) => {
    setActiveFarm(farm);
    if (farm) {
      const batch = await farmService.getActiveBatchForFarm(farm.id);
      setActiveBatch(batch);
      persistSelection(activeBranch, activeSupervisor, farm, batch);
    } else {
      setActiveBatch(null);
      persistSelection(activeBranch, activeSupervisor, null, null);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveBranch(null);
    setActiveSupervisor(null);
    setActiveFarm(null);
    setActiveBatch(null);
  };

  return (
    <SessionContext.Provider
      value={{
        isInitializing,
        currentUser,
        activeBranch,
        activeSupervisor,
        activeFarm,
        activeBatch,
        selectBranch: handleSelectBranch,
        selectSupervisor: handleSelectSupervisor,
        selectFarm: handleSelectFarm,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}

export default SessionContext;
