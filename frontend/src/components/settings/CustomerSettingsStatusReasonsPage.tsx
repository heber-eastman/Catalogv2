import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { useApiClient } from "../../hooks/useApiClient";

interface StatusReason {
  id: string;
  label: string;
  sortOrder: number;
  type: "CANCELLATION" | "FREEZE";
}

export function CustomerSettingsStatusReasonsPage() {
  const apiClient = useApiClient();
  const [cancellationReasons, setCancellationReasons] = React.useState<StatusReason[]>([]);
  const [freezeReasons, setFreezeReasons] = React.useState<StatusReason[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isPersistingOrder, setIsPersistingOrder] = React.useState(false);
  const [newCancellationReason, setNewCancellationReason] = React.useState("");
  const [newFreezeReason, setNewFreezeReason] = React.useState("");
  const [draggedItem, setDraggedItem] = React.useState<{
    type: "cancellation" | "freeze";
    index: number;
  } | null>(null);

  const loadReasons = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [cancellations, freezes] = await Promise.all([
        apiClient<StatusReason[]>(
          "/api/settings/customers/status-reasons?type=CANCELLATION"
        ),
        apiClient<StatusReason[]>(
          "/api/settings/customers/status-reasons?type=FREEZE"
        ),
      ]);
      setCancellationReasons(cancellations);
      setFreezeReasons(freezes);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  React.useEffect(() => {
    loadReasons();
  }, [loadReasons]);

  const handleAddCancellationReason = async () => {
    const label = newCancellationReason.trim();
    if (!label) return;
    try {
      const created = await apiClient<StatusReason>(
        "/api/settings/customers/status-reasons",
        {
          method: "POST",
          body: JSON.stringify({ type: "CANCELLATION", label }),
        }
      );
      setCancellationReasons((prev) => [...prev, created]);
      setNewCancellationReason("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddFreezeReason = async () => {
    const label = newFreezeReason.trim();
    if (!label) return;
    try {
      const created = await apiClient<StatusReason>(
        "/api/settings/customers/status-reasons",
        {
          method: "POST",
          body: JSON.stringify({ type: "FREEZE", label }),
        }
      );
      setFreezeReasons((prev) => [...prev, created]);
      setNewFreezeReason("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteCancellationReason = async (id: string) => {
    try {
      await apiClient<void>(
        `/api/settings/customers/status-reasons/${id}`,
        { method: "DELETE" }
      );
      setCancellationReasons((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteFreezeReason = async (id: string) => {
    try {
      await apiClient<void>(
        `/api/settings/customers/status-reasons/${id}`,
        { method: "DELETE" }
      );
      setFreezeReasons((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDragStart = (
    type: "cancellation" | "freeze",
    index: number
  ) => {
    setDraggedItem({ type, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const persistOrder = React.useCallback(
    async (type: "cancellation" | "freeze", reasons: StatusReason[]) => {
      setIsPersistingOrder(true);
      try {
        await Promise.all(
          reasons.map((reason, index) =>
            apiClient(`/api/settings/customers/status-reasons/${reason.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                sortOrder: index + 1,
              }),
            })
          )
        );
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsPersistingOrder(false);
      }
    },
    [apiClient]
  );

  const handleDrop = (
    type: "cancellation" | "freeze",
    dropIndex: number
  ) => {
    if (!draggedItem || draggedItem.type !== type) return;

    const reasons =
      type === "cancellation" ? cancellationReasons : freezeReasons;
    const newReasons = [...reasons];
    const [removed] = newReasons.splice(draggedItem.index, 1);
    newReasons.splice(dropIndex, 0, removed);

    // Update order values
    const reordered = newReasons.map((reason, index) => ({
      ...reason,
      sortOrder: index + 1,
    }));

    if (type === "cancellation") {
      setCancellationReasons(reordered);
    } else {
      setFreezeReasons(reordered);
    }

    persistOrder(type, reordered);

    setDraggedItem(null);
  };

  const renderReasonsList = (
    reasons: StatusReason[],
    type: "cancellation" | "freeze",
    onDelete: (id: string) => void
  ) => {
    if (isLoading) {
      return (
        <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
          Loading reasons...
        </div>
      );
    }

    if (reasons.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
          <p>No {type} reasons configured</p>
          <p className="text-sm">Add a reason below to get started</p>
        </div>
      );
    }

    return (
      <ul className="space-y-2" role="list">
        {reasons.map((reason, index) => (
          <li
            key={reason.id}
            draggable
            onDragStart={() => handleDragStart(type, index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(type, index)}
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-move group"
          >
            <GripVertical
              className="h-4 w-4 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <span className="flex-1">{reason.label}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(reason.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Delete ${reason.label}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2>Status Reasons</h2>
        <p className="text-muted-foreground">
          Define reasons for membership status changes (cancellations and freezes)
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md p-3">
          {error}
        </div>
      )}
      {isPersistingOrder && (
        <p className="text-sm text-muted-foreground">
          Saving reason order...
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cancellation Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Reasons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderReasonsList(
              cancellationReasons,
              "cancellation",
              handleDeleteCancellationReason
            )}

            {/* Add New Reason */}
            <div className="pt-4 border-t border-border space-y-2">
              <label htmlFor="new-cancellation-reason" className="sr-only">
                Add new cancellation reason
              </label>
              <div className="flex gap-2">
                <Input
                  id="new-cancellation-reason"
                  value={newCancellationReason}
                  onChange={(e) => setNewCancellationReason(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCancellationReason();
                    }
                  }}
                  placeholder="Enter a reason..."
                />
                <Button
                  onClick={handleAddCancellationReason}
                  disabled={!newCancellationReason.trim()}
                  className="gap-2 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <p className="text-muted-foreground">
                Drag and drop to reorder reasons
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Freeze Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Freeze Reasons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderReasonsList(
              freezeReasons,
              "freeze",
              handleDeleteFreezeReason
            )}

            {/* Add New Reason */}
            <div className="pt-4 border-t border-border space-y-2">
              <label htmlFor="new-freeze-reason" className="sr-only">
                Add new freeze reason
              </label>
              <div className="flex gap-2">
                <Input
                  id="new-freeze-reason"
                  value={newFreezeReason}
                  onChange={(e) => setNewFreezeReason(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddFreezeReason();
                    }
                  }}
                  placeholder="Enter a reason..."
                />
                <Button
                  onClick={handleAddFreezeReason}
                  disabled={!newFreezeReason.trim()}
                  className="gap-2 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <p className="text-muted-foreground">
                Drag and drop to reorder reasons
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3>How to use status reasons</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                These reasons appear when staff changes a customer's membership
                status
              </li>
              <li>
                Drag reasons to reorder them - the order affects how they appear
                in dropdowns
              </li>
              <li>
                Use clear, specific reasons to help track trends and improve
                retention
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
