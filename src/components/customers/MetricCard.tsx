import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl tracking-tight">{value}</span>
          </div>
          {trend && (
            <p
              className={cn(
                "text-muted-foreground",
                isPositiveTrend && "text-success",
                isNegativeTrend && "text-destructive"
              )}
            >
              <span aria-label={`${isPositiveTrend ? "Increase" : "Decrease"} of ${Math.abs(trend.value)}`}>
                {isPositiveTrend ? "+" : ""}
                {trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
