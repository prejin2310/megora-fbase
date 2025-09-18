// src/components/admin/ui.js

export const cn = (...c) => c.filter(Boolean).join(" ");

export const card =
  "bg-white border border-gray-200 rounded-2xl shadow-sm";
export const cardBody = "p-4 md:p-6";
export const sectionTitle =
  "text-lg font-semibold tracking-tight text-gray-900";
export const subText = "text-sm text-gray-500";

export const inputBase =
  "w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition";

export const selectBase = inputBase;

export const buttonPrimary =
  "inline-flex items-center justify-center h-10 px-4 rounded-xl bg-gray-900 text-white " +
  "hover:bg-black active:scale-[0.99] transition shadow-sm";

export const buttonGhost =
  "inline-flex items-center justify-center h-10 px-4 rounded-xl border border-gray-300 bg-white " +
  "hover:bg-gray-50 active:scale-[0.99] transition";

export const tableWrap = "overflow-x-auto";
export const tableBase = "min-w-full text-sm text-gray-700";
export const thBase =
  "text-left font-semibold text-gray-600 uppercase tracking-wide text-xs py-3 px-3";
export const tdBase =
  "py-3 px-3 align-top border-t border-gray-100";
export const rowHover = "hover:bg-gray-50/70";

export const badge = (tone) => {
  const map = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-800",
    error: "bg-rose-100 text-rose-700",
  };
  return (
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
    (map[tone] || map.neutral)
  );
};
