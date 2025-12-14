import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "ready" | "maintenance" | "warning";
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const statusConfig = {
    ready: { color: "bg-energy", text: "text-energy", defaultLabel: "System Ready" },
    maintenance: { color: "bg-secondary", text: "text-secondary", defaultLabel: "Maintenance" },
    warning: { color: "bg-primary", text: "text-primary", defaultLabel: "Action Required" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm border border-zinc-100">
      <span className={cn("h-2 w-2 rounded-full animate-pulse", config.color)}></span>
      <span className={cn("text-xs font-bold uppercase tracking-widest font-heading", config.text)}>
        {label || config.defaultLabel}
      </span>
    </div>
  );
}
