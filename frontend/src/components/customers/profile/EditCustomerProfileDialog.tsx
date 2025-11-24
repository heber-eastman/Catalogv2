import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Button } from "../../ui/button";
import { useApiClient } from "../../../hooks/useApiClient";
import { toast } from "sonner@2.0.3";

export interface EditCustomerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  defaultValues: {
    firstName: string;
    lastName: string;
    preferredName?: string | null;
    primaryEmail?: string | null;
    primaryPhone?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    canEmail: boolean;
    canSms: boolean;
  };
  onSaved?: () => void | Promise<void>;
}

export function EditCustomerProfileDialog({
  open,
  onOpenChange,
  customerId,
  defaultValues,
  onSaved,
}: EditCustomerProfileDialogProps) {
  const apiClient = useApiClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState(() => ({ ...defaultValues }));

  React.useEffect(() => {
    if (open) {
      setFormData({ ...defaultValues });
    }
  }, [open, defaultValues]);

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient(`/api/customers/${customerId}`, {
        method: "PATCH",
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          preferredName: formData.preferredName?.trim() || null,
          primaryEmail: formData.primaryEmail?.trim() || null,
          primaryPhone: formData.primaryPhone?.trim() || null,
          addressLine1: formData.addressLine1?.trim() || null,
          city: formData.city?.trim() || null,
          state: formData.state?.trim() || null,
          postalCode: formData.postalCode?.trim() || null,
          canEmail: formData.canEmail,
          canSms: formData.canSms,
        }),
      });
      toast.success("Profile updated");
      await onSaved?.();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update profile";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update contact details and communication preferences for this customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(event) => handleChange("firstName", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(event) => handleChange("lastName", event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredName">Preferred name</Label>
            <Input
              id="preferredName"
              value={formData.preferredName ?? ""}
              onChange={(event) => handleChange("preferredName", event.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary email</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail ?? ""}
                onChange={(event) => handleChange("primaryEmail", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary phone</Label>
              <Input
                id="primaryPhone"
                value={formData.primaryPhone ?? ""}
                onChange={(event) => handleChange("primaryPhone", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street address</Label>
            <Input
              id="streetAddress"
              value={formData.addressLine1 ?? ""}
              onChange={(event) => handleChange("addressLine1", event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city ?? ""}
                onChange={(event) => handleChange("city", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state ?? ""}
                onChange={(event) => handleChange("state", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode ?? ""}
                onChange={(event) => handleChange("postalCode", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canEmail">Email communications</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sending emails to this customer.
                </p>
              </div>
              <Switch
                id="canEmail"
                checked={formData.canEmail}
                onCheckedChange={(value) => handleChange("canEmail", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="canSms">SMS communications</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sending text messages to this customer.
                </p>
              </div>
              <Switch
                id="canSms"
                checked={formData.canSms}
                onCheckedChange={(value) => handleChange("canSms", value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

