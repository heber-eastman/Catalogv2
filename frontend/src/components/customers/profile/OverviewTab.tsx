import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";

interface CustomerOverviewData {
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  tags: string[];
  membershipPlan: string | null;
  membershipStatus: string;
  joinDate: string;
  nextRenewalDate: string | null;
  recentInteractions: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
  metrics: {
    totalInvoices: number;
    lastPaymentDate: string;
    accountBalance: string;
    lifetimeValue: string;
  };
}

interface OverviewTabProps {
  data: CustomerOverviewData;
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Row - Contact and Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground">Email</p>
                <a
                  href={`mailto:${data.email}`}
                  className="text-primary hover:underline truncate block"
                >
                  {data.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground">Phone</p>
                <a
                  href={`tel:${data.phone}`}
                  className="text-primary hover:underline"
                >
                  {data.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-muted-foreground">Address</p>
                <address className="not-italic">
                  <p>{data.address.street}</p>
                  <p>
                    {data.address.city}, {data.address.state} {data.address.zip}
                  </p>
                </address>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {data.tags.length > 0 ? (
                  data.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No tags assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row - Membership Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Plan</p>
                <p>{data.membershipPlan || "None"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-4 w-4 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Status</p>
                <p>{data.membershipStatus}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground">Join Date</p>
                <p>{data.joinDate}</p>
              </div>
            </div>

            {data.nextRenewalDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Next Renewal</p>
                  <p>{data.nextRenewalDate}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row - Recent Interactions and Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Interactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentInteractions.length > 0 ? (
              <div className="space-y-4">
                {data.recentInteractions.slice(0, 3).map((interaction) => (
                  <div
                    key={interaction.id}
                    className="pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">
                          {interaction.type}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {interaction.description}
                        </p>
                      </div>
                      <p className="text-muted-foreground whitespace-nowrap">
                        {interaction.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent interactions</p>
            )}
          </CardContent>
        </Card>

        {/* Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Total Invoices</p>
                  <p>{data.metrics.totalInvoices}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Last Payment</p>
                  <p>{data.metrics.lastPaymentDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Account Balance</p>
                  <p>{data.metrics.accountBalance}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-muted-foreground">Lifetime Value</p>
                  <p>{data.metrics.lifetimeValue}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
