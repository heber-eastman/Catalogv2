import * as React from "react";
import { Users, CreditCard, Calendar } from "lucide-react";

interface CustomerInfoStripProps {
  householdRole: "Head of household" | "Household member";
  membershipPlan: string | null;
  membershipStatus: string;
  nextRenewalDate: string | null;
}

export function CustomerInfoStrip({
  householdRole,
  membershipPlan,
  membershipStatus,
  nextRenewalDate,
}: CustomerInfoStripProps) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Household Role */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">Role:</span>
          <span>{householdRole}</span>
        </div>

        {/* Membership Info */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Plan:</span>
            <span>{membershipPlan || "None"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <span>{membershipStatus}</span>
          </div>

          {nextRenewalDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Next Renewal:</span>
              <span>{nextRenewalDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
