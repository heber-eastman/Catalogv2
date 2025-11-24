import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { StatusBadge, CustomerStatus } from "../StatusBadge";
import { Badge } from "../../ui/badge";
import { Users, Crown, Plus, UserMinus, UserCog } from "lucide-react";
import { useApiClient } from "../../../hooks/useApiClient";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";

interface HouseholdMember {
  id: string;
  name: string;
  relationship: string;
  status: CustomerStatus;
  isHead: boolean;
}

interface HouseholdData {
  hasHousehold: boolean;
  isHead: boolean;
  headOfHousehold?: {
    id: string;
    name: string;
  };
  members: HouseholdMember[];
}

interface HouseholdTabProps {
  data: HouseholdData;
  currentCustomerId: string;
  onRefresh?: () => void | Promise<void>;
}

interface SearchCustomerResult {
  id: string;
  firstName: string;
  lastName: string;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  status: CustomerStatus;
}

export function HouseholdTab({
  data,
  currentCustomerId,
  onRefresh,
}: HouseholdTabProps) {
  const apiClient = useApiClient();
  const [isCreatingHousehold, setIsCreatingHousehold] = React.useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [relationshipLabel, setRelationshipLabel] = React.useState("");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchCustomerResult[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [connectingCustomerId, setConnectingCustomerId] = React.useState<string | null>(null);

  const [newFirstName, setNewFirstName] = React.useState("");
  const [newLastName, setNewLastName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [isCreatingMember, setIsCreatingMember] = React.useState(false);

  const handleCreateHousehold = React.useCallback(async () => {
    setIsCreatingHousehold(true);
    try {
      await apiClient(`/api/customers/${currentCustomerId}/household`, {
        method: "POST",
      });
      toast.success("Household created");
      await onRefresh?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create household";
      toast.error(message);
    } finally {
      setIsCreatingHousehold(false);
    }
  }, [apiClient, currentCustomerId, onRefresh]);

  const existingMemberIds = React.useMemo(() => {
    const ids = new Set<string>();
    ids.add(currentCustomerId);
    data.members.forEach((member) => ids.add(member.id));
    if (data.headOfHousehold?.id) {
      ids.add(data.headOfHousehold.id);
    }
    return ids;
  }, [currentCustomerId, data]);

  React.useEffect(() => {
    if (!isAddMemberOpen || searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);

    const timeout = setTimeout(() => {
      apiClient<SearchCustomerResult[]>(
        `/api/customers?search=${encodeURIComponent(searchTerm.trim())}`
      )
        .then((results) => {
          if (cancelled) return;
          const filtered = results.filter(
            (customer) => !existingMemberIds.has(customer.id)
          );
          setSearchResults(filtered.slice(0, 6));
        })
        .catch((err) => {
          if (cancelled) return;
          const message =
            err instanceof Error ? err.message : "Unable to search customers";
          setSearchError(message);
        })
        .finally(() => {
          if (!cancelled) {
            setSearchLoading(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [apiClient, existingMemberIds, isAddMemberOpen, searchTerm]);

  const resetDialogState = React.useCallback(() => {
    setRelationshipLabel("");
    setSearchTerm("");
    setSearchResults([]);
    setSearchError(null);
    setConnectingCustomerId(null);
    setNewFirstName("");
    setNewLastName("");
    setNewEmail("");
    setNewPhone("");
    setIsCreatingMember(false);
  }, []);

  const connectExistingMember = React.useCallback(
    async (customerId: string) => {
      setConnectingCustomerId(customerId);
      try {
        await apiClient(`/api/customers/${currentCustomerId}/household/members`, {
          method: "POST",
          body: JSON.stringify({
            customerProfileId: customerId,
            relationship: relationshipLabel.trim() || null,
          }),
        });
        toast.success("Household member added");
        await onRefresh?.();
        setIsAddMemberOpen(false);
        resetDialogState();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to add household member";
        toast.error(message);
      } finally {
        setConnectingCustomerId(null);
      }
    },
    [apiClient, currentCustomerId, onRefresh, relationshipLabel, resetDialogState]
  );

  const handleCreateNewMember = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!newFirstName.trim() || !newLastName.trim()) {
        toast.error("First and last name are required");
        return;
      }

      setIsCreatingMember(true);
      try {
        const created = await apiClient<SearchCustomerResult>(`/api/customers`, {
          method: "POST",
          body: JSON.stringify({
            firstName: newFirstName.trim(),
            lastName: newLastName.trim(),
            primaryEmail: newEmail.trim() || null,
            primaryPhone: newPhone.trim() || null,
            status: "LEAD",
          }),
        });

        await apiClient(`/api/customers/${currentCustomerId}/household/members`, {
          method: "POST",
          body: JSON.stringify({
            customerProfileId: created.id,
            relationship: relationshipLabel.trim() || null,
          }),
        });

        toast.success("Member created and added to household");
        await onRefresh?.();
        setIsAddMemberOpen(false);
        resetDialogState();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to create household member";
        toast.error(message);
      } finally {
        setIsCreatingMember(false);
      }
    },
    [
      apiClient,
      currentCustomerId,
      newEmail,
      newFirstName,
      newLastName,
      newPhone,
      onRefresh,
      relationshipLabel,
      resetDialogState,
    ]
  );

  // Empty state - no household
  if (!data.hasHousehold) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3>No Household</h3>
              <p className="text-muted-foreground">
                This customer is not part of a household. Add them to an existing
                household or create a new one.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Linking to an existing household is coming soon.")
                }
              >
                Add to Existing Household
              </Button>
              <Button onClick={handleCreateHousehold} disabled={isCreatingHousehold}>
                Create Household
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Head of household view
  if (data.isHead) {
    return (
      <>
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Household Members</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.info("Changing the head of household is coming soon.")
                  }
                  className="gap-2"
                >
                  <UserCog className="h-4 w-4" />
                  Change Head
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.members.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border ${
                    member.isHead
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate">{member.name}</p>
                        {member.isHead && (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Head of Household
                          </Badge>
                        )}
                        <StatusBadge status={member.status} />
                      </div>
                      <p className="text-muted-foreground">
                        {member.relationship}
                      </p>
                    </div>

                    {!member.isHead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log("Remove member", member.id)}
                        className="gap-2 shrink-0"
                      >
                        <UserMinus className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Household Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => console.log("Dissolve household")}
              className="w-full sm:w-auto"
            >
              Dissolve Household
            </Button>
            <p className="text-muted-foreground">
              Dissolving the household will remove all members and delete the household.
            </p>
          </CardContent>
        </Card>
        </div>

        <Dialog
          open={isAddMemberOpen}
          onOpenChange={(open) => {
            setIsAddMemberOpen(open);
            if (!open) {
              resetDialogState();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Household Member</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="relationshipLabel">Relationship label (optional)</Label>
                <Input
                  id="relationshipLabel"
                  value={relationshipLabel}
                  onChange={(event) => setRelationshipLabel(event.target.value)}
                  placeholder="Spouse, sibling, parent…"
                />
                <p className="text-sm text-muted-foreground">
                  Applied to whichever member you add below.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Search existing customers</h4>
                <Input
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm.trim().length < 2 && (
                  <p className="text-sm text-muted-foreground">
                    Enter at least two characters to start searching.
                  </p>
                )}
                {searchLoading && (
                  <p className="text-sm text-muted-foreground">Searching…</p>
                )}
                {searchError && (
                  <p className="text-sm text-destructive">{searchError}</p>
                )}
                {!searchLoading &&
                  !searchError &&
                  searchTerm.trim().length >= 2 &&
                  searchResults.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No matching customers found.
                    </p>
                  )}
                <div className="space-y-2">
                  {searchResults.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 border rounded-md flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.primaryEmail ?? "No email on file"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => connectExistingMember(customer.id)}
                        disabled={connectingCustomerId === customer.id}
                      >
                        {connectingCustomerId === customer.id ? "Adding…" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Add a brand new member</h4>
                <form onSubmit={handleCreateNewMember} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newFirstName">First name</Label>
                      <Input
                        id="newFirstName"
                        value={newFirstName}
                        onChange={(event) => setNewFirstName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newLastName">Last name</Label>
                      <Input
                        id="newLastName"
                        value={newLastName}
                        onChange={(event) => setNewLastName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">Email (optional)</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(event) => setNewEmail(event.target.value)}
                        placeholder="member@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPhone">Phone (optional)</Label>
                      <Input
                        id="newPhone"
                        value={newPhone}
                        onChange={(event) => setNewPhone(event.target.value)}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isCreatingMember}>
                    {isCreatingMember ? "Creating…" : "Create and add"}
                  </Button>
                </form>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetDialogState();
                  setIsAddMemberOpen(false);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Household member view (not head)
  return (
    <div className="space-y-6">
      {/* Head of Household Card */}
      {data.headOfHousehold && (
        <Card>
          <CardHeader>
            <CardTitle>Head of Household</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border border-primary bg-primary/5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <p>{data.headOfHousehold.name}</p>
                  </div>
                  <p className="text-muted-foreground">Primary account holder</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("View head profile", data.headOfHousehold?.id)}
                >
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Household Members */}
      <Card>
        <CardHeader>
          <CardTitle>Other Household Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.members
              .filter((member) => !member.isHead && member.id !== currentCustomerId)
              .map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate">{member.name}</p>
                        <StatusBadge status={member.status} />
                      </div>
                      <p className="text-muted-foreground">
                        {member.relationship}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log("View member", member.id)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}

            {data.members.filter(
              (member) => !member.isHead && member.id !== currentCustomerId
            ).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No other household members
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Household Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => console.log("Remove from household")}
            className="w-full sm:w-auto gap-2"
          >
            <UserMinus className="h-4 w-4" />
            Remove from Household
          </Button>
          <p className="text-muted-foreground">
            Removing this member will make them an independent customer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
