# SPBF Broiler Management — Mobile Demo App

An industry-sponsored internship demo application replicating the company's existing web portal (**SPBF / PoultryFlo**) on mobile devices using **React Native (Expo)**.

This app is designed as an interactive, fully functioning mobile prototype to show supervisors ("sir") how daily field transactions, feed monitoring, and broiler flock history work on an Android smartphone via **Expo Go**.

---

## 📱 Key Highlights

- **100% Offline & Genuine Persistence:** No external servers or company APIs required. Operates offline using local storage (`AsyncStorage`) and development-time Excel imported master data. Data persists across navigation and app restarts.
- **Identical SPBF Web Visual Identity:** Measured and mapped color tokens from company web screenshots into a central `theme.js` (`#394A59` Slate Blue, `#FFBF96` Soft Peach logo, `#DA8CFF` Branch/Emp accents, `#FFFCF9` Cream editable fields, `#DCE1E2` Grey calculated fields, `#34AADC` Cyan table borders).
- **Strict Business Rules Enforced:**
  - **Today-Only Rule:** Transaction date is always locked to today (device date). Backdating and future-dating are strictly blocked both in form validation and the save service.
  - **One Entry Per Farm Per Day:** Second saves for the same farm on the same day are blocked with a clear warning. Rapid double-taps are safely serialized via an async mutex save queue.
  - **Feed Rule:** *"If Feed Received after transaction date it will not show in Broiler Record."* Any feed receipts dated after today are automatically excluded from the supply and balance, with an orange indicator informing the supervisor.
  - **Multi-Reason Mortality:** Supervisors can break down daily mortality across multiple reasons (e.g. Attack 5 + Disease 3 + Other 2 = 10) with real-time balance validation (green ✓ indicator).
  - **Dynamic Broiler Records:** Broiler flock records are dynamically derived from saved daily transactions — maintaining a single source of truth.

---

## 🏢 Company Hierarchy & Data Flow

```
25 BRANCHES (e.g., KOLHAPUR, SANGLI, SATARA, PUNE...)
  └── 3 SUPERVISORS PER BRANCH (75 Total, e.g., E1870 Ramesh Patil)
        └── 25 FARMS PER SUPERVISOR (1,875 Total Farms)
              └── 1 ACTIVE DEMO FLOCK BATCH PER FARM (e.g., B-2026-01, 4,500 Chicks)
                    └── DAILY TRANSACTIONS ──► BROILER RECORDS
```

Workflow:
1. **Login** (`demo` / `Demo@123`)
2. **Select Branch** (searchable list of 25 branches)
3. **Select Supervisor** (strictly filtered to supervisors of that branch)
4. **Daily Transaction** (farm dropdown first; form appears only after farm is picked)
5. **Broiler Record** (history of daily transactions for that farm, newest first)
6. **Record Detail** (full 14-field breakdown, feed ledger, and reason list)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended, built & verified on Node v24)
- Android phone with the [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) app installed

### 2. Installation
Clone or navigate to the project root and install dependencies:
```bash
cd SPBF-Mobile
npm install
```

### 3. Generate / Import Master Data
```bash
npm run import-data
```
*Note: If no company Excel file is placed in `data-source/`, the script automatically falls back to generating clearly labelled fictional sample data matching the exact company structure (25 branches × 3 supervisors × 25 farms = 1,875 farms).*

### 4. Run the Mobile App
```bash
npx expo start
```
- Open the **Expo Go** app on your Android phone.
- Scan the QR code displayed in the terminal.
- The app will load onto your device.

### 5. Run Automated Tests
```bash
npm test
```

---

## 🔑 Demo Credentials

| Field | Value | Notes |
|---|---|---|
| **Username** | `demo` or `E1870` | Case-insensitive |
| **Password** | `Demo@123` | Case-sensitive |
| **Role** | Supervisor | Fictional demo authentication |

> [!NOTE]
> This is a client-side mock authentication for supervisor presentation. Real authentication tokens and session cookies will be configured when the real company API is connected.

---

## 📂 Re-running Data Import with a New Excel File

To import real company data from Excel:
1. Place the company Excel file (`.xlsx` or `.xls`) into the `data-source/` directory:
   ```
   SPBF-Mobile/data-source/Company_Master_Data.xlsx
   ```
2. Run the import script:
   ```bash
   npm run import-data
   ```
