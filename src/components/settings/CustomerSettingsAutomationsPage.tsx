import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
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
import { Checkbox } from "../ui/checkbox";
import { Plus, Pencil, Zap } from "lucide-react";

type TriggerType =
  | "on_status_change"
  | "before_renewal"
  | "after_signup"
  | "payment_failed";

type ActionType = "send_email" | "send_sms";

interface Automation {
  id: string;
  name: string;
  triggerType: TriggerType;
  triggerConfig: {
    fromStatus?: string;
    toStatus?: string;
    daysBefore?: number;
  };
  conditions: {
    membershipPlanIds?: string[];
    locationIds?: string[];
  };
  actionType: ActionType;
  templateId: string;
  templateName: string;
  enabled: boolean;
}

const mockAutomations: Automation[] = [
  {
    id: "1",
    name: "Welcome New Members",
    triggerType: "after_signup",
    triggerConfig: {},
    conditions: {},
    actionType: "send_email",
    templateId: "1",
    templateName: "Welcome Email",
    enabled: true,
  },
  {
    id: "2",
    name: "Renewal Reminder - 30 Days",
    triggerType: "before_renewal",
    triggerConfig: { daysBefore: 30 },
    conditions: {},
    actionType: "send_email",
    templateId: "2",
    templateName: "Renewal Reminder",
    enabled: true,
  },
  {
    id: "3",
    name: "Cancellation Follow-up",
    triggerType: "on_status_change",
    triggerConfig: { fromStatus: "active", toStatus: "cancelled" },
    conditions: {},
    actionType: "send_email",
    templateId: "4",
    templateName: "Cancellation Survey",
    enabled: false,
  },
  {
    id: "4",
    name: "Payment Failed Alert",
    triggerType: "payment_failed",
    triggerConfig: {},
    conditions: { membershipPlanIds: ["1", "2"] },
    actionType: "send_sms",
    templateId: "5",
    templateName: "Payment Failed SMS",
    enabled: true,
  },
];

// Mock data for selectors
const mockMembershipPlans = [
  { id: "1", name: "Premium Family Membership" },
  { id: "2", name: "Individual Monthly" },
  { id: "3", name: "North Club Only - Annual" },
];

const mockLocations = [
  { id: "1", name: "North Club" },
  { id: "2", name: "South Club" },
  { id: "3", name: "East Facility" },
];

const mockTemplates = [
  { id: "1", name: "Welcome Email", type: "email" },
  { id: "2", name: "Renewal Reminder", type: "email" },
  { id: "3", name: "Welcome SMS", type: "sms" },
  { id: "4", name: "Cancellation Survey", type: "email" },
  { id: "5", name: "Payment Failed SMS", type: "sms" },
];

const triggerTypeLabels: Record<TriggerType, string> = {
  on_status_change: "On status change",
  before_renewal: "Before membership renewal",
  after_signup: "After customer signup",
  payment_failed: "When payment fails",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
  { value: "frozen", label: "Frozen" },
  { value: "pending", label: "Pending" },
];

