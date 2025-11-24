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

export function HouseholdTab({
  data,
  currentCustomerId,
  onRefresh,
}: HouseholdTabProps) {
  const apiClient = useApiClient();
  const [isCreatingHousehold, setIsCreatingHousehold] = React.useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [newMemberId, setNewMemberId] = React.useState("");
  const [newMemberRelationship, setNewMemberRelationship] = React.useState("");
  const [isAddingMember, setIsAddingMember] = React.useState(false);

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

  const handleAddMember = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!newMemberId.trim()) {
        toast.error("Enter the customer ID to add");
        return;
      }

      setIsAddingMember(true);
      try {
        await apiClient(`/api/customers/${currentCustomerId}/household/members`, {
          method: "POST",
          body: JSON.stringify({
            customerProfileId: newMemberId.trim(),
            relationship: newMemberRelationship.trim() || null,
          }),
        });
        toast.success("Household member added");
        await onRefresh?.();
        setNewMemberId("");
        setNewMemberRelationship("");
        setIsAddMemberOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to add household member";
        toast.error(message);
      } finally {
        setIsAddingMember(false);
      }
    },
    [apiClient, currentCustomerId, newMemberId, newMemberRelationship, onRefresh]
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

        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={handleAddMember} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Add Household Member</DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="newMemberId">Customer ID</Label>
                <Input
                  id="newMemberId"
                  value={newMemberId}
                  onChange={(event) => setNewMemberId(event.target.value)}
                  placeholder="cust_12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newMemberRelationship">Relationship (optional)</Label>
                <Input
                  id="newMemberRelationship"
                  value={newMemberRelationship}
                  onChange={(event) =>
                    setNewMemberRelationship(event.target.value)
                  }
                  placeholder="Spouse, child, parent…"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(false)}
                  disabled={isAddingMember}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAddingMember}>
                  {isAddingMember ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
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
