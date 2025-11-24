import * as React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Plus, Pencil, CreditCard } from "lucide-react";
import { useApiClient } from "../../hooks/useApiClient";

type BillingCadence = "monthly" | "yearly" | "one-time";
type TermType = "evergreen" | "fixed-term";
type PlanScope = "organization" | "locations";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  cadence: BillingCadence;
  price: number;
  termType: TermType;
  termDuration?: number;
  scope: PlanScope;
  locationIds?: string[];
  introEnabled: boolean;
  introDuration?: number;
  introPrice?: number;
  allowsFamily: boolean;
  maxFamilySize?: number;
  active: boolean;
}

interface ApiMembershipPlan {
  id: string;
  name: string;
  description?: string | null;
  cadence: "MONTHLY" | "YEARLY" | "ONE_TIME";
  priceCents: number;
  currency: string;
  termType: "EVERGREEN" | "FIXED_TERM";
  termMonths?: number | null;
  hasIntroPeriod: boolean;
  introMonths?: number | null;
  introPriceCents?: number | null;
  scopeType: "ORG_WIDE" | "SPECIFIC_LOCATIONS";
  allowsFamilyMembership: boolean;
  maxFamilySize?: number | null;
  isActive: boolean;
  locations: {
    locationId: string;
    location?: { id: string; name: string };
  }[];
}

interface ApiLocation {
  id: string;
  name: string;
}

const cadenceLabels: Record<BillingCadence, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  "one-time": "One-time",
};

const termTypeLabels: Record<TermType, string> = {
  evergreen: "Evergreen",
  "fixed-term": "Fixed-term",
};

const cadenceToEnum: Record<BillingCadence, "MONTHLY" | "YEARLY" | "ONE_TIME"> =
  {
    monthly: "MONTHLY",
    yearly: "YEARLY",
    "one-time": "ONE_TIME",
  };

const cadenceFromEnum = (
  cadence: "MONTHLY" | "YEARLY" | "ONE_TIME"
): BillingCadence => {
  switch (cadence) {
    case "YEARLY":
      return "yearly";
    case "ONE_TIME":
      return "one-time";
    default:
      return "monthly";
  }
};

const termToEnum: Record<TermType, "EVERGREEN" | "FIXED_TERM"> = {
  evergreen: "EVERGREEN",
  "fixed-term": "FIXED_TERM",
};

const termFromEnum = (
  term: "EVERGREEN" | "FIXED_TERM"
): TermType => (term === "FIXED_TERM" ? "fixed-term" : "evergreen");

const scopeToEnum: Record<PlanScope, "ORG_WIDE" | "SPECIFIC_LOCATIONS"> = {
  organization: "ORG_WIDE",
  locations: "SPECIFIC_LOCATIONS",
};

const scopeFromEnum = (
  scope: "ORG_WIDE" | "SPECIFIC_LOCATIONS"
): PlanScope => (scope === "SPECIFIC_LOCATIONS" ? "locations" : "organization");

const mapPlanFromApi = (plan: ApiMembershipPlan): MembershipPlan => ({
  id: plan.id,
  name: plan.name,
  description: plan.description ?? "",
  cadence: cadenceFromEnum(plan.cadence),
  price: plan.priceCents / 100,
  termType: termFromEnum(plan.termType),
  termDuration: plan.termMonths ?? undefined,
  scope: scopeFromEnum(plan.scopeType),
  locationIds: plan.locations?.map((l) => l.locationId) ?? [],
  introEnabled: plan.hasIntroPeriod,
  introDuration: plan.introMonths ?? undefined,
  introPrice: plan.introPriceCents != null ? plan.introPriceCents / 100 : undefined,
  allowsFamily: plan.allowsFamilyMembership,
  maxFamilySize: plan.maxFamilySize ?? undefined,
  active: plan.isActive,
});

const buildPlanPayload = (plan: Partial<MembershipPlan>) => {
  const scopeEnum = scopeToEnum[plan.scope ?? "organization"];
  return {
    name: plan.name ?? "",
    description: plan.description ?? "",
    cadence: cadenceToEnum[plan.cadence ?? "monthly"],
    priceCents: Math.round((plan.price ?? 0) * 100),
    termType: termToEnum[plan.termType ?? "evergreen"],
    termMonths:
      (plan.termType ?? "evergreen") === "fixed-term"
        ? plan.termDuration ?? null
        : null,
    hasIntroPeriod: plan.introEnabled ?? false,
    introMonths:
      plan.introEnabled && plan.introDuration ? plan.introDuration : null,
    introPriceCents:
      plan.introEnabled && plan.introPrice != null
        ? Math.round(plan.introPrice * 100)
        : null,
    scopeType: scopeEnum,
    locationIds:
      scopeEnum === "SPECIFIC_LOCATIONS" ? plan.locationIds ?? [] : [],
    allowsFamilyMembership: plan.allowsFamily ?? false,
    maxFamilySize: plan.allowsFamily ? plan.maxFamilySize ?? null : null,
    isActive: plan.active ?? true,
  };
};

