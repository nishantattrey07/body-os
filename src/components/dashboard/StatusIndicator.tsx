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
    <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm border border-zinc-100">
      <span className={cn("h-3 w-3 rounded-full animate-pulse", config.color)}></span>
      <span className={cn("text-lg font-bold uppercase tracking-widest font-heading", config.text)}>
        {label || config.defaultLabel}
      </span>
    </div>
  );
}
