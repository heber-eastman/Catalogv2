import * as React from "react";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";

export type CustomerStatus = "lead" | "trial" | "active" | "frozen" | "cancelled" | "former";

interface StatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

const statusConfig: Record<CustomerStatus, { label: string; className: string }> = {
  lead: {
    label: "Lead",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  },
  trial: {
    label: "Trial",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
  },
  frozen: {
    label: "Frozen",
    className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
  },
  former: {
    label: "Former",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
