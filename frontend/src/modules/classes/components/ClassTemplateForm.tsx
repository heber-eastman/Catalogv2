import * as React from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export type ClassTemplateStatus = "ACTIVE" | "INACTIVE";
export type ClassAccessType = "INCLUDED_IN_MEMBERSHIP" | "PAID_DROPIN" | "EITHER";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface ClassTemplateFormValues {
  id?: string;
  name: string;
  description: string;
  program: string;
  skillLevel: SkillLevel;
  tags: string[];
  location: string;
  room: string;
  startDate: string;
  endDate: string;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
  maxParticipants: number | undefined;
  accessType: ClassAccessType;
  dropInPrice?: string;
  currency: string;
  minAge?: number;
  maxAge?: number;
  ageLabel: string;
  membersOnly: boolean;
  requiredMembershipPlanIds: string[];
  prerequisiteLabel: string;
  primaryInstructor: string;
  instructorDisplayName: string;
  status: ClassTemplateStatus;
}

interface ClassTemplateFormProps {
  mode: "create" | "edit";
  initialTemplate?: ClassTemplateFormValues;
  onSubmit: (values: ClassTemplateFormValues) => void;
  onCancel: () => void;
  locations?: { id: string; name: string }[];
  instructors?: { id: string; name?: string | null }[];
  membershipPlans?: { id: string; name: string }[];
}

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

const skillLevelOptions: { value: SkillLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All levels" },
];

const accessOptions: { value: ClassAccessType; label: string }[] = [
  { value: "INCLUDED_IN_MEMBERSHIP", label: "Included in membership" },
  { value: "PAID_DROPIN", label: "Paid drop-in" },
  { value: "EITHER", label: "Either" },
];

const defaultFormValues: ClassTemplateFormValues = {
  name: "",
  description: "",
  program: "",
  skillLevel: "ALL_LEVELS",
  tags: [],
  location: "",
  room: "",
  startDate: "",
  endDate: "",
  daysOfWeek: ["MON", "WED"],
  startTime: "17:00",
  endTime: "18:00",
  maxParticipants: 12,
  accessType: "INCLUDED_IN_MEMBERSHIP",
  dropInPrice: "",
  currency: "USD",
  minAge: undefined,
  maxAge: undefined,
  ageLabel: "",
  membersOnly: false,
  requiredMembershipPlanIds: [],
  prerequisiteLabel: "",
  primaryInstructor: "",
  instructorDisplayName: "",
  status: "ACTIVE",
};

