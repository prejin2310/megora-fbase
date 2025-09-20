// Map common & jewelry-relevant color names to HEX codes
export const COLOR_MAP = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  black: "#111111",
  white: "#FFFFFF",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  "rose gold": "#B76E79",
  "sea green":"#66aea5",
  platinum: "#E5E4E2",
  emerald: "#0e8636ff",
  ruby: "#E0115F",
  sapphire: "#0F52BA",
  pearl: "#F8F7F2",
  pink: "#EC4899",
  purple: "#8B5CF6",
  violet: "#301934",
  brown: "#92400E",
  orange: "#F97316",
  grey: "#9CA3AF",
  gray: "#9CA3AF",
  beige: "#F5F5DC",
  navy: "#1F2A44",
  teal: "#0D9488",
  olive: "#556B2F",
};

// Accepts a name or a #hex; falls back to neutral gray
export function getColorCode(name) {
  if (!name) return "#D1D5DB";
  const n = String(name).trim();
  if (n.startsWith("#") && (n.length === 4 || n.length === 7)) return n;
  return COLOR_MAP[n.toLowerCase()] || "#D1D5DB";
}
