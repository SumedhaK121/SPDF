/**
 * Demo Data Initialization and Reset Service
 * Automatically seeds the first two farms with sample history on initial launch.
 * Provides a clean "Reset Demo Data" mechanism.
 */

import { appConfig } from '../config/appConfig';
import { storageService } from './storageService';
import { farmService } from './farmService';
import { branchService } from './branchService';
import { supervisorService } from './supervisorService';
import { feedService } from './feedService';
import { generateSeedTransactionsForFarm1, generateSeedTransactionsForFarm2 } from '../data/mockBroilerRecords';

export const demoDataService = {
  /**
   * Initializes sample history on first app run.
   */
  async initializeDemoDataIfNeeded() {
    const isInitialized = await storageService.getItem(appConfig.storageKeys.APP_INITIALIZED);
    if (isInitialized) {
      return false; // Already seeded
    }

    console.log('[demoDataService] First launch detected. Seeding demo history...');
    await this.seedInitialDemoData();
    await storageService.setItem(appConfig.storageKeys.APP_INITIALIZED, true);
    return true;
  },

  /**
   * Seeds demo data for the first two farms.
   */
  async seedInitialDemoData() {
    const branches = await branchService.getBranches();
    if (branches.length === 0) return;

    const firstBranch = branches[0];
    const supervisors = await supervisorService.getSupervisorsByBranch(firstBranch.id);
    if (supervisors.length === 0) return;

    const firstSupervisor = supervisors[0];
    const farms = await farmService.getFarmsBySupervisor(firstSupervisor.id);
    if (farms.length < 2) return;

    const farm1 = farms[0];
    const farm2 = farms[1];

    const batch1 = await farmService.getActiveBatchForFarm(farm1.id);
    const batch2 = await farmService.getActiveBatchForFarm(farm2.id);

    const ledger1 = await feedService.getFeedLedger(batch1);
    const ledger2 = await feedService.getFeedLedger(batch2);

    const seedTxnsFarm1 = generateSeedTransactionsForFarm1(farm1, batch1, ledger1);
    const seedTxnsFarm2 = generateSeedTransactionsForFarm2(farm2, batch2, ledger2);

    const combined = [...seedTxnsFarm1, ...seedTxnsFarm2];
    await storageService.setItem(appConfig.storageKeys.TRANSACTIONS, combined);

    console.log(`[demoDataService] Seeded ${seedTxnsFarm1.length} entries for ${farm1.farmName} and ${seedTxnsFarm2.length} for ${farm2.farmName}.`);
  },

  /**
   * Resets all stored data and re-seeds fresh demo data.
   */
  async resetDemoData() {
    console.log('[demoDataService] Resetting demo data...');
    await storageService.clear();
    await this.seedInitialDemoData();
    await storageService.setItem(appConfig.storageKeys.APP_INITIALIZED, true);
    return true;
  },
};

export default demoDataService;