export function ClassTemplateForm({
  mode,
  initialTemplate,
  onSubmit,
  onCancel,
  locations = [],
  instructors = [],
  membershipPlans = [],
}: ClassTemplateFormProps) {
  const [formValues, setFormValues] = React.useState<ClassTemplateFormValues>(
    initialTemplate ?? defaultFormValues
  );
  const [tagInput, setTagInput] = React.useState("");

  React.useEffect(() => {
    setFormValues(initialTemplate ?? defaultFormValues);
    setTagInput("");
  }, [initialTemplate, mode]);

  React.useEffect(() => {
    if (!initialTemplate) {
      setFormValues((prev) => ({
        ...prev,
        location: prev.location || locations[0]?.id || "",
        primaryInstructor: prev.primaryInstructor || instructors[0]?.id || "",
      }));
    }
  }, [locations, instructors, initialTemplate]);

  const updateField = <K extends keyof ClassTemplateFormValues>(
    field: K,
    value: ClassTemplateFormValues[K]
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormValues((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const toggleMembershipPlan = (planId: string) => {
    setFormValues((prev) => ({
      ...prev,
      requiredMembershipPlanIds: prev.requiredMembershipPlanIds.includes(planId)
        ? prev.requiredMembershipPlanIds.filter((id) => id !== planId)
        : [...prev.requiredMembershipPlanIds, planId],
    }));
  };

  const handleAddTag = () => {
    const normalized = tagInput.trim();
    if (!normalized) return;
    setFormValues((prev) => ({
      ...prev,
      tags: prev.tags.includes(normalized)
        ? prev.tags
        : [...prev.tags, normalized],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormValues((prev) => ({
      ...prev,
      tags: prev.tags.filter((existing) => existing !== tag),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          {mode === "create" ? "Create class template" : "Edit class template"}
        </h2>
        <p className="text-muted-foreground">
          Configure recurring schedule, capacity, eligibility, and instructors.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic details</CardTitle>
            <CardDescription>
              Give the class template a name, category, and visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Name</Label>
                <Input
                  id="template-name"
                  value={formValues.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Kids BJJ – Beginners"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-program">Program / Category</Label>
                <Input
                  id="template-program"
                  value={formValues.program}
                  onChange={(event) => updateField("program", event.target.value)}
                  placeholder="Kids Program"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Skill level</Label>
                <Select
                  value={formValues.skillLevel}
                  onValueChange={(value: SkillLevel) =>
                    updateField("skillLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle to deactivate this template.
                    </p>
                  </div>
                  <Switch
                    checked={formValues.status === "ACTIVE"}
                    onCheckedChange={(checked) =>
                      updateField("status", checked ? "ACTIVE" : "INACTIVE")
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={formValues.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={3}
                placeholder="Share what students can expect, prerequisites, and goals."
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {formValues.tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tags yet – add keywords to help filtering.
                  </p>
                )}
                {formValues.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground transition hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location &amp; room</CardTitle>
            <CardDescription>Select where these sessions take place.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={formValues.location}
                onValueChange={(value) => updateField("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-room">Room</Label>
              <Input
                id="template-room"
                value={formValues.room}
                onChange={(event) => updateField("room", event.target.value)}
                placeholder="Studio A, Performance Lab, etc."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule pattern</CardTitle>
            <CardDescription>Define when and how often sessions occur.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-start-date">Start date</Label>
                <Input
                  id="template-start-date"
                  type="date"
                  value={formValues.startDate}
                  onChange={(event) => updateField("startDate", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-end-date">End date</Label>
                <Input
                  id="template-end-date"
                  type="date"
                  value={formValues.endDate}
                  onChange={(event) => updateField("endDate", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days of week</Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => {
                  const isActive = formValues.daysOfWeek.includes(day.value);
                  return (
                    <Button
                      key={day.value}
                      type="button"
                      variant={isActive ? "secondary" : "outline"}
                      className="w-14"
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={isActive}
                    >
                      {day.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-start-time">Start time</Label>
                <Input
                  id="template-start-time"
                  type="time"
                  value={formValues.startTime}
                  onChange={(event) => updateField("startTime", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-end-time">End time</Label>
                <Input
                  id="template-end-time"
                  type="time"
                  value={formValues.endTime}
                  onChange={(event) => updateField("endTime", event.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacity &amp; access</CardTitle>
            <CardDescription>Control enrollment caps and billing metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-max-participants">Max participants</Label>
                <Input
                  id="template-max-participants"
                  type="number"
                  min={1}
                  value={formValues.maxParticipants ?? ""}
                  onChange={(event) =>
                    updateField(
                      "maxParticipants",
                      event.target.value === "" ? undefined : Number(event.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Access type</Label>
                <div className="flex flex-wrap gap-2">
                  {accessOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={
                        formValues.accessType === option.value ? "secondary" : "outline"
                      }
                      onClick={() => updateField("accessType", option.value)}
                      className="flex-1 min-w-[160px]"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {(formValues.accessType === "PAID_DROPIN" ||
              formValues.accessType === "EITHER") && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template-dropin-price">Drop-in price</Label>
                  <Input
                    id="template-dropin-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formValues.dropInPrice ?? ""}
                    onChange={(event) =>
                      updateField("dropInPrice", event.target.value)
                    }
                    placeholder="35"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formValues.currency}
                    onValueChange={(value) => updateField("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eligibility &amp; prerequisites</CardTitle>
            <CardDescription>Capture requirements for who can join.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="template-min-age">Min age</Label>
                <Input
                  id="template-min-age"
                  type="number"
                  min={0}
                  value={formValues.minAge ?? ""}
                  onChange={(event) =>
                    updateField(
                      "minAge",
                      event.target.value === "" ? undefined : Number(event.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-max-age">Max age</Label>
                <Input
                  id="template-max-age"
                  type="number"
                  min={0}
                  value={formValues.maxAge ?? ""}
                  onChange={(event) =>
                    updateField(
                      "maxAge",
                      event.target.value === "" ? undefined : Number(event.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-age-label">Age label</Label>
                <Input
                  id="template-age-label"
                  value={formValues.ageLabel}
                  onChange={(event) => updateField("ageLabel", event.target.value)}
                  placeholder="Kids 5–8"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Members only</p>
                <p className="text-xs text-muted-foreground">
                  Restrict enrollment to active members.
                </p>
              </div>
              <Switch
                checked={formValues.membersOnly}
                onCheckedChange={(checked) => updateField("membersOnly", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Required membership plans</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {membershipPlans.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={formValues.requiredMembershipPlanIds.includes(plan.id)}
                      onCheckedChange={() => toggleMembershipPlan(plan.id)}
                    />
                    {plan.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-prerequisite">Prerequisite label</Label>
              <Input
                id="template-prerequisite"
                value={formValues.prerequisiteLabel}
                onChange={(event) =>
                  updateField("prerequisiteLabel", event.target.value)
                }
                placeholder="Yellow belt or higher"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructor</CardTitle>
            <CardDescription>Assign the lead staff member for this class.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary instructor</Label>
              <Select
                value={formValues.primaryInstructor}
                onValueChange={(value) => updateField("primaryInstructor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name ?? instructor.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-instructor-display">
                Instructor display name (optional)
              </Label>
              <Input
                id="template-instructor-display"
                value={formValues.instructorDisplayName}
                onChange={(event) =>
                  updateField("instructorDisplayName", event.target.value)
                }
                placeholder="Coach Amy"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {mode === "create" ? "Create template" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