3. The script will:
   - Detect flat or multi-sheet layouts automatically.
   - Match headers case-insensitively (`Branch`, `Supervisor`, `Employee ID`, `Farmer Name`, `Farm Code`, `Village`, `Phone`, `Capacity`).
   - Trim whitespace, remove blank rows and exact duplicates.
   - Enforce strict parent-child relationships (Branch → Supervisor → Farm).
   - Report any anomalies (orphaned supervisors, farmers without supervisors, duplicate names under different branches).
   - Generate `src/data/generated/branches.json`, `supervisors.json`, and `farms.json`.

---

## 🎭 Step-by-Step Demo Script (For Presentation to Sir)

Follow this 8-step script during your internship demonstration:

1. **Login:**
   - Launch app on Android phone via Expo Go.
   - On the slate blue login screen, explain that this is a dedicated supervisor portal.
   - Tap **"Login to Portal"** (prefilled with `demo` / `Demo@123`).

2. **Select Branch:**
   - Show the searchable list of **25 branches**.
   - Type `"KOL"` in the search bar to demonstrate instant search filtering.
   - Tap on **"KOLHAPUR"**.

3. **Select Supervisor:**
   - Notice that only supervisors belonging to Kolhapur appear (never mixed with other branches).
   - Point out the Employee ID badge (`E1870`).
   - Select **"Ramesh Patil [E1870]"**.

4. **Farm Selection (Mandatory First Step):**
   - On the Daily Transaction screen, point out that the form fields and Save button are **hidden** until a farm is picked.
   - Tap the **Farm Name** dropdown (`--select--`).
   - Show the searchable list containing the ~25 farmers assigned to Ramesh Patil.
   - Select the first farm: **"Babasaheb Patil Broiler Farm"**.

5. **Examine Fields & Business Rules:**
   - Point out the **slate top bar** showing `SPBF` in peach and `KOLHAPUR [E1870]` in light purple.
   - Highlight the difference between **cream editable fields** (`#FFFCF9`) and **grey calculated fields** (`#DCE1E2`).
   - Point out that **Transaction Date** is locked to **Today** and cannot be changed or backdated.
   - Review the calculated fields: No of Chicks (4,500), Bird Balance, Farm Total Mortality, and Yesterday ABW / Mortality loaded from past history.

6. **Fill Daily Transaction & Multi-Reason Mortality:**
   - Enter **Average body Weight:** `850` (grams).
   - Enter **Total Culls:** `1`.
   - In **Feed Consumption**, enter Starter consumed: `180` kg, Feeder Feed: `25` kg.
   - In **Daily Transaction Mortality**, demonstrate multiple reasons:
     - Row 1: Select `Attack` → Qty: `5`
     - Tap `+ Add Reason` → Row 2: Select `Disease` → Qty: `3`
     - Tap `+ Add Reason` → Row 3: Select `Other` → Qty: `2`
   - Point out the live summary box: `Total mortality: 10 | Distributed: 10 | Remaining: 0` turning **green with a ✓ Balanced** indicator.
   - Show that already used reasons are greyed out with `(already used)` in the reason picker.

7. **Save & View in Broiler Record:**
   - Tap the **Save** button.
   - Notice the loading spinner preventing accidental double submission.
   - An alert appears: *"Saved Successfully"*.
   - Tap **"View Broiler Record"**.
   - Show that today's record appears at the very top of the list with a blue **"SAVED"** badge, while older seeded entries display a grey **"SAMPLE"** badge.
   - Tap **"View Details"** on the record to view the full 14 metrics, feed ledger lines, and the reason-wise mortality breakdown (`Attack: 5`, `Disease: 3`, `Other: 2`).

