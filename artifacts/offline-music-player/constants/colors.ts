/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F7F8FC',
    tint: '#A78BFA',

    // Core surfaces
    background: '#0C0D12',
    foreground: '#F7F8FC',

    // Cards / elevated surfaces
    card: '#171922',
    cardForeground: '#F7F8FC',

    // Primary action color (buttons, links, active states)
    primary: '#A78BFA',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#1D2436',
    secondaryForeground: '#F7F8FC',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#22283B',
    mutedForeground: '#9295A5',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#30275F',
    accentForeground: '#E0DAFF',
    highlight: '#4DE6C2',

    // Destructive actions (delete, error states)
    destructive: '#FF6B81',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#2A2E46',
    input: '#303650',
  },

  dark: {
    text: '#F7F8FC',
    tint: '#A78BFA',
    background: '#0C0D12',
    foreground: '#F7F8FC',
    card: '#171922',
    cardForeground: '#F7F8FC',
    primary: '#A78BFA',
    primaryForeground: '#FFFFFF',
    secondary: '#1D2436',
    secondaryForeground: '#F7F8FC',
    muted: '#22283B',
    mutedForeground: '#9295A5',
    accent: '#30275F',
    accentForeground: '#E0DAFF',
    highlight: '#4DE6C2',
    destructive: '#FF6B81',
    destructiveForeground: '#FFFFFF',
    border: '#2A2E46',
    input: '#303650',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
