import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "../ui/utils";

interface Activity {
  id: string;
  customerName: string;
  customerInitials: string;
  action: string;
  type: "new" | "updated" | "cancelled" | "frozen";
  timestamp: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
  className?: string;
}

const activityTypeConfig = {
  new: {
    label: "New",
    variant: "default" as const,
  },
  updated: {
    label: "Updated",
    variant: "secondary" as const,
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive" as const,
  },
  frozen: {
    label: "Frozen",
    variant: "outline" as const,
  },
};

export function RecentActivityCard({
  activities,
  className,
}: RecentActivityCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityTypeConfig[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted">
                    {activity.customerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate">{activity.customerName}</p>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="text-muted-foreground">{activity.action}</p>
                  <p className="text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