export function CustomerSettingsAutomationsPage() {
  const [automations, setAutomations] = React.useState(mockAutomations);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAutomation, setEditingAutomation] = React.useState<Automation | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    triggerType: "after_signup" as TriggerType,
    fromStatus: "",
    toStatus: "",
    daysBefore: 30,
    filterByPlans: false,
    selectedPlanIds: [] as string[],
    filterByLocations: false,
    selectedLocationIds: [] as string[],
    actionType: "send_email" as ActionType,
    templateId: "",
    enabled: true,
  });

  const handleNewAutomation = () => {
    setEditingAutomation(null);
    setFormData({
      name: "",
      triggerType: "after_signup",
      fromStatus: "",
      toStatus: "",
      daysBefore: 30,
      filterByPlans: false,
      selectedPlanIds: [],
      filterByLocations: false,
      selectedLocationIds: [],
      actionType: "send_email",
      templateId: "",
      enabled: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      triggerType: automation.triggerType,
      fromStatus: automation.triggerConfig.fromStatus || "",
      toStatus: automation.triggerConfig.toStatus || "",
      daysBefore: automation.triggerConfig.daysBefore || 30,
      filterByPlans: !!automation.conditions.membershipPlanIds?.length,
      selectedPlanIds: automation.conditions.membershipPlanIds || [],
      filterByLocations: !!automation.conditions.locationIds?.length,
      selectedLocationIds: automation.conditions.locationIds || [],
      actionType: automation.actionType,
      templateId: automation.templateId,
      enabled: automation.enabled,
    });
    setIsDialogOpen(true);
  };

  const handleSaveAutomation = () => {
    const triggerConfig: Automation["triggerConfig"] = {};
    if (formData.triggerType === "on_status_change") {
      triggerConfig.fromStatus = formData.fromStatus;
      triggerConfig.toStatus = formData.toStatus;
    } else if (formData.triggerType === "before_renewal") {
      triggerConfig.daysBefore = formData.daysBefore;
    }

    const conditions: Automation["conditions"] = {};
    if (formData.filterByPlans && formData.selectedPlanIds.length > 0) {
      conditions.membershipPlanIds = formData.selectedPlanIds;
    }
    if (formData.filterByLocations && formData.selectedLocationIds.length > 0) {
      conditions.locationIds = formData.selectedLocationIds;
    }

    const templateName =
      mockTemplates.find((t) => t.id === formData.templateId)?.name || "";

    if (editingAutomation) {
      // Update existing
      setAutomations(
        automations.map((a) =>
          a.id === editingAutomation.id
            ? {
                ...a,
                name: formData.name,
                triggerType: formData.triggerType,
                triggerConfig,
                conditions,
                actionType: formData.actionType,
                templateId: formData.templateId,
                templateName,
                enabled: formData.enabled,
              }
            : a
        )
      );
    } else {
      // Create new
      const newAutomation: Automation = {
        id: (automations.length + 1).toString(),
        name: formData.name,
        triggerType: formData.triggerType,
        triggerConfig,
        conditions,
        actionType: formData.actionType,
        templateId: formData.templateId,
        templateName,
        enabled: formData.enabled,
      };
      setAutomations([...automations, newAutomation]);
    }

    setIsDialogOpen(false);
  };

  const handleToggleEnabled = (automationId: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === automationId ? { ...a, enabled: !a.enabled } : a
      )
    );
  };

  const handleTogglePlan = (planId: string) => {
    const newPlanIds = formData.selectedPlanIds.includes(planId)
      ? formData.selectedPlanIds.filter((id) => id !== planId)
      : [...formData.selectedPlanIds, planId];
    setFormData({ ...formData, selectedPlanIds: newPlanIds });
  };

  const handleToggleLocation = (locationId: string) => {
    const newLocationIds = formData.selectedLocationIds.includes(locationId)
      ? formData.selectedLocationIds.filter((id) => id !== locationId)
      : [...formData.selectedLocationIds, locationId];
    setFormData({ ...formData, selectedLocationIds: newLocationIds });
  };

  const getTriggerSummary = (automation: Automation) => {
    const { triggerType, triggerConfig } = automation;
    if (triggerType === "on_status_change") {
      return `${triggerConfig.fromStatus || "Any"} → ${triggerConfig.toStatus || "Any"}`;
    } else if (triggerType === "before_renewal") {
      return `${triggerConfig.daysBefore} days before`;
    } else if (triggerType === "after_signup") {
      return "Immediately after signup";
    } else if (triggerType === "payment_failed") {
      return "When payment fails";
    }
    return "—";
  };

  const getConditionSummary = (automation: Automation) => {
    const parts: string[] = [];
    if (automation.conditions.membershipPlanIds?.length) {
      parts.push(`${automation.conditions.membershipPlanIds.length} plan(s)`);
    }
    if (automation.conditions.locationIds?.length) {
      parts.push(`${automation.conditions.locationIds.length} location(s)`);
    }
    return parts.length > 0 ? parts.join(", ") : "All customers";
  };

  const availableTemplates = mockTemplates.filter(
    (t) => t.type === (formData.actionType === "send_email" ? "email" : "sms")
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2>Customer Automations</h2>
        <p className="text-muted-foreground">
          Create event-based rules to automatically send communications to customers
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Zap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3>How automations work</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  Automations trigger automatically when specific events occur
                </li>
                <li>
                  You can filter which customers receive messages based on their plan
                  or location
                </li>
                <li>
                  Each automation sends a single email or SMS using your configured
                  templates
                </li>
                <li>
                  Disabled automations won't trigger until you enable them again
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleNewAutomation} className="gap-2">
          <Plus className="h-4 w-4" />
          New Automation
        </Button>
      </div>

      {/* Automations Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left" scope="col">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Trigger Type
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Condition
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {automations.map((automation) => (
                    <tr key={automation.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          {automation.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p>{triggerTypeLabels[automation.triggerType]}</p>
                          <p className="text-muted-foreground">
                            {getTriggerSummary(automation)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {getConditionSummary(automation)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p>
                            {automation.actionType === "send_email"
                              ? "Send Email"
                              : "Send SMS"}
                          </p>
                          <p className="text-muted-foreground">
                            {automation.templateName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={automation.enabled}
                          onCheckedChange={() => handleToggleEnabled(automation.id)}
                          aria-label={`Toggle ${automation.name} enabled status`}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAutomation(automation)}
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
            {automations.map((automation) => (
              <div key={automation.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p>{automation.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">
                        {triggerTypeLabels[automation.triggerType]}
                      </p>
                      <p className="text-muted-foreground">
                        {getTriggerSummary(automation)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={automation.enabled}
                    onCheckedChange={() => handleToggleEnabled(automation.id)}
                    aria-label={`Toggle ${automation.name} enabled status`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <p>{getConditionSummary(automation)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Action:</span>
                    <p>
                      {automation.actionType === "send_email"
                        ? "Email"
                        : "SMS"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAutomation(automation)}
                  className="w-full gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Automation
                </Button>
              </div>
            ))}
          </div>

          {automations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No automations configured. Click "New Automation" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAutomation ? "Edit Automation" : "New Automation"}
            </DialogTitle>
            <DialogDescription>
              {editingAutomation
                ? "Update the automation rule below."
                : "Create a new automation rule."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="automation-name">Automation Name</Label>
              <Input
                id="automation-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Welcome New Members"
              />
            </div>

            {/* Trigger */}
            <div className="space-y-4">
              <h3>Trigger</h3>

              <div className="space-y-2">
                <Label htmlFor="trigger-type">When should this run?</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(value: TriggerType) =>
                    setFormData({ ...formData, triggerType: value })
                  }
                >
                  <SelectTrigger id="trigger-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="after_signup">After customer signup</SelectItem>
                    <SelectItem value="on_status_change">On status change</SelectItem>
                    <SelectItem value="before_renewal">
                      Before membership renewal
                    </SelectItem>
                    <SelectItem value="payment_failed">When payment fails</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Change Config */}
              {formData.triggerType === "on_status_change" && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="from-status">From Status</Label>
                    <Select
                      value={formData.fromStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fromStatus: value })
                      }
                    >
                      <SelectTrigger id="from-status">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any status</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-status">To Status</Label>
                    <Select
                      value={formData.toStatus}
                      onValueChange={(value) =>
                        setFormData({ ...formData, toStatus: value })
                      }
                    >
                      <SelectTrigger id="to-status">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any status</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Before Renewal Config */}
              {formData.triggerType === "before_renewal" && (
                <div className="space-y-2 p-4 border border-border rounded-lg bg-muted/30">
                  <Label htmlFor="days-before">Days Before Renewal</Label>
                  <Input
                    id="days-before"
                    type="number"
                    value={formData.daysBefore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daysBefore: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                  />
                  <p className="text-muted-foreground">
                    Send notification this many days before renewal date
                  </p>
                </div>
              )}
            </div>

            {/* Conditions */}
            <div className="space-y-4">
              <h3>Conditions (Optional)</h3>
              <p className="text-muted-foreground">
                Filter which customers receive this automation
              </p>

              {/* Filter by Plans */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-plans"
                    checked={formData.filterByPlans}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        filterByPlans: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="filter-plans" className="cursor-pointer">
                    Filter by membership plan
                  </Label>
                </div>

                {formData.filterByPlans && (
                  <div className="ml-6 space-y-2 p-4 border border-border rounded-lg bg-muted/30">
                    {mockMembershipPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`plan-${plan.id}`}
                          checked={formData.selectedPlanIds.includes(plan.id)}
                          onCheckedChange={() => handleTogglePlan(plan.id)}
                        />
                        <label
                          htmlFor={`plan-${plan.id}`}
                          className="cursor-pointer"
                        >
                          {plan.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter by Locations */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-locations"
                    checked={formData.filterByLocations}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        filterByLocations: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="filter-locations" className="cursor-pointer">
                    Filter by location
                  </Label>
                </div>

                {formData.filterByLocations && (
                  <div className="ml-6 space-y-2 p-4 border border-border rounded-lg bg-muted/30">
                    {mockLocations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.id}`}
                          checked={formData.selectedLocationIds.includes(
                            location.id
                          )}
                          onCheckedChange={() => handleToggleLocation(location.id)}
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
                )}
              </div>
            </div>

            {/* Action */}
            <div className="space-y-4">
              <h3>Action</h3>

              <div className="space-y-2">
                <Label>What should happen?</Label>
                <RadioGroup
                  value={formData.actionType}
                  onValueChange={(value: ActionType) =>
                    setFormData({ ...formData, actionType: value, templateId: "" })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="send_email" id="action-email" />
                    <Label htmlFor="action-email" className="cursor-pointer">
                      Send email template
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="send_sms" id="action-sms" />
                    <Label htmlFor="action-sms" className="cursor-pointer">
                      Send SMS template
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-select">
                  Select {formData.actionType === "send_email" ? "Email" : "SMS"}{" "}
                  Template
                </Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, templateId: value })
                  }
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enabled */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="space-y-0.5">
                <Label htmlFor="automation-enabled">Enabled</Label>
                <p className="text-muted-foreground">
                  Automation will run automatically when triggered
                </p>
              </div>
              <Switch
                id="automation-enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAutomation}
              disabled={!formData.name.trim() || !formData.templateId}
            >
              {editingAutomation ? "Update Automation" : "Create Automation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
