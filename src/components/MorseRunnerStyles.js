
// MorseRunnerStyles.js - Common styles for Morse Runner components

// Gradient background styles
export const gradientStyles = {
  mainBackground: "bg-gradient-to-b from-gray-800/90 to-gray-700/70",
  cardBackground: "bg-gradient-to-b from-gray-800/70 to-gray-900/70",
  headerBackground: "bg-gradient-to-r from-gray-800/60 to-gray-700/60",
  logBackground: "bg-gradient-to-r from-gray-800/70 to-gray-900/70",
  statCardBackground: "bg-gray-900/60 backdrop-blur-sm",
  
  // Button gradients
  startButton: "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600",
  stopButton: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600",
  blueButton: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
  purpleButton: "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600",
  
  // Notification gradients
  greenNotification: "bg-gradient-to-r from-green-600 to-green-500 border border-green-500/50",
  redNotification: "bg-gradient-to-r from-red-600 to-red-500 border border-red-500/50",
  blueNotification: "bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-500/50"
};

// Border styles
export const borderStyles = {
  standard: "border border-gray-700/50",
  light: "border border-gray-600/50",
  accent: "border border-blue-500/50",
  subtle: "border border-gray-700/30"
};

// Input field styles
export const inputStyles = {
  base: "py-3 px-4 bg-gray-900/80 rounded-lg text-white font-mono text-lg focus:outline-none disabled:opacity-60 transition-all duration-200",
  active: "border-blue-500/50 ring-2 ring-blue-500/20",
  inactive: "border-gray-700",
  exchange: "border-purple-500/50 ring-2 ring-purple-500/20"
};

// Button styles
export const buttonStyles = {
  base: "transition-all duration-200 shadow-lg",
  primaryAction: "py-4 px-6 rounded-lg font-medium text-white shadow-lg border",
  iconButton: "p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm",
  inputAction: "ml-2 px-3 rounded-lg shadow-md",
  disabledButton: "disabled:opacity-50 disabled:bg-gray-700"
};

// Text styles
export const textStyles = {
  sectionTitle: "text-lg font-medium mb-2 flex items-center",
  sectionTitleText: "text-gray-300",
  labelText: "text-xs text-gray-400 mb-1 ml-1",
  valueText: "text-lg font-mono text-white",
  captionText: "text-xs text-gray-400",
  badgeText: "text-xs font-medium px-2 py-0.5 rounded-full",
  activeBadge: "bg-blue-900/30 text-blue-400 border border-blue-500/30"
};

// Utility CSS for the circuit pattern background
export const circuitPatternCSS = `
  .bg-circuit-pattern {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23a0aec0' fill-opacity='0.15' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zm-48-50a5 5 0 1 1 0-2h32v-36h-32a5 5 0 1 1 0-2h32V64h-32a5 5 0 1 1 0-2h32v-42z'%3E%3C/path%3E%3C/svg%3E");
  }
`;