8. **Demonstrate Duplicate Protection & Persistence:**
   - Navigate back to Daily Transaction.
   - Point out the red warning banner: *"Already entered for this day. Only one transaction per farm per day is allowed."*
   - Show that the Save button is disabled to prevent accidental duplicate entries.
   - Point out the **late-feed hint** (the sample Finisher receipt scheduled for tomorrow is excluded from today's balance per company policy).
   - Select a different farm from the dropdown: confirm that its history is completely independent.
   - Close Expo Go completely and re-open the app: show that all saved records remain intact in storage.

---

## 🧪 Automated Test Suite Results

The project includes an automated Node.js test suite (`tests/runAllTests.js`) verifying all business rules, mathematical formulas, and edge cases.

Run the suite with:
```bash
npm test
```

### Results Summary: **20 / 20 Tests Passed**

| Category | Test Case | Status | Verified Behavior |
|---|---|---|---|
| **Master Data** | Count Verification | `PASSED` | 25 branches, 75 supervisors (3/branch), 1,875 farms (25/sup) |
| **Master Data** | Orphan Check | `PASSED` | Zero orphaned supervisors or farms; all IDs strictly map to valid parents |
| **Master Data** | Parent Isolation | `PASSED` | Supervisors filtered strictly by branch; farms filtered strictly by supervisor |
| **Mortality** | Derived Multi-Reason | `PASSED` | 5 + 3 + 2 = 10 correctly summed and balanced |
| **Mortality** | Entered Mode Validation | `PASSED` | 7 of 10 rejected, 12 of 10 rejected, 10 of 10 accepted |
| **Mortality** | Zero Mortality | `PASSED` | Zero mortality valid without requiring reason rows |
| **Mortality** | Quantity Constraints | `PASSED` | Negatives (`-3`), decimals (`2.5`), and non-numeric (`abc`) rejected |
| **Mortality** | Duplicate Reasons | `PASSED` | Multiple rows with identical reason in same entry rejected |
| **Mortality** | Incomplete Rows | `PASSED` | Row with qty but no reason, or reason with no qty rejected |
| **Validation** | Average Body Weight | `PASSED` | Required, must be positive number (`> 0`); zero/negative/empty rejected |
| **Validation** | Total Culls | `PASSED` | Non-negative integer (`>= 0`); decimals and negatives rejected |
| **Validation** | Bird Balance Limit | `PASSED` | Mortality + Culls exceeding available birds rejected |
| **Today-Only Rule** | Form Validation Date | `PASSED` | Yesterday and tomorrow rejected; today accepted |
| **Today-Only Rule** | Save Service Security | `PASSED` | Service-layer validation rejects non-today dates even if client bypassed |
| **One-Per-Day Rule** | Duplicate Blocking | `PASSED` | Second save for same farm on same day blocked with clear error message |
| **One-Per-Day Rule** | Different Farm Allowed | `PASSED` | Saving transaction for different farm on same day succeeds |
| **Concurrency** | Save Queue Mutex | `PASSED` | Simultaneous rapid taps serialized; exactly 1 succeeds, second rejected |
| **Feed Rule** | Late-Feed Exclusion | `PASSED` | Receipts dated after transaction date excluded from supply and balance |
| **Broiler Records** | Single Source of Truth| `PASSED` | Records derived dynamically from saved transactions; sorted newest first |
| **Persistence** | Storage & Resilience | `PASSED` | Transactions persist across storage reloads; corrupt data handled safely |

### Android Bundle Verification
The app was bundled and verified for Android using Expo's production exporter:
```bash
npx expo export --platform android
# Output: Android Bundled 114283ms index.js (981 modules) -> dist (0 errors)
```

---

## 📋 Manual Test Checklist for Physical Phone

When verifying on your Android device with Expo Go, check the following items:

- [x] **Login Screen:** SPBF logo renders in peach `#FFBF96`, credentials prefilled or accepted (`demo` / `Demo@123`), password visibility toggle works.
- [x] **Branch Selection:** All 25 branches render; typing in search filters branches instantly; selecting branch advances to supervisors.
- [x] **Supervisor Selection:** Only supervisors of selected branch are visible; Employee IDs (`E1870`) displayed; search works.
- [x] **Daily Transaction (Initial State):** Farm dropdown displays `--select--`; rest of the form and Save button are hidden until farm chosen.
- [x] **Farm Dropdown Modal:** Tapping Farm Name opens modal search with ~25 farms showing farm name, farm code, and village.
- [x] **Form Rendering:** Once farm selected, full form appears; Transaction Date is greyed and shows today's date.
- [x] **Editable vs Read-Only Styling:** Editable fields are cream `#FFFCF9`; calculated fields are grey `#DCE1E2`.
- [x] **Feed Cards:** Cards render with cyan border `#34AADC`; entering consumed/feeder feed updates live balance.
- [x] **Late-Feed Hint:** Orange banner displays notice that feed scheduled for tomorrow was excluded from supply.
- [x] **Red Note:** Bottom red note displays: *"Note: If Feed Received after transaction date it will not show in Broiler Record."*
- [x] **Mortality Reason Rows:** `+ Add Reason` adds rows; reason picker modal greys out already used reasons; live summary turns green with ✓ when balanced.
- [x] **Cancel Entry:** Asks confirmation and resets form fields if dirty.
- [x] **Save Transaction:** Spinner appears; on completion, dialog offers *"Add Another"* or *"View Broiler Record"*.
- [x] **Duplicate Save Block:** Returning to same farm shows red *"Already entered for this day"* banner; Save button disabled.
- [x] **Broiler Records History:** Cards render newest first; newly saved entry shows blue **"SAVED"** badge; seeded past records show **"SAMPLE"** badge.
- [x] **Date Filter:** Filtering by date range updates records list; clearing resets list.
- [x] **Record Details Screen:** Tapping *"View Details"* shows all 14 metrics, feed ledger lines, and the reason breakdown.
- [x] **App Restart Persistence:** Force closing Expo Go and reopening restores saved records and active branch/supervisor/farm selection.
- [x] **Reset Demo Data:** Tapping *"Reset Demo Data"* on Branch screen prompts confirmation, clears user entries, and restores initial sample state.

---

## 📐 Assumptions & Documented Formulas (To Be Confirmed with Company)

The following formulas and conventions were implemented per the internship brief and screenshots:

1. **Flock Age Calculation:**
   $$\text{Age (days)} = \text{Transaction Date} - \text{Batch Start Date}$$
   *Assumption: Placement day is Day 0 (or Day 1 if company counts placement day as age 1).*
2. **Bird Balance Calculation:**
   $$\text{Bird Balance} = \text{No. of Chicks} - \text{Birds Sold} - \text{Cumulative Mortality} - \text{Cumulative Culls}$$
3. **Cumulative Mortality & Culls:**
   $$\text{Farm Total Mortality} = \sum_{\text{past}} \text{Mortality} + \text{Today's Mortality}$$
   $$\text{Farm Total Culls} = \sum_{\text{past}} \text{Culls} + \text{Today's Culls}$$
4. **Feed Balance Formula:**
   $$\text{Total Supply} = \sum_{\text{receipts } \le \text{ today}} \text{Quantity}$$
   $$\text{Feed Balance} = \text{Total Supply} - \text{Feed Out} - \text{Cumulative Consumed} - \text{Today's Consumed}$$
5. **Sample Feed Types & Mortality Reasons:**
   - Feed types configured: `Pre-Starter`, `Starter`, `Finisher`.
   - Mortality reasons configured: `Attack`, `Disease`, `Heat Stress`, `Leg Problem`, `Other`.
   *Both lists are modular and configured in `src/config/formConfig.js`.*

---

## 🔌 Switching to the Real Company Backend (Future Integration)

The application is structured with a modular service layer ready for real API integration:

1. Open `src/config/appConfig.js` and change `DATA_MODE`:
   ```javascript
   // src/config/appConfig.js
   export const appConfig = {
     DATA_MODE: 'api', // Change from 'demo' to 'api'
     ...
   };
   ```
2. Configure the production endpoint in `src/config/apiConfig.js`:
   ```javascript
   // src/config/apiConfig.js
   export const apiConfig = {
     BASE_URL: 'https://poultryflo.spbf.co.in/api/v1',
     ...
   };
   ```
3. Each service file in `src/services/` (`authService.js`, `branchService.js`, `farmService.js`, `transactionService.js`) contains structured `TODO` blocks showing the exact `apiClient.get()` and `apiClient.post()` invocations.

---

## ❓ Information Still Needed from the Company

Before moving from demo to production pilot, the following details should be requested from the company ("sir" / IT team):

1. **Broiler Record Desktop Screenshot:** To ensure the mobile Broiler Record matches the exact layout, table headers, and columns of the web portal.
2. **Official Feed Types & Bag Sizes:** The exact company list of feed products and whether feed is tracked in kg, 50kg bags, or both.
3. **Official Mortality Reasons:** The complete list of standard mortality reasons accepted in the company's ERP.
4. **FCR & Performance Metrics:** Confirmation of formulas for Feed Conversion Ratio (FCR), European Production Efficiency Factor (EPEF), and Standard vs Actual ABW tables.
5. **Policy on Missed Days:** Confirmation that missed days cannot be backdated under any circumstances, or if an administrative supervisor override role exists.
6. **API Specifications & Auth:** REST/GraphQL API documentation, authentication method (OAuth2, JWT, or Session Cookie), and offline sync protocol for remote areas without mobile connectivity.
