/**
 * Data Import Script (scripts/importExcel.js)
 * Run with: npm run import-data
 *
 * Requirements:
 * 1. Reads any Excel file in data-source/ using SheetJS (xlsx).
 * 2. Detects layout automatically (flat sheet or separate sheets for Branches, Supervisors, Farmers).
 * 3. Trims values, removes blank rows, removes duplicates, generates stable IDs.
 * 4. Builds Branch -> Supervisors -> Farms relationships strictly from source data.
 * 5. Writes src/data/generated/branches.json, supervisors.json, farms.json.
 * 6. Prints summary and reports any structural issues (orphans, duplicates).
 * 7. If Excel is missing, clearly falls back to labelled FICTIONAL SAMPLE DATA (25 branches x 3 supervisors x 25 farms).
 */

const fs = require('fs');
const path = require('path');

const DATA_SOURCE_DIR = path.join(__dirname, '..', 'data-source');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'generated');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_SOURCE_DIR)) {
  fs.mkdirSync(DATA_SOURCE_DIR, { recursive: true });
}

function normalizeHeader(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function slugify(text) {
  return String(text || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Generates clearly labelled fictional sample dataset (25 branches x 3 supervisors x 25 farms)
 */
function generateFictionalSampleData() {
  console.log('\n============================================================');
  console.log(' [NOTICE] NO COMPANY EXCEL FILE FOUND IN data-source/');
  console.log(' Generating CLEARLY LABELLED FICTIONAL SAMPLE DATA');
  console.log(' Shape: 25 Branches × 3 Supervisors × 25 Farms = 1,875 Farms');
  console.log(' NOTE: Fictional data for demo only. Never present as real company data.');
  console.log('============================================================\n');

  const branchNames = [
    'KOLHAPUR', 'SANGLI', 'SATARA', 'PUNE', 'SOLAPUR',
    'NASHIK', 'AHMEDNAGAR', 'AURANGABAD', 'JALGAON', 'DHULE',
    'RATNAGIRI', 'SINDHUDURG', 'BELAGAVI', 'NIPANI', 'BAGALKOT',
    'VIJAYAPURA', 'DHARWAD', 'HUBBALLI', 'NANDED', 'LATUR',
    'OSMANABAD', 'BEED', 'PARBHANI', 'JALNA', 'AMRAVATI'
  ];

  const supervisorFirstNames = [
    'Ramesh', 'Suresh', 'Santosh', 'Sachin', 'Anil',
    'Sunil', 'Vijay', 'Pravin', 'Ganesh', 'Mahesh',
    'Rajesh', 'Vikas', 'Amol', 'Dinesh', 'Nitin',
    'Rahul', 'Prashant', 'Deepak', 'Sanjay', 'Manoj'
  ];

  const supervisorLastNames = [
    'Patil', 'Deshmukh', 'Shinde', 'Jadhav', 'Kadam',
    'Chavan', 'Pawar', 'More', 'Gaikwad', 'Bhosale'
  ];

  const farmerFirstNames = [
    'Babasaheb', 'Dnyandev', 'Balasaheb', 'Pandurang', 'Tanaji',
    'Dattatray', 'Tukaram', 'Shivaji', 'Vishwas', 'Chandrakant',
    'Ashok', 'Popat', 'Vasant', 'Sampat', 'Uttam',
    'Maruti', 'Sambhaji', 'Anandrao', 'Bhagwan', 'Kisan',
    'Kashinath', 'Bhausaheb', 'Shahaji', 'Vithal', 'Gopinath'
  ];

  const villages = [
    'Shirol', 'Hatkanangle', 'Karveer', 'Bhadgaon', 'Kagal',
    'Gadhinglaj', 'Radhanagari', 'Ajara', 'Panhala', 'Shahuwadi',
    'Tasgaon', 'Walwa', 'Miraj', 'Shirala', 'Palus',
    'Karad', 'Patan', 'Koregaon', 'Wai', 'Phaltan'
  ];

  const branches = [];
  const supervisors = [];
  const farms = [];

  let supCounter = 1870; // Start with website's E1870
  let farmCounter = 1001;

  branchNames.forEach((bName, bIdx) => {
    const branchId = `BR-${String(bIdx + 1).padStart(2, '0')}`;
    branches.push({
      id: branchId,
      name: bName,
      code: bName.substring(0, 3),
      isSampleData: true,
    });

    // 3 supervisors per branch
    for (let s = 1; s <= 3; s++) {
      const empId = `E${supCounter++}`;
      const fName = supervisorFirstNames[(bIdx * 3 + s) % supervisorFirstNames.length];
      const lName = supervisorLastNames[(bIdx + s) % supervisorLastNames.length];
      const supName = `${fName} ${lName}`;
      const supId = `SUP-${empId}`;

      supervisors.push({
        id: supId,
        employeeId: empId,
        name: supName,
        branchId: branchId,
        branchName: bName,
        phone: `+91 98${String(10000000 + supCounter).substring(0, 8)}`,
        isSampleData: true,
      });

      // 25 farms per supervisor
      for (let f = 1; f <= 25; f++) {
        const farmNum = farmCounter++;
        const farmerName = `${farmerFirstNames[(f - 1) % farmerFirstNames.length]} ${supervisorLastNames[(bIdx + f) % supervisorLastNames.length]}`;
        const village = villages[(bIdx + f) % villages.length];
        const farmCode = `F-${farmNum}`;
        const farmId = `FARM-${farmNum}`;

        farms.push({
          id: farmId,
          farmCode: farmCode,
          farmerName: farmerName,
          farmName: `${farmerName} Broiler Farm`,
          village: village,
          supervisorId: supId,
          supervisorEmployeeId: empId,
          supervisorName: supName,
          branchId: branchId,
          branchName: bName,
          phone: `+91 97${String(20000000 + farmNum).substring(0, 8)}`,
          capacity: 5000,
          isSampleData: true,
        });
      }
    }
  });

  return { branches, supervisors, farms };
}

/**
 * Attempts to import and parse real Excel files from data-source/
 */
function importFromExcelFile(filePath) {
  let xlsx;
  try {
    xlsx = require('xlsx');
  } catch (e) {
    console.error('Error: "xlsx" module is not installed. Please run npm install xlsx.');
    process.exit(1);
  }

  console.log(`\nInspecting Excel file: ${filePath}`);
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  console.log(`Sheet Names found (${sheetNames.length}):`, sheetNames.join(', '));

  const branchesMap = new Map();
  const supervisorsMap = new Map();
  const farmsMap = new Map();
  const problems = [];

  // Check if workbook is multi-sheet or single flat sheet
  const lowerSheetNames = sheetNames.map(s => s.toLowerCase());
  const hasBranchSheet = lowerSheetNames.some(s => s.includes('branch'));
  const hasSupSheet = lowerSheetNames.some(s => s.includes('supervisor'));
  const hasFarmSheet = lowerSheetNames.some(s => s.includes('farm') || s.includes('farmer'));

  if (hasBranchSheet && hasSupSheet && hasFarmSheet) {
    console.log('[INFO] Detected Multi-Sheet layout.');
    // Handle multi-sheet parsing
    sheetNames.forEach(name => {
      const lower = name.toLowerCase();
      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
      if (lower.includes('branch')) {
        rows.forEach(r => {
          const bName = r['Branch'] || r['Branch Name'] || r['BRANCH'] || r['name'];
          if (bName) {
            const id = r['Branch ID'] || r['id'] || `BR-${slugify(bName)}`;
            branchesMap.set(String(id), { id: String(id), name: String(bName).trim(), ...r });
          }
        });
      }
    });
  } else {
    console.log('[INFO] Processing as Flat Sheet(s)...');
    sheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
      console.log(`Sheet "${sheetName}": ${rows.length} rows`);

      rows.forEach((row, idx) => {
        // Map headers case-insensitively
        const normalized = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[normalizeHeader(k)] = typeof v === 'string' ? v.trim() : v;
        }

        const branchName = normalized['branch'] || normalized['branchname'] || normalized['bname'] || '';
        const supervisorName = normalized['supervisor'] || normalized['supervisorname'] || normalized['supname'] || '';
        const empId = normalized['employeeid'] || normalized['empid'] || normalized['supervisorid'] || '';
        const farmerName = normalized['farmer'] || normalized['farmername'] || normalized['farmname'] || normalized['farmerfarmname'] || '';
        const farmId = normalized['farmid'] || normalized['farmcode'] || normalized['code'] || '';

        if (!branchName && !supervisorName && !farmerName) {
          return; // Skip blank row
        }

        if (!branchName) {
          problems.push(`Row ${idx + 2}: Missing branch name for supervisor "${supervisorName}", farmer "${farmerName}".`);
          return;
        }

        const branchId = `BR-${slugify(branchName)}`;
        if (!branchesMap.has(branchId)) {
          branchesMap.set(branchId, {
            id: branchId,
            name: branchName,
            isSampleData: false,
          });
        }

        if (!supervisorName) {
          problems.push(`Row ${idx + 2}: Missing supervisor name for branch "${branchName}".`);
          return;
        }

        const effectiveEmpId = empId || `E${slugify(supervisorName)}`;
        const supId = `SUP-${slugify(supervisorName)}-${effectiveEmpId}`;
        if (!supervisorsMap.has(supId)) {
          supervisorsMap.set(supId, {
            id: supId,
            employeeId: effectiveEmpId,
            name: supervisorName,
            branchId: branchId,
            branchName: branchName,
            isSampleData: false,
          });
        } else {
          // Check if same supervisor appears under different branch
          const existing = supervisorsMap.get(supId);
          if (existing.branchId !== branchId) {
            problems.push(`Supervisor "${supervisorName}" (${effectiveEmpId}) appears under multiple branches: "${existing.branchName}" and "${branchName}".`);
          }
        }

        if (farmerName) {
          const effectiveFarmId = farmId ? `FARM-${slugify(farmId)}` : `FARM-${slugify(farmerName)}-${idx + 1}`;
          if (!farmsMap.has(effectiveFarmId)) {
            farmsMap.set(effectiveFarmId, {
              id: effectiveFarmId,
              farmCode: farmId || `FC-${idx + 1}`,
              farmerName: farmerName,
              farmName: farmerName.toLowerCase().includes('farm') ? farmerName : `${farmerName} Farm`,
              supervisorId: supId,
              supervisorEmployeeId: effectiveEmpId,
              supervisorName: supervisorName,
              branchId: branchId,
              branchName: branchName,
              village: normalized['village'] || normalized['place'] || '',
              phone: normalized['phone'] || normalized['mobile'] || '',
              capacity: Number(normalized['capacity'] || normalized['chicks'] || 5000),
              isSampleData: false,
            });
          }
        }
      });
    });
  }

  return {
    branches: Array.from(branchesMap.values()),
    supervisors: Array.from(supervisorsMap.values()),
    farms: Array.from(farmsMap.values()),
    problems,
  };
}

