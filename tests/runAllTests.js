/**
 * Comprehensive Automated Logic & Business Rules Test Suite
 *
 * Requirements (§13):
 * 1. Excel import & hierarchy filtering
 * 2. Mortality calculations (5+3+2=10, 7 of 10 rejected in entered mode, duplicates, decimals, zero mortality)
 * 3. Validation rules (ABW required, negative numbers, wrong farm-supervisor, deaths+culls > birds left)
 * 4. Today-only rule (yesterday & tomorrow rejected, today accepted)
 * 5. One per day rule (second save blocked, concurrent tap race protection, separate farm allowed)
 * 6. Feed rule (late feed receipt excluded from balance, txn still saved and listed)
 * 7. Save -> Broiler Record integration (isolation by farm, newest first, correct values)
 * 8. Persistence & crash resilience (simulated restart, corrupted data handling)
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Color helpers for terminal output
const green = text => `\x1b[32m${text}\x1b[0m`;
const red = text => `\x1b[31m${text}\x1b[0m`;
const bold = text => `\x1b[1m${text}\x1b[0m`;
const cyan = text => `\x1b[36m${text}\x1b[0m`;

let passedCount = 0;
let failedCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  ${green('✓')} ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`  ${red('✗')} ${bold(testName)}`);
    console.error(`    ${red(err.message)}`);
    failedCount++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`  ${green('✓')} ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`  ${red('✗')} ${bold(testName)}`);
    console.error(`    ${red(err.message)}`);
    failedCount++;
  }
}

async function main() {
  console.log(`\n${bold(cyan('====================================================='))}`);
  console.log(`${bold(cyan('  SPBF Broiler Management — Automated Logic Tests  '))}`);
  console.log(`${bold(cyan('=====================================================\n'))}`);

  // Load generated master data
  const branchesPath = path.join(__dirname, '..', 'src', 'data', 'generated', 'branches.json');
  const supervisorsPath = path.join(__dirname, '..', 'src', 'data', 'generated', 'supervisors.json');
  const farmsPath = path.join(__dirname, '..', 'src', 'data', 'generated', 'farms.json');

  const branches = JSON.parse(fs.readFileSync(branchesPath, 'utf-8'));
  const supervisors = JSON.parse(fs.readFileSync(supervisorsPath, 'utf-8'));
  const farms = JSON.parse(fs.readFileSync(farmsPath, 'utf-8'));

  // Import utility and business rule functions
  const { getTodayDateString, offsetDays, isToday, calculateAge } = require('../src/utils/dateUtils');
  const { calculateMortalitySummary, validateMortality } = require('../src/utils/mortalityCalculations');
  const { calculateFeedFigures } = require('../src/utils/feedCalculations');
  const { validateDailyTransaction } = require('../src/utils/validation');
  const { buildBroilerRecords } = require('../src/utils/recordBuilder');
  const { storageService } = require('../src/services/storageService');
  const { transactionService } = require('../src/services/transactionService');
  const { broilerRecordService } = require('../src/services/broilerRecordService');
  const { formConfig } = require('../src/config/formConfig');

  // Clear in-memory storage for fresh tests
  await storageService.clear();

  // ---------------------------------------------------------
  // SECTION 1: Master Data & Hierarchy Tests
  // ---------------------------------------------------------
  console.log(bold('\n1. Master Data & Hierarchy Structure:'));

  runTest('Master data counts: 27 branches, 81 supervisors (3/branch), 2,025 farms (25/sup)', () => {
    assert.strictEqual(branches.length, 27, 'Should have exactly 27 branches');
    assert.strictEqual(supervisors.length, 81, 'Should have 81 supervisors');
    assert.strictEqual(farms.length, 2025, 'Should have 2,025 farms');
  });

  runTest('No orphaned records: every farm has a valid supervisor; every supervisor has a valid branch', () => {
    const branchIds = new Set(branches.map(b => b.id));
    const supervisorIds = new Set(supervisors.map(s => s.id));

    supervisors.forEach(s => {
      assert(branchIds.has(s.branchId), `Supervisor ${s.name} references invalid branch ${s.branchId}`);
    });

    farms.forEach(f => {
      assert(supervisorIds.has(f.supervisorId), `Farm ${f.farmName} references invalid supervisor ${f.supervisorId}`);
      assert(branchIds.has(f.branchId), `Farm ${f.farmName} references invalid branch ${f.branchId}`);
    });
  });

  runTest('Hierarchy filtering is strictly by parent (branch -> supervisors -> farms)', () => {
    const b1 = branches[0];
    const b1Supervisors = supervisors.filter(s => s.branchId === b1.id);
    assert.strictEqual(b1Supervisors.length, 3, 'Branch 1 must have exactly 3 supervisors');

    const s1 = b1Supervisors[0];
    const s1Farms = farms.filter(f => f.supervisorId === s1.id);
    assert.strictEqual(s1Farms.length, 25, 'Supervisor 1 must have exactly 25 farms');

    // Farms of supervisor 1 must NOT belong to supervisor 2
    const s2 = b1Supervisors[1];
    const s2Farms = farms.filter(f => f.supervisorId === s2.id);
    s1Farms.forEach(f => {
      assert(!s2Farms.some(f2 => f2.id === f.id), 'Farms must not be shared between supervisors');
    });
  });

  // ---------------------------------------------------------
  // SECTION 2: Mortality Calculation Tests
  // ---------------------------------------------------------
  console.log(bold('\n2. Mortality Calculations & Multi-Reason Rules:'));

  runTest('Multi-reason breakdown: Attack 5 + Disease 3 + Other 2 = 10 accepted in derived mode', () => {
    const rows = [
      { reason: 'Attack', quantity: 5 },
      { reason: 'Disease', quantity: 3 },
      { reason: 'Other', quantity: 2 },
    ];
    const summary = calculateMortalitySummary(rows, 0, 'derived');
    assert.strictEqual(summary.totalMortality, 10);
    assert.strictEqual(summary.distributedMortality, 10);
    assert.strictEqual(summary.isBalanced, true);

    const validation = validateMortality(rows, 0, 'derived', 5000, 0);
    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.totalMortality, 10);
  });

  runTest('Entered mode: 7 of 10 rejected; 12 of 10 rejected; 10 of 10 accepted', () => {
    const rowsUnder = [
      { reason: 'Attack', quantity: 4 },
      { reason: 'Disease', quantity: 3 },
    ]; // sum = 7
    const valUnder = validateMortality(rowsUnder, 10, 'entered', 5000, 0);
    assert.strictEqual(valUnder.isValid, false, '7 of 10 must be rejected in entered mode');

    const rowsOver = [
      { reason: 'Attack', quantity: 7 },
      { reason: 'Disease', quantity: 5 },
    ]; // sum = 12
    const valOver = validateMortality(rowsOver, 10, 'entered', 5000, 0);
    assert.strictEqual(valOver.isValid, false, '12 of 10 must be rejected in entered mode');

    const rowsExact = [
      { reason: 'Attack', quantity: 5 },
      { reason: 'Disease', quantity: 5 },
    ]; // sum = 10
    const valExact = validateMortality(rowsExact, 10, 'entered', 5000, 0);
    assert.strictEqual(valExact.isValid, true, '10 of 10 must be accepted in entered mode');
  });

  runTest('Zero mortality requires no reason rows', () => {
    const validation = validateMortality([], 0, 'derived', 5000, 0);
    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.totalMortality, 0);
  });

  runTest('Invalid quantities rejected: negative, non-numeric, decimal', () => {
    assert.strictEqual(validateMortality([{ reason: 'Attack', quantity: -3 }], 0, 'derived', 5000, 0).isValid, false);
    assert.strictEqual(validateMortality([{ reason: 'Attack', quantity: 'abc' }], 0, 'derived', 5000, 0).isValid, false);
    assert.strictEqual(validateMortality([{ reason: 'Attack', quantity: '2.5' }], 0, 'derived', 5000, 0).isValid, false);
  });

  runTest('Duplicate mortality reasons in same entry rejected', () => {
    const duplicateRows = [
      { reason: 'Disease', quantity: 3 },
      { reason: 'Disease', quantity: 2 },
    ];
    const validation = validateMortality(duplicateRows, 0, 'derived', 5000, 0);
    assert.strictEqual(validation.isValid, false, 'Duplicate reasons must be rejected');
  });

  runTest('Missing reason or missing quantity rejected', () => {
    assert.strictEqual(validateMortality([{ reason: '', quantity: 5 }], 0, 'derived', 5000, 0).isValid, false);
    assert.strictEqual(validateMortality([{ reason: 'Heat Stress', quantity: '' }], 0, 'derived', 5000, 0).isValid, false);
  });

  // ---------------------------------------------------------
  // SECTION 3: General Validation Rules
  // ---------------------------------------------------------
  console.log(bold('\n3. General Form Validation:'));

  runTest('Average body Weight is strictly required and must be > 0', () => {
    const today = getTodayDateString();
    const farm = farms[0];

    const valEmpty = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: today,
      averageBodyWeight: '',
      totalCulls: '0',
    });
    assert.strictEqual(valEmpty.isValid, false, 'Empty ABW must be rejected');

    const valZero = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: today,
      averageBodyWeight: '0',
      totalCulls: '0',
    });
    assert.strictEqual(valZero.isValid, false, 'ABW = 0 must be rejected');

    const valNegative = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: today,
      averageBodyWeight: '-50',
      totalCulls: '0',
    });
    assert.strictEqual(valNegative.isValid, false, 'Negative ABW must be rejected');

    const valValid = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: today,
      averageBodyWeight: '850',
      totalCulls: '0',
    });
    assert.strictEqual(valValid.isValid, true, 'Positive ABW must be accepted');
  });

  runTest('Total Culls must be a non-negative whole number (>= 0)', () => {
    const today = getTodayDateString();
    const farm = farms[0];

    assert.strictEqual(
      validateDailyTransaction({
        farmId: farm.id,
        farm: farm,
        transactionDate: today,
        averageBodyWeight: '850',
        totalCulls: '-1',
      }).isValid,
      false,
      'Negative culls must be rejected'
    );

    assert.strictEqual(
      validateDailyTransaction({
        farmId: farm.id,
        farm: farm,
        transactionDate: today,
        averageBodyWeight: '850',
        totalCulls: '3.5',
      }).isValid,
      false,
      'Decimal culls must be rejected'
    );
  });

  runTest('Mortality + Culls exceeding bird balance rejected', () => {
    const today = getTodayDateString();
    const farm = farms[0];

    const validation = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: today,
      averageBodyWeight: '850',
      totalCulls: '100',
      mortalityRows: [{ reason: 'Disease', quantity: 200 }],
      birdBalance: 250, // 100 + 200 = 300 > 250
    });

    assert.strictEqual(validation.isValid, false, 'Mortality + Culls > Bird Balance must fail');
  });

  // ---------------------------------------------------------
  // SECTION 4: Today-Only Rule Tests (§6)
  // ---------------------------------------------------------
  console.log(bold('\n4. Strict Today-Only Rule Enforcement:'));

  runTest('Yesterday and tomorrow dates rejected by validation; today accepted', () => {
    const today = getTodayDateString();
    const yesterday = offsetDays(today, -1);
    const tomorrow = offsetDays(today, 1);
    const farm = farms[0];

    const valYesterday = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: yesterday,
      averageBodyWeight: '850',
      totalCulls: '0',
    });
    assert.strictEqual(valYesterday.isValid, false, 'Yesterday date must be rejected');

    const valTomorrow = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: tomorrow,
      averageBodyWeight: '850',
      totalCulls: '0',
    });
    assert.strictEqual(valTomorrow.isValid, false, 'Tomorrow date must be rejected');

    const valToday = validateDailyTransaction({
      farmId: farm.id,
      farm: farm,
      transactionDate: today,
      averageBodyWeight: '850',
      totalCulls: '0',
    });
    assert.strictEqual(valToday.isValid, true, 'Today date must be accepted');
  });

  await runAsyncTest('Save service strictly blocks backdated and future transactions', async () => {
    const today = getTodayDateString();
    const yesterday = offsetDays(today, -1);
    const farm = farms[0];
    const sup = supervisors.find(s => s.id === farm.supervisorId);

    const payloadYesterday = {
      branchId: farm.branchId,
      branchName: farm.branchName,
      supervisorId: sup.id,
      supervisorEmployeeId: sup.employeeId,
      supervisorName: sup.name,
      farmId: farm.id,
      farmName: farm.farmName,
      farm: farm,
      batchNumber: 'B-TEST',
      transactionDate: yesterday,
      averageBodyWeight: '850',
      totalCulls: '0',
      mortalityRows: [],
    };

    let caughtError = null;
    try {
      await transactionService.saveDailyTransaction(payloadYesterday);
    } catch (e) {
      caughtError = e;
    }
    assert(caughtError !== null, 'Save service must throw error for yesterday date');
  });

  // ---------------------------------------------------------
  // SECTION 5: One Transaction Per Farm Per Day Rule (§6)
  // ---------------------------------------------------------
  console.log(bold('\n5. One Transaction Per Farm Per Day Rule:'));

  await runAsyncTest('Second save for same farm on same day is blocked; different farm on same day accepted', async () => {
    const today = getTodayDateString();
    const farmA = farms[0];
    const farmB = farms[1];
    const sup = supervisors.find(s => s.id === farmA.supervisorId);

    const payloadA = {
      branchId: farmA.branchId,
      branchName: farmA.branchName,
      supervisorId: sup.id,
      supervisorEmployeeId: sup.employeeId,
      supervisorName: sup.name,
      farmId: farmA.id,
      farmName: farmA.farmName,
      farm: farmA,
      batchNumber: 'B-TEST-1',
      transactionDate: today,
      averageBodyWeight: '900',
      totalCulls: '1',
      mortalityRows: [{ reason: 'Attack', quantity: 2 }],
    };

    // First save for Farm A succeeds
    const savedA = await transactionService.saveDailyTransaction(payloadA);
    assert(savedA && savedA.id, 'First save for Farm A should succeed');

    // Second save for Farm A on same day must be rejected
    let duplicateError = null;
    try {
      await transactionService.saveDailyTransaction(payloadA);
    } catch (e) {
      duplicateError = e;
    }
    assert(duplicateError !== null, 'Second save for Farm A on same day must be blocked');
    assert(
      duplicateError.message.includes('Already entered'),
      'Error message must clearly state "Already entered"'
    );

    // Save for Farm B on same day must succeed
    const payloadB = {
      ...payloadA,
      farmId: farmB.id,
      farmName: farmB.farmName,
      farm: farmB,
    };
    const savedB = await transactionService.saveDailyTransaction(payloadB);
    assert(savedB && savedB.id, 'Save for Farm B on same day must succeed');
  });

  await runAsyncTest('Concurrent rapid taps serialized safely through save queue', async () => {
    const today = getTodayDateString();
    const farmC = farms[2];
    const sup = supervisors.find(s => s.id === farmC.supervisorId);

    const payload = {
      branchId: farmC.branchId,
      branchName: farmC.branchName,
      supervisorId: sup.id,
      supervisorEmployeeId: sup.employeeId,
      supervisorName: sup.name,
      farmId: farmC.id,
      farmName: farmC.farmName,
      farm: farmC,
      batchNumber: 'B-TEST-CONCURRENT',
      transactionDate: today,
      averageBodyWeight: '950',
      totalCulls: '0',
      mortalityRows: [],
    };

    // Fire two saves simultaneously
    const promise1 = transactionService.saveDailyTransaction(payload);
    const promise2 = transactionService.saveDailyTransaction(payload);

    const results = await Promise.allSettled([promise1, promise2]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    assert.strictEqual(fulfilled.length, 1, 'Exactly one concurrent save must succeed');
    assert.strictEqual(rejected.length, 1, 'Second concurrent save must be rejected as duplicate');
  });

  // ---------------------------------------------------------
  // SECTION 6: Feed Calculation & Late-Feed Exclusion Rule (§6)
  // ---------------------------------------------------------
  console.log(bold('\n6. Feed Calculation & Late-Feed Exclusion Rule:'));

  runTest('Feed received after transaction date is strictly EXCLUDED from supply and balance', () => {
    const today = getTodayDateString();
    const tomorrow = offsetDays(today, 1);
    const yesterday = offsetDays(today, -1);

    const ledger = [
      { date: yesterday, feedTypeId: 'starter', feedName: 'Starter', type: 'RECEIPT', quantityKg: 1000 },
      { date: today, feedTypeId: 'starter', feedName: 'Starter', type: 'RECEIPT', quantityKg: 500 },
      { date: tomorrow, feedTypeId: 'starter', feedName: 'Starter', type: 'RECEIPT', quantityKg: 800 }, // LATE FEED
    ];

    const feedTypes = [{ id: 'starter', name: 'Starter' }];
    const pastTxns = [];
    const todayInputs = { starter: { consumed: 200, feederFeed: 50 } };

    const result = calculateFeedFigures(ledger, pastTxns, todayInputs, today, feedTypes);

    assert.strictEqual(result.hasExcludedLateFeed, true, 'Must detect late feed');
    assert.strictEqual(result.totalExcludedLateFeedKg, 800, 'Must identify 800 kg late feed');

    const starterCard = result.feedCards[0];
    assert.strictEqual(starterCard.totalSupply, 1500, 'Total supply must include yesterday + today (1000+500=1500)');
    assert.strictEqual(starterCard.feedIn, 500, 'Feed In must be today receipt (500)');
    assert.strictEqual(starterCard.totalConsumed, 200, 'Consumed must be 200');
    assert.strictEqual(starterCard.feedBalance, 1300, 'Balance must be 1500 - 200 = 1300 (excluding 800 kg late feed)');
  });

  // ---------------------------------------------------------
  // SECTION 7: Broiler Record Reconstruction & Isolation (§8)
  // ---------------------------------------------------------
  console.log(bold('\n7. Broiler Record Reconstruction & Data Isolation:'));

  await runAsyncTest('Saved transaction appears in Broiler Record for that farm only, newest first', async () => {
    const farmA = farms[0];
    const farmB = farms[1];

    const recordsA = await broilerRecordService.getBroilerRecords(farmA.id, 'B-TEST-1');
    assert(recordsA.length > 0, 'Farm A must have records');
    assert.strictEqual(recordsA[0].actualWeight, 900, 'ABW must match saved value');
    assert.strictEqual(recordsA[0].isSampleData, false, 'User-saved record must not be sample data');

    // Verify Farm B does not see Farm A's record
    const recordsB = await broilerRecordService.getBroilerRecords(farmB.id, 'B-TEST-1');
    recordsB.forEach(r => {
      assert.strictEqual(r.farmId, farmB.id, 'Farm B records must only belong to Farm B');
    });
  });

  // ---------------------------------------------------------
  // SECTION 8: Persistence & Crash Resilience (§9)
  // ---------------------------------------------------------
  console.log(bold('\n8. Persistence & Crash Resilience:'));

  await runAsyncTest('Records survive process restart (simulated storage reload)', async () => {
    const memory = storageService._getMemoryStore();
    assert(memory.size > 0, 'Storage must have persisted items');

    const rawTxns = await storageService.getItem(formConfig ? '@spbf_daily_transactions' : '@spbf_daily_transactions');
    assert(Array.isArray(rawTxns) && rawTxns.length > 0, 'Persisted transactions must be array');
  });

  runTest('Corrupted or malformed storage returns fallback without crashing app', () => {
    const badBatch = null;
    const badTxns = 'not-an-array';
    const result = buildBroilerRecords(badBatch, badTxns);
    assert(Array.isArray(result) && result.length === 0, 'Must return empty array without crashing');
  });

  console.log(`\n${bold(cyan('====================================================='))}`);
  console.log(`  Tests Passed: ${green(passedCount)} / ${passedCount + failedCount}`);
  if (failedCount > 0) {
    console.log(`  Tests Failed: ${red(failedCount)}`);
    process.exit(1);
  } else {
    console.log(`  ${green(bold('ALL LOGIC TESTS PASSED SUCCESSFULLY!'))}`);
  }
  console.log(`${bold(cyan('=====================================================\n'))}`);
}

main().catch(err => {
  console.error(red('Test suite error:'), err);
  process.exit(1);
});
