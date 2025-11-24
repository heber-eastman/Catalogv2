import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { History } from "lucide-react";

type ChangeCategory = "membership" | "contact" | "profile" | "household" | "billing" | "other";

interface ChangeRecord {
  id: string;
  timestamp: string;
  staffUser: string;
  category: ChangeCategory;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
}

interface ChangeHistoryTabProps {
  changes: ChangeRecord[];
}

const categoryConfig: Record<ChangeCategory, { label: string; color: string }> = {
  membership: {
    label: "Membership",
    color: "bg-purple-100 text-purple-800",
  },
  contact: {
    label: "Contact",
    color: "bg-blue-100 text-blue-800",
  },
  profile: {
    label: "Profile",
    color: "bg-green-100 text-green-800",
  },
  household: {
    label: "Household",
    color: "bg-orange-100 text-orange-800",
  },
  billing: {
    label: "Billing",
    color: "bg-yellow-100 text-yellow-800",
  },
  other: {
    label: "Other",
    color: "bg-gray-100 text-gray-800",
  },
};

export function ChangeHistoryTab({ changes }: ChangeHistoryTabProps) {
  const [filterCategory, setFilterCategory] = React.useState<string>("all");

  const filteredChanges = React.useMemo(() => {
    if (filterCategory === "all") return changes;
    return changes.filter((change) => change.category === filterCategory);
  }, [changes, filterCategory]);

  if (changes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3>No Change History</h3>
              <p className="text-muted-foreground">
                No changes have been recorded for this customer yet.
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
          <CardTitle>Change History</CardTitle>
          <div className="w-full sm:w-auto">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="membership">Membership</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left" scope="col">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Staff User
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Field Changed
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    Old Value
                  </th>
                  <th className="px-4 py-3 text-left" scope="col">
                    New Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {filteredChanges.map((change) => (
                  <tr key={change.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {change.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {change.staffUser}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={categoryConfig[change.category].color}
                      >
                        {categoryConfig[change.category].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{change.fieldChanged}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="block max-w-xs truncate">
                        {change.oldValue || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-xs truncate">
                        {change.newValue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline View for Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {filteredChanges.map((change, index) => (
            <div key={change.id} className="relative">
              {/* Timeline line */}
              {index < filteredChanges.length - 1 && (
                <div
                  className="absolute left-5 top-12 bottom-0 w-px bg-border"
                  aria-hidden="true"
                />
              )}

              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <p>{change.fieldChanged}</p>
                          <p className="text-muted-foreground">
                            {change.timestamp} • {change.staffUser}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={categoryConfig[change.category].color}
                        >
                          {categoryConfig[change.category].label}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-muted-foreground">Old Value:</p>
                          <p className="truncate">{change.oldValue || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">New Value:</p>
                          <p className="truncate">{change.newValue}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredChanges.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No changes found for the selected category
          </p>
        )}
      </CardContent>
    </Card>
  );
}