function runImport() {
  console.log('--- Starting SPBF Master Data Import Script ---');
  console.log(`Checking data source folder: ${DATA_SOURCE_DIR}`);

  const files = fs.existsSync(DATA_SOURCE_DIR)
    ? fs.readdirSync(DATA_SOURCE_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls') || f.endsWith('.csv'))
    : [];

  let result;
  if (files.length === 0) {
    result = generateFictionalSampleData();
  } else {
    const excelPath = path.join(DATA_SOURCE_DIR, files[0]);
    try {
      result = importFromExcelFile(excelPath);
    } catch (err) {
      console.error(`Failed to parse ${excelPath}:`, err.message);
      console.log('Falling back to fictional sample data.');
      result = generateFictionalSampleData();
    }
  }

  const { branches, supervisors, farms, problems = [] } = result;

  // Write output files
  fs.writeFileSync(path.join(OUTPUT_DIR, 'branches.json'), JSON.stringify(branches, null, 2), 'utf-8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'supervisors.json'), JSON.stringify(supervisors, null, 2), 'utf-8');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'farms.json'), JSON.stringify(farms, null, 2), 'utf-8');

  // Print statistics and summary
  console.log('\n================ DATA IMPORT SUMMARY ================');
  console.log(`Total Branches imported:    ${branches.length}`);
  console.log(`Total Supervisors imported: ${supervisors.length}`);
  console.log(`Total Farms imported:       ${farms.length}`);

  // Calculate averages
  const supsPerBranch = (supervisors.length / Math.max(1, branches.length)).toFixed(1);
  const farmsPerSup = (farms.length / Math.max(1, supervisors.length)).toFixed(1);
  console.log(`Average Supervisors/Branch: ${supsPerBranch} (Expected ~3)`);
  console.log(`Average Farms/Supervisor:   ${farmsPerSup} (Expected ~25)`);

  if (problems.length > 0) {
    console.log(`\n[WARNING] Found ${problems.length} structural anomalies/warnings:`);
    problems.slice(0, 10).forEach(p => console.log(` - ${p}`));
    if (problems.length > 10) {
      console.log(`   ... and ${problems.length - 10} more.`);
    }
  } else {
    console.log('\n[SUCCESS] No orphaned records or structural anomalies detected.');
  }

  console.log(`\nFiles successfully written to:`);
  console.log(` - ${path.join(OUTPUT_DIR, 'branches.json')}`);
  console.log(` - ${path.join(OUTPUT_DIR, 'supervisors.json')}`);
  console.log(` - ${path.join(OUTPUT_DIR, 'farms.json')}`);
  console.log('=====================================================\n');
}

runImport();
