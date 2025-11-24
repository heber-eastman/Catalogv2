import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useApiClient } from "../../../hooks/useApiClient";
import { toast } from "sonner@2.0.3";

interface ApiMembershipPlan {
  id: string;
  name: string;
  cadence: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "TRIAL", label: "Trial" },
];

interface AssignMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  currentPlanId?: string;
  onSuccess?: () => void | Promise<void>;
}

const formatCurrency = (amountCents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);

export function AssignMembershipDialog({
  open,
  onOpenChange,
  customerId,
  currentPlanId,
  onSuccess,
}: AssignMembershipDialogProps) {
  const apiClient = useApiClient();
  const [plans, setPlans] = React.useState<ApiMembershipPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = React.useState(false);
  const [plansError, setPlansError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState(() => ({
    membershipPlanId: currentPlanId ?? "",
    startDate: new Date().toISOString().slice(0, 10),
    status: "ACTIVE",
    renewalDate: "",
  }));
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const loadPlans = React.useCallback(async () => {
    setPlansError(null);
    setIsLoadingPlans(true);
    try {
      const response = await apiClient<ApiMembershipPlan[]>(
        "/api/settings/customers/membership-plans"
      );
      setPlans(response.filter((plan) => plan.isActive));
    } catch (error) {
      setPlansError(
        error instanceof Error ? error.message : "Unable to load membership plans."
      );
    } finally {
      setIsLoadingPlans(false);
    }
  }, [apiClient]);

  React.useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open, loadPlans]);

  React.useEffect(() => {
    if (currentPlanId) {
      setFormData((prev) => ({ ...prev, membershipPlanId: currentPlanId }));
    }
  }, [currentPlanId, open]);

  const resetForm = () => {
    setFormData({
      membershipPlanId: currentPlanId ?? "",
      startDate: new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
      renewalDate: "",
    });
    setSubmitError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!formData.membershipPlanId) {
      setSubmitError("Please select a membership plan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = {
        membershipPlanId: formData.membershipPlanId,
        startDate: formData.startDate,
        status: formData.status,
      };
      if (formData.renewalDate) {
        payload.renewalDate = formData.renewalDate;
      }

      await apiClient(`/api/customers/${customerId}/membership`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Membership assigned");
      await onSuccess?.();
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to assign membership.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Membership Plan</DialogTitle>
          <DialogDescription>
            Select a membership plan and start date for this customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="membershipPlan">Membership Plan</Label>
            <Select
              value={formData.membershipPlanId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, membershipPlanId: value }))
              }
              disabled={isLoadingPlans}
            >
              <SelectTrigger id="membershipPlan">
                <SelectValue
                  placeholder={
                    isLoadingPlans ? "Loading plans..." : "Select a membership plan"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} · {formatCurrency(plan.priceCents, plan.currency)} ·{" "}
                    {plan.cadence.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {plansError && (
              <p className="text-sm text-destructive">
                {plansError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, startDate: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalDate">Renewal Date (optional)</Label>
            <Input
              id="renewalDate"
              type="date"
              value={formData.renewalDate}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, renewalDate: event.target.value }))
              }
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Membership"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

