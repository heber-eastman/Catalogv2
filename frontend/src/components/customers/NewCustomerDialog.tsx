import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useApiClient } from "../../hooks/useApiClient";
import { toast } from "sonner@2.0.3";

const STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "TRIAL", label: "Trial" },
  { value: "ACTIVE", label: "Active" },
  { value: "FROZEN", label: "Frozen" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FORMER", label: "Former" },
];

interface ApiLocation {
  id: string;
  name: string;
  isActive: boolean;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phone: "",
  status: "LEAD",
};

export interface ApiCustomer {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customer: ApiCustomer) => void;
}

export function NewCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: NewCustomerDialogProps) {
  const apiClient = useApiClient();
  const [formData, setFormData] = React.useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [defaultLocationId, setDefaultLocationId] = React.useState<string | null>(null);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setError(null);
  };

  const evaluateLocations = React.useCallback(
    async () => {
      try {
        const locations = await apiClient<ApiLocation[]>("/api/settings/customers/locations");
        const activeLocations = locations.filter((location) => location.isActive);
        if (activeLocations.length === 1) {
          setDefaultLocationId(activeLocations[0].id);
        } else {
          setDefaultLocationId(null);
        }
      } catch {
        setDefaultLocationId(null);
      }
    },
    [apiClient],
  );

  React.useEffect(() => {
    if (open) {
      evaluateLocations();
    }
  }, [open, evaluateLocations]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      setDefaultLocationId(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        preferredName: formData.preferredName.trim() || null,
        primaryEmail: formData.email.trim() || null,
        primaryPhone: formData.phone.trim() || null,
        status: formData.status,
        primaryLocationId: defaultLocationId ?? undefined,
      };

      const created = await apiClient<ApiCustomer>("/api/customers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Customer created");
      onCreated?.(created);
      handleOpenChange(false);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create customer";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
          <DialogDescription>
            Capture the essential information needed to start a customer record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: event.target.value,
                  }))
                }
                placeholder="Jordan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Garcia"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredName">Preferred name</Label>
            <Input
              id="preferredName"
              value={formData.preferredName}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  preferredName: event.target.value,
                }))
              }
              placeholder="Jordan"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
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

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md px-3 py-2">
              {error}
            </p>
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
              {isSubmitting ? "Creating..." : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

