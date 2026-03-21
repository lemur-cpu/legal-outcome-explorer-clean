import { cn } from "@/lib/utils";
import type { OutcomeType } from "@/lib/types";

const outcomeConfig: Partial<Record<OutcomeType, { label: string; className: string }>> = {
  affirmed: {
    label: "Affirmed",
    className: "bg-affirmed-muted text-affirmed border border-affirmed/20",
  },
  reversed: {
    label: "Reversed",
    className: "bg-reversed-muted text-reversed border border-reversed/20",
  },
  remanded: {
    label: "Remanded",
    className: "bg-highlight-muted text-highlight border border-highlight/20",
  },
  settled: {
    label: "Settled",
    className: "bg-accent-muted text-accent border border-accent/20",
  },
};

interface OutcomeBadgeProps {
  outcome: OutcomeType;
  className?: string;
}

export function OutcomeBadge({ outcome, className }: OutcomeBadgeProps) {
  const config = outcomeConfig[outcome] ?? {
    label: outcome,
    className: "bg-surface-elevated text-text-secondary border border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium tracking-wide uppercase",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variant === "default" && "bg-accent-muted text-accent",
        variant === "secondary" && "bg-surface-elevated text-text-secondary",
        variant === "outline" && "border border-border text-text-secondary",
        className
      )}
    >
      {children}
    </span>
  );
}
