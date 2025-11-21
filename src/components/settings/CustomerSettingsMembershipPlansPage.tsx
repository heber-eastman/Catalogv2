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
  termDuration?: number; // months, only if fixed-term
  scope: PlanScope;
  locationIds?: string[];
  introEnabled: boolean;
  introDuration?: number; // months
  introPrice?: number;
  allowsFamily: boolean;
  maxFamilySize?: number;
  active: boolean;
}

const mockPlans: MembershipPlan[] = [
  {
    id: "1",
    name: "Premium Family Membership",
    description: "Full access to all facilities with family benefits",
    cadence: "yearly",
    price: 3000,
    termType: "evergreen",
    scope: "organization",
    introEnabled: true,
    introDuration: 1,
    introPrice: 0,
    allowsFamily: true,
    maxFamilySize: 6,
    active: true,
  },
  {
    id: "2",
    name: "Individual Monthly",
    description: "Month-to-month individual membership",
    cadence: "monthly",
    price: 250,
    termType: "evergreen",
    scope: "organization",
    introEnabled: false,
    allowsFamily: false,
    active: true,
  },
  {
    id: "3",
    name: "North Club Only - Annual",
    description: "Annual membership for North Club location",
    cadence: "yearly",
    price: 2000,
    termType: "fixed-term",
    termDuration: 12,
    scope: "locations",
    locationIds: ["1"],
    introEnabled: false,
    allowsFamily: false,
    active: true,
  },
  {
    id: "4",
    name: "Summer Trial",
    description: "3-month summer trial membership",
    cadence: "one-time",
    price: 500,
    termType: "fixed-term",
    termDuration: 3,
    scope: "organization",
    introEnabled: false,
    allowsFamily: false,
    active: false,
  },
];

// Mock locations for multi-select
const mockLocations = [
  { id: "1", name: "North Club" },
  { id: "2", name: "South Club" },
  { id: "3", name: "East Facility" },
];

const cadenceLabels: Record<BillingCadence, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  "one-time": "One-time",
};

const termTypeLabels: Record<TermType, string> = {
  evergreen: "Evergreen",
  "fixed-term": "Fixed-term",
};

export function CustomerSettingsMembershipPlansPage() {
  const [plans, setPlans] = React.useState(mockPlans);
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
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsDialogOpen(true);
  };

  const handleSavePlan = () => {
    if (editingPlan) {
      // Update existing plan
      setPlans(
        plans.map((p) =>
          p.id === editingPlan.id ? { ...editingPlan, ...formData } as MembershipPlan : p
        )
      );
    } else {
      // Create new plan
      const newPlan: MembershipPlan = {
        id: (plans.length + 1).toString(),
        ...(formData as MembershipPlan),
      };
      setPlans([...plans, newPlan]);
    }
    setIsDialogOpen(false);
  };

  const handleToggleActive = (planId: string) => {
    setPlans(
      plans.map((p) => (p.id === planId ? { ...p, active: !p.active } : p))
    );
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

      {/* Plans Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
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
                          {plan.termType === "fixed-term" && plan.termDuration && (
                            <> ({plan.termDuration}mo)</>
                          )}
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
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-border">
            {plans.map((plan) => (
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
            ))}
          </div>

          {plans.length === 0 && (
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
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
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
                      value={formData.termDuration || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          termDuration: parseInt(e.target.value),
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
                      value={formData.introDuration || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introDuration: parseInt(e.target.value),
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
                          introPrice: parseFloat(e.target.value),
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
                    {mockLocations.map((location) => (
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
                    ))}
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
                    value={formData.maxFamilySize || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxFamilySize: parseInt(e.target.value),
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan}>
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
