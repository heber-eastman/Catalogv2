import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  CreditCard,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Gift,
  Plus,
  Edit,
} from "lucide-react";

interface MembershipData {
  hasMembership: boolean;
  currentMembership?: {
    planName: string;
    status: "active" | "frozen" | "cancelled" | "trial";
    scope: "organization" | "specific-locations";
    locations?: string[];
    startDate: string;
    endDate?: string;
    renewalDate?: string;
    cadence: string;
    price: string;
    termType: string;
    introductoryPeriod?: string;
  };
  pastMemberships: Array<{
    id: string;
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }>;
}

interface MembershipTabProps {
  data: MembershipData;
}

export function MembershipTab({ data }: MembershipTabProps) {
  const [showChangeStatus, setShowChangeStatus] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");

  // No membership state
  if (!data.hasMembership) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3>No Active Membership</h3>
                <p className="text-muted-foreground">
                  This customer does not have an active membership plan. Assign a
                  plan to get started.
                </p>
              </div>
              <Button onClick={() => console.log("Assign plan")} className="gap-2">
                <Plus className="h-4 w-4" />
                Assign Membership Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Past Memberships */}
        {data.pastMemberships.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Memberships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.pastMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p>{membership.planName}</p>
                        <p className="text-muted-foreground">
                          {membership.startDate} - {membership.endDate}
                        </p>
                        {membership.reason && (
                          <p className="text-muted-foreground">
                            Reason: {membership.reason}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">{membership.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Has active membership
  const membership = data.currentMembership!;
  const statusConfig = {
    active: { label: "Active", className: "bg-green-100 text-green-800" },
    frozen: { label: "Frozen", className: "bg-cyan-100 text-cyan-800" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
    trial: { label: "Trial", className: "bg-purple-100 text-purple-800" },
  };

  return (
    <div className="space-y-6">
      {/* Current Membership Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Current Membership</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangeStatus(!showChangeStatus)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Change Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log("Change plan")}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Change Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Name and Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3>{membership.planName}</h3>
            <Badge className={statusConfig[membership.status].className}>
              {statusConfig[membership.status].label}
            </Badge>
          </div>

          {/* Scope */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground">Scope</p>
              <p>
                {membership.scope === "organization"
                  ? "Organization-wide"
                  : membership.locations?.join(", ")}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p>{membership.startDate}</p>
              </div>
            </div>

            {membership.endDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p>{membership.endDate}</p>
                </div>
              </div>
            )}

            {membership.renewalDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Renewal Date</p>
                  <p>{membership.renewalDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Plan Details */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Cadence</p>
                <p>{membership.cadence}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Price</p>
                <p>{membership.price}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Term Type</p>
                <p>{membership.termType}</p>
              </div>
            </div>

            {membership.introductoryPeriod && (
              <div className="flex items-start gap-3">
                <Gift className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Intro Period</p>
                  <p>{membership.introductoryPeriod}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Status Form */}
      {showChangeStatus && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Change Membership Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newStatus">New Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="newStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input id="effectiveDate" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusReason">Reason</Label>
              <Select value={statusReason} onValueChange={setStatusReason}>
                <SelectTrigger id="statusReason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-request">Customer Request</SelectItem>
                  <SelectItem value="payment-issue">Payment Issue</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="relocation">Relocation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about this status change..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowChangeStatus(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => console.log("Update status")}>
                Update Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Memberships */}
      <Card>
        <CardHeader>
          <CardTitle>Past Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          {data.pastMemberships.length > 0 ? (
            <div className="space-y-3">
              {data.pastMemberships.map((membership) => (
                <div
                  key={membership.id}
                  className="p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p>{membership.planName}</p>
                      <p className="text-muted-foreground">
                        {membership.startDate} - {membership.endDate}
                      </p>
                      {membership.reason && (
                        <p className="text-muted-foreground">
                          Reason: {membership.reason}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">{membership.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No past memberships
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
