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
    tint: '#8B7CFF',

    // Core surfaces
    background: '#0C0D12',
    foreground: '#F7F8FC',

    // Cards / elevated surfaces
    card: '#171922',
    cardForeground: '#F7F8FC',

    // Primary action color (buttons, links, active states)
    primary: '#8B7CFF',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#222431',
    secondaryForeground: '#F7F8FC',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#242632',
    mutedForeground: '#9295A5',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#312D58',
    accentForeground: '#D9D5FF',

    // Destructive actions (delete, error states)
    destructive: '#FF6B81',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#272A37',
    input: '#2D3040',
  },

  dark: {
    text: '#F7F8FC',
    tint: '#8B7CFF',
    background: '#0C0D12',
    foreground: '#F7F8FC',
    card: '#171922',
    cardForeground: '#F7F8FC',
    primary: '#8B7CFF',
    primaryForeground: '#FFFFFF',
    secondary: '#222431',
    secondaryForeground: '#F7F8FC',
    muted: '#242632',
    mutedForeground: '#9295A5',
    accent: '#312D58',
    accentForeground: '#D9D5FF',
    destructive: '#FF6B81',
    destructiveForeground: '#FFFFFF',
    border: '#272A37',
    input: '#2D3040',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
