/**
 * Central theme matching the existing SPBF / PoultryFlo web application exactly.
 * Colors measured directly from the company website screenshots.
 */

export const colors = {
  appBar: '#394A59',          // Dark slate blue - top bar and menu background
  sidebar: '#394A59',         // Dark slate blue
  logoText: '#FFBF96',        // Soft peach - "SPBF" logo text
  appBarAccent: '#DA8CFF',    // Light purple - branch name and employee ID
  link: '#007AFF',            // Small blue dropdown arrows
  sectionHeader: '#D8DDDE',   // Light grey - section title bars
  sectionHeaderText: '#092F3D', // Dark navy - section bar text
  panelBorder: '#A4C2C5',     // Grey-teal - border around form panels
  tableBorder: '#34AADC',     // Cyan blue - Feed Consumption border / highlight
  inputEditable: '#FFFCF9',   // Cream - editable fields
  inputReadOnly: '#DCE1E2',   // Grey - read-only / calculated fields
  buttonBgStart: '#D2E1E2',   // Button gradient start
  buttonBgEnd: '#A4C2C5',     // Button gradient end / solid fallback
  buttonBg: '#B8D4D6',        // Solid midpoint fallback for button background
  buttonText: '#333333',      // Button text color
  buttonAccentBorder: '#4CD964', // Green border on Broiler Record button
  noteRed: '#FF0000',         // Red note at bottom
  pageBg: '#FFFFFF',          // Page background
  labelText: '#000000',       // Bold field labels
  required: '#FF0000',        // Red asterisk for required fields
  
  // Semantic status colors
  success: '#28A745',
  warning: '#FF8C00',         // Orange hint for late feed rule
  error: '#DC3545',
  info: '#17A2B8',
  
  // Badges & UI helpers
  badgeSaved: '#007AFF',
  badgeSample: '#6C757D',
  cardBg: '#FFFFFF',
  textSecondary: '#555555',
  borderLight: '#D0D7D9',
  shadowColor: '#000000',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  fontFamily: 'System',
  fontSize: {
    tiny: 11,
    small: 13,
    body: 15,
    subtitle: 16,
    title: 18,
    header: 20,
    logo: 22,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const layout = {
  borderRadius: {
    xs: 3,
    sm: 5,
    md: 8,
    lg: 12,
    round: 9999,
  },
  minTouchTarget: 44,
};

export default {
  colors,
  typography,
  spacing,
  layout,
};