export function CustomerSettingsMembershipPlansPage() {
  const apiClient = useApiClient();
  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [availableLocations, setAvailableLocations] = React.useState<ApiLocation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<MembershipPlan | null>(null);
  const [formData, setFormData] = React.useState<Partial<MembershipPlan>>({
    name: "",
    description: "",
    cadence: "monthly",
    price: 0,
    termType: "evergreen",
    scope: "organization",
    locationIds: [],
    introEnabled: false,
    allowsFamily: false,
    active: true,
  });

  const loadSettings = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [plansResponse, locationsResponse] = await Promise.all([
        apiClient<ApiMembershipPlan[]>("/api/settings/customers/membership-plans"),
        apiClient<ApiLocation[]>("/api/settings/customers/locations"),
      ]);
      setPlans(plansResponse.map(mapPlanFromApi));
      setAvailableLocations(locationsResponse);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleNewPlan = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      cadence: "monthly",
      price: 0,
      termType: "evergreen",
      scope: "organization",
      locationIds: [],
      introEnabled: false,
      allowsFamily: false,
      active: true,
    });
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    setIsSubmitting(true);
    setActionError(null);
    const payload = buildPlanPayload(formData);

    try {
      const endpoint = editingPlan
        ? `/api/settings/customers/membership-plans/${editingPlan.id}`
        : "/api/settings/customers/membership-plans";
      const method = editingPlan ? "PATCH" : "POST";
      const saved = await apiClient<ApiMembershipPlan>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const normalized = mapPlanFromApi(saved);
      setPlans((prev) =>
        editingPlan
          ? prev.map((plan) => (plan.id === normalized.id ? normalized : plan))
          : [...prev, normalized]
      );
      setIsDialogOpen(false);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (planId: string) => {
    const target = plans.find((plan) => plan.id === planId);
    if (!target) return;

    try {
      const updated = await apiClient<ApiMembershipPlan>(
        `/api/settings/customers/membership-plans/${planId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: !target.active }),
        }
      );
      setPlans((prev) =>
            prev.map((plan) => (plan.id === planId ? mapPlanFromApi(updated) : plan))
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLocationToggle = (locationId: string) => {
    const currentLocationIds = formData.locationIds || [];
    const newLocationIds = currentLocationIds.includes(locationId)
      ? currentLocationIds.filter((id) => id !== locationId)
      : [...currentLocationIds, locationId];
    setFormData({ ...formData, locationIds: newLocationIds });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2>Membership Plans</h2>
          <p className="text-muted-foreground">
            Configure membership pricing, terms, and benefits
          </p>
        </div>
        <Button onClick={handleNewPlan} className="gap-2">
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Plans Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading membership plans...
                </div>
              ) : (
                <table className="w-full" role="table">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left" scope="col">
                        Plan Name
                      </th>
                      <th className="px-4 py-3 text-left" scope="col">
                        Cadence
                      </th>
                      <th className="px-4 py-3 text-right" scope="col">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left" scope="col">
                        Term Type
                      </th>
                      <th className="px-4 py-3 text-left" scope="col">
                        Scope
                      </th>
                      <th className="px-4 py-3 text-left" scope="col">
                        Active
                      </th>
                      <th className="px-4 py-3 text-right" scope="col">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              {plan.name}
                            </div>
                            {plan.allowsFamily && (
                              <Badge variant="secondary" className="text-xs">
                                Family (max {plan.maxFamilySize})
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {cadenceLabels[plan.cadence]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          ${plan.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground">
                            {termTypeLabels[plan.termType]}
                            {plan.termType === "fixed-term" &&
                              plan.termDuration && <> ({plan.termDuration}mo)</>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {plan.scope === "organization" ? (
                            <span className="text-muted-foreground">Org-wide</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {plan.locationIds?.length || 0} location(s)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={plan.active}
                            onCheckedChange={() => handleToggleActive(plan.id)}
                            aria-label={`Toggle ${plan.name} active status`}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading membership plans...
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p>{plan.name}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{cadenceLabels[plan.cadence]}</Badge>
                        {plan.allowsFamily && (
                          <Badge variant="secondary" className="text-xs">
                            Family
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={plan.active}
                      onCheckedChange={() => handleToggleActive(plan.id)}
                      aria-label={`Toggle ${plan.name} active status`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p>${plan.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Term:</span>
                      <p>{termTypeLabels[plan.termType]}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                    className="w-full gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Plan
                  </Button>
                </div>
              ))
            )}
          </div>

          {!isLoading && plans.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No membership plans configured. Click "New Plan" to add one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Membership Plan" : "New Membership Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Update the membership plan details below."
                : "Create a new membership plan with pricing and terms."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Premium Family Membership"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Full access to all facilities..."
                  rows={3}
                />
              </div>
            </div>

            {/* Billing & Terms */}
            <div className="space-y-4">
              <h3>Billing & Terms</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-cadence">Billing Cadence</Label>
                  <Select
                    value={formData.cadence}
                    onValueChange={(value: BillingCadence) =>
                      setFormData({ ...formData, cadence: value })
                    }
                  >
                    <SelectTrigger id="plan-cadence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-price">Price ($)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                  value={formData.price ?? ""}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      price:
                        e.target.value === "" ? undefined : parseFloat(e.target.value),
                    })
                    }
                    placeholder="250"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-term-type">Term Type</Label>
                  <Select
                    value={formData.termType}
                    onValueChange={(value: TermType) =>
                      setFormData({ ...formData, termType: value })
                    }
                  >
                    <SelectTrigger id="plan-term-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evergreen">
                        Evergreen (renews automatically)
                      </SelectItem>
                      <SelectItem value="fixed-term">
                        Fixed-term (expires after duration)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.termType === "fixed-term" && (
                  <div className="space-y-2">
                    <Label htmlFor="plan-term-duration">
                      Term Duration (months)
                    </Label>
                    <Input
                      id="plan-term-duration"
                      type="number"
                      value={formData.termDuration ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          termDuration:
                            e.target.value === "" ? undefined : parseInt(e.target.value),
                        })
                      }
                      placeholder="12"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Introductory Period */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="plan-intro-enabled">
                    Introductory Period
                  </Label>
                  <p className="text-muted-foreground">
                    Offer discounted pricing for new members
                  </p>
                </div>
                <Switch
                  id="plan-intro-enabled"
                  checked={formData.introEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, introEnabled: checked })
                  }
                />
              </div>

              {formData.introEnabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="plan-intro-duration">
                      Intro Duration (months)
                    </Label>
                    <Input
                      id="plan-intro-duration"
                      type="number"
                      value={formData.introDuration ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introDuration:
                            e.target.value === "" ? undefined : parseInt(e.target.value),
                        })
                      }
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan-intro-price">Intro Price ($)</Label>
                    <Input
                      id="plan-intro-price"
                      type="number"
                      value={formData.introPrice ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introPrice:
                            e.target.value === "" ? undefined : parseFloat(e.target.value),
                        })
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scope */}
            <div className="space-y-4">
              <h3>Scope</h3>

              <div className="space-y-2">
                <Label htmlFor="plan-scope">Availability</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value: PlanScope) =>
                    setFormData({ ...formData, scope: value })
                  }
                >
                  <SelectTrigger id="plan-scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization">
                      Organization-wide (all locations)
                    </SelectItem>
                    <SelectItem value="locations">
                      Specific locations only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.scope === "locations" && (
                <div className="space-y-2">
                  <Label>Select Locations</Label>
                  <div className="space-y-2 border border-border rounded-lg p-4">
                    {availableLocations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No locations available. Create a location first.
                      </p>
                    ) : (
                      availableLocations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`location-${location.id}`}
                            checked={formData.locationIds?.includes(location.id)}
                            onCheckedChange={() =>
                              handleLocationToggle(location.id)
                            }
                          />
                          <label
                            htmlFor={`location-${location.id}`}
                            className="cursor-pointer"
                          >
                            {location.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Family Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="plan-allows-family">Family Membership</Label>
                  <p className="text-muted-foreground">
                    Allow multiple family members under one plan
                  </p>
                </div>
                <Switch
                  id="plan-allows-family"
                  checked={formData.allowsFamily}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowsFamily: checked })
                  }
                />
              </div>

              {formData.allowsFamily && (
                <div className="space-y-2">
                  <Label htmlFor="plan-max-family">Max Family Size</Label>
                  <Input
                    id="plan-max-family"
                    type="number"
                      value={formData.maxFamilySize ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                          maxFamilySize:
                            e.target.value === "" ? undefined : parseInt(e.target.value),
                      })
                    }
                    placeholder="6"
                    min="2"
                  />
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="space-y-0.5">
                <Label htmlFor="plan-active">Active</Label>
                <p className="text-muted-foreground">
                  Plan is available for customer assignment
                </p>
              </div>
              <Switch
                id="plan-active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            {actionError && (
              <div className="text-sm text-destructive flex-1">
                {actionError}
              </div>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan} disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingPlan
                    ? "Update Plan"
                    : "Create Plan"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
