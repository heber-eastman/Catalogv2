import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { ExternalLink } from "lucide-react";

type BillingStatus = "paid" | "pending" | "failed" | "refunded";

interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: BillingStatus;
  invoiceUrl?: string;
}

interface BillingHistoryTabProps {
  records: BillingRecord[];
}

const statusConfig: Record<BillingStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  refunded: {
    label: "Refunded",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
};

export function BillingHistoryTab({ records }: BillingHistoryTabProps) {
  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3>No Billing History</h3>
              <p className="text-muted-foreground">
                No billing records found for this customer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Billing History</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Export billing history")}
            >
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left" scope="col">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right" scope="col">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center" scope="col">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-md truncate">
                        {record.description}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {record.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={statusConfig[record.status].className}
                      >
                        {statusConfig[record.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.invoiceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(record.invoiceUrl, "_blank")}
                          aria-label={`View invoice for ${record.description}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{record.description}</p>
                    <p className="text-muted-foreground">{record.date}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusConfig[record.status].className}
                  >
                    {statusConfig[record.status].label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <p>{record.amount}</p>
                  {record.invoiceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(record.invoiceUrl, "_blank")}
                      className="gap-2"
                    >
                      View Invoice
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}