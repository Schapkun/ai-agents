import { type ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

/*
 * Design Systeem — alle UI componenten op één plek.
 * Kleuren veranderen? Doe het hier, werkt overal.
 */

// ─── Kleuren ────────────────────────────────────────
export const colors = {
  bg:           "#212121",
  sidebar:      "#171717",
  surface:      "bg-white/[0.04]",
  surfaceHover: "hover:bg-white/[0.06]",
  border:       "border-white/[0.08]",
  borderSubtle: "border-white/[0.05]",
  divider:      "divide-white/[0.05]",
  textTitle:    "text-white",
  textContent:  "text-[#9b9b9b]",
  textMuted:    "text-[#666]",
  textBtn:      "text-[#9b9b9b]",
  btnBg:        "bg-white/[0.04]",
  btnHover:     "hover:bg-white/[0.08]",
} as const;

// ─── Pagina Header ──────────────────────────────────
export function PageHeader({ title, subtitle, right }: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className={`text-2xl font-semibold tracking-tight ${colors.textTitle}`}>{title}</h1>
        {subtitle && <p className={`text-sm ${colors.textMuted} mt-1`}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// ─── Sectie Card (dashboard secties, tabel containers) ─
export function SectionCard({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${colors.surface} backdrop-blur-sm rounded-xl ${colors.border} border overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ─── Sectie Header (in een SectionCard) ─────────────
export function SectionHeader({ title, href }: {
  title: string;
  href?: string;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 border-b ${colors.borderSubtle}`}>
      <h2 className={`text-sm font-medium ${colors.textTitle}`}>{title}</h2>
      {href && (
        <Link href={href} className={`flex items-center gap-1 text-xs ${colors.textMuted} hover:text-[#9b9b9b] transition-colors`}>
          Alles <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

// ─── Tabel Header kolom ─────────────────────────────
export function Th({ children, align = "left", className = "" }: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th className={`text-${align} px-4 py-2.5 text-[10px] font-medium ${colors.textMuted} uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

// ─── Tabel Data cel ─────────────────────────────────
export function Td({ children, align = "left", mono = false, muted = false, className = "" }: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <td className={`text-${align} px-4 py-2.5 text-sm ${muted ? colors.textMuted : colors.textContent} ${mono ? "font-mono" : ""} ${className}`}>
      {children}
    </td>
  );
}

// ─── Tabel Rij ──────────────────────────────────────
export function Tr({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`${colors.surfaceHover} transition-colors ${className}`}>
      {children}
    </tr>
  );
}

// ─── Lijst Item (voor dashboard secties) ────────────
export function ListItem({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-2 ${colors.surfaceHover} transition-colors ${className}`}>
      {children}
    </div>
  );
}

// ─── Actie Knop (tekst knop) ────────────────────────
export function ActionButton({ children, onClick, variant = "default", disabled = false }: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger" | "primary";
  disabled?: boolean;
}) {
  const styles = {
    default: `${colors.textBtn} ${colors.btnBg} ${colors.btnHover}`,
    danger: "text-red-400 bg-red-500/10 hover:bg-red-500/20",
    primary: "text-[#171717] bg-white hover:bg-white/90 font-medium",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${styles[variant]} ${disabled ? "opacity-30" : ""}`}
    >
      {children}
    </button>
  );
}

// ─── Stat Badge (inline metrics) ────────────────────
export function InlineStats({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className={`flex items-center gap-4 text-xs font-mono ${colors.textContent}`}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className={`${colors.textMuted} mr-4`}>|</span>}
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={`flex gap-1 mb-6 ${colors.surface} rounded-lg p-1 w-fit border ${colors.borderSubtle}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            active === tab.id
              ? "bg-white/[0.08] text-white font-medium"
              : `${colors.textMuted} hover:text-[#999]`
          }`}
        >
          {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
        </button>
      ))}
    </div>
  );
}

// ─── Lege state ─────────────────────────────────────
export function EmptyState({ icon: Icon, message, sub }: {
  icon: LucideIcon;
  message: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colors.surface} mb-3`}>
        <Icon className={`h-5 w-5 ${colors.textMuted}`} />
      </div>
      <p className={`text-sm ${colors.textMuted}`}>{message}</p>
      {sub && <p className={`text-xs ${colors.textMuted} mt-1`}>{sub}</p>}
    </div>
  );
}
