import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { FilterMenu } from "../../../components/filters/FilterMenu";
import {
  ClassTemplateForm,
  ClassTemplateFormValues,
  ClassAccessType,
  DayOfWeek,
} from "../components/ClassTemplateForm";
import { useApiClient } from "../../../hooks/useApiClient";
import { createClassesApi, ClassTemplateDetail, ClassTemplateListItem } from "../../../api/classesApi";
import {
  createClassesLookupsApi,
  LocationLookup,
  InstructorLookup,
  MembershipPlanLookup,
} from "../../../api/classesLookupsApi";

const accessTypeCopy: Record<ClassAccessType, string> = {
  INCLUDED_IN_MEMBERSHIP: "Included in membership",
  PAID_DROPIN: "Paid drop-in",
  EITHER: "Either",
};

const dayCodeToNumber: Record<DayOfWeek, number> = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

const numberToDayCode: Record<number, DayOfWeek> = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
  7: "SUN",
};

function mapTemplateToForm(template: ClassTemplateDetail): ClassTemplateFormValues {
  const toDateInput = (value?: string | null) =>
    value ? new Date(value).toISOString().slice(0, 10) : "";

  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    program: template.program ?? "",
    skillLevel: template.skillLevel,
    tags: template.tags ?? [],
    location: template.locationId,
    room: template.room ?? "",
    startDate: toDateInput(template.startDate),
    endDate: toDateInput(template.endDate),
    daysOfWeek: (template.daysOfWeek ?? [])
      .map((d) => numberToDayCode[d as keyof typeof numberToDayCode])
      .filter(Boolean) as DayOfWeek[],
    startTime: template.startTime,
    endTime: template.endTime,
    maxParticipants: template.maxParticipants,
    accessType: template.accessType,
    dropInPrice:
      typeof template.dropInPriceCents === "number"
        ? (template.dropInPriceCents / 100).toString()
        : "",
    currency: template.currency ?? "USD",
    minAge: template.minAge ?? undefined,
    maxAge: template.maxAge ?? undefined,
    ageLabel: template.ageLabel ?? "",
    membersOnly: template.membersOnly,
    requiredMembershipPlanIds:
      template.requiredPlans?.map((plan) => plan.membershipPlanId) ?? [],
    prerequisiteLabel: template.prerequisiteLabel ?? "",
    primaryInstructor: template.primaryInstructorUserId,
    instructorDisplayName: template.instructorDisplayName ?? "",
    status: template.isActive ? "ACTIVE" : "INACTIVE",
  };
}

function mapFormToApiPayload(values: ClassTemplateFormValues) {
  const toIso = (value?: string) =>
    value ? new Date(value).toISOString() : undefined;

  const dropInPriceCents =
    values.dropInPrice && values.dropInPrice.trim() !== ""
      ? Math.round(parseFloat(values.dropInPrice) * 100)
      : null;

  return {
    name: values.name,
    description: values.description || null,
    program: values.program || null,
    skillLevel: values.skillLevel,
    tags: values.tags ?? [],
    locationId: values.location,
    room: values.room || null,
    startDate: toIso(values.startDate),
    endDate: values.endDate ? toIso(values.endDate) : null,
    daysOfWeek: values.daysOfWeek.map((d) => dayCodeToNumber[d]),
    startTime: values.startTime,
    endTime: values.endTime,
    maxParticipants: values.maxParticipants ?? 0,
    accessType: values.accessType,
    dropInPriceCents,
    currency: values.currency || null,
    minAge: values.minAge ?? null,
    maxAge: values.maxAge ?? null,
    ageLabel: values.ageLabel || null,
    membersOnly: values.membersOnly,
    prerequisiteLabel: values.prerequisiteLabel || null,
    primaryInstructorUserId: values.primaryInstructor || "",
    instructorDisplayName: values.instructorDisplayName || null,
    isActive: values.status === "ACTIVE",
    requiredMembershipPlanIds: values.requiredMembershipPlanIds,
  };
}

export function ClassTemplatesPage() {
  const apiClient = useApiClient();
  const classesApi = React.useMemo(() => createClassesApi(apiClient), [apiClient]);
  const lookupsApi = React.useMemo(() => createClassesLookupsApi(apiClient), [apiClient]);

  const [templates, setTemplates] = React.useState<ClassTemplateListItem[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("active");
  const [locationFilter, setLocationFilter] = React.useState<string>("any");
  const [programFilter, setProgramFilter] = React.useState<string>("any");
  const [instructorFilter, setInstructorFilter] = React.useState<string>("any");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [activeTemplate, setActiveTemplate] = React.useState<ClassTemplateFormValues | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [locations, setLocations] = React.useState<LocationLookup[]>([]);
  const [instructors, setInstructors] = React.useState<InstructorLookup[]>([]);
  const [programs, setPrograms] = React.useState<string[]>([]);
  const [membershipPlans, setMembershipPlans] = React.useState<MembershipPlanLookup[]>([]);

  const locationNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    locations.forEach((loc) => map.set(loc.id, loc.name));
    return map;
  }, [locations]);

  const instructorNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    instructors.forEach((inst) =>
      map.set(inst.id, inst.name ?? inst.email ?? inst.id),
    );
    return map;
  }, [instructors]);

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.toLowerCase().includes(searchValue.toLowerCase().trim());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && template.isActive) ||
        (statusFilter === "inactive" && !template.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [templates, searchValue, statusFilter]);

  const openCreateForm = () => {
    setFormMode("create");
    setActiveTemplate(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = async (templateId: string) => {
    try {
      const detail = await classesApi.getClassTemplate(templateId);
      setActiveTemplate(mapTemplateToForm(detail));
      setFormMode("edit");
      setIsFormOpen(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load template.");
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setActiveTemplate(undefined);
  };

  const handleFormSubmit = async (values: ClassTemplateFormValues) => {
    try {
      if (formMode === "create") {
        await classesApi.createClassTemplate(mapFormToApiPayload(values));
      } else if (activeTemplate?.id) {
        await classesApi.updateClassTemplate(activeTemplate.id, mapFormToApiPayload(values));
      }
      closeForm();
      await fetchTemplates();
    } catch (err) {
      console.error(err);
      setError("Unable to save template.");
    }
  };

  React.useEffect(() => {
    fetchTemplates();
    // load lookups once
    void fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, locationFilter, programFilter, instructorFilter]);

  async function fetchTemplates() {
    setLoading(true);
    setError(null);
    try {
      const result = await classesApi.getClassTemplates({
        isActive:
          statusFilter === "all"
            ? undefined
            : statusFilter === "active"
              ? true
              : false,
        locationId: locationFilter === "any" ? undefined : locationFilter,
        program: programFilter === "any" ? undefined : programFilter,
        instructorUserId: instructorFilter === "any" ? undefined : instructorFilter,
      });
      setTemplates(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLookups() {
    try {
      const [locs, instr, progs, plans] = await Promise.all([
        lookupsApi.getLocations(),
        lookupsApi.getInstructors(),
        lookupsApi.getPrograms(),
        lookupsApi.getMembershipPlans(),
      ]);
      setLocations(locs);
      setInstructors(instr);
      setPrograms(progs);
      setMembershipPlans(plans.filter((plan) => plan.isActive !== false));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search templates by name"
            className="w-full sm:w-72 lg:w-80"
            aria-label="Search templates"
          />

          <div className="flex flex-wrap items-center gap-2">
            {(["active", "inactive", "all"] as const).map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(filter)}
              >
                {filter === "active"
                  ? "Active"
                  : filter === "inactive"
                  ? "Inactive"
                  : "All"}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            className="w-full sm:w-auto lg:ml-auto"
            onClick={openCreateForm}
          >
            New class template
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterMenu
            label="Location"
            selectedValues={locationFilter === "any" ? [] : [locationFilter]}
            options={[
              { label: "All locations", value: "any" },
              ...locations.map((loc) => ({ label: loc.name, value: loc.id })),
            ]}
            onToggle={(value) =>
              setLocationFilter((prev) => (prev === value ? "any" : value))
            }
          />

          <FilterMenu
            label="Program"
            selectedValues={programFilter === "any" ? [] : [programFilter]}
            options={[
              { label: "All programs", value: "any" },
              ...programs.map((program) => ({ label: program, value: program })),
            ]}
            onToggle={(value) =>
              setProgramFilter((prev) => (prev === value ? "any" : value))
            }
          />

          <FilterMenu
            label="Instructor"
            selectedValues={instructorFilter === "any" ? [] : [instructorFilter]}
            options={[
              { label: "All instructors", value: "any" },
              ...instructors.map((inst) => ({
                label: inst.name ?? inst.email ?? inst.id,
                value: inst.id,
              })),
            ]}
            onToggle={(value) =>
              setInstructorFilter((prev) => (prev === value ? "any" : value))
            }
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Class name</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Program / Category
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Skill level
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Location &amp; Room
                  </TableHead>
                  <TableHead className="hidden 2xl:table-cell">
                    Access type
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Primary instructor
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-14 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-6 text-center text-muted-foreground">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-muted-foreground lg:hidden">
                          {template.program}
                        </span>
                        <span className="text-muted-foreground xl:hidden">
                          {template.locationId} · {template.room ?? "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {template.program}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {template.skillLevel.replace("_", " ")}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex flex-col">
                        <span>{locationNameById.get(template.locationId) ?? template.locationId}</span>
                        <span className="text-muted-foreground">
                          Room: {template.room ?? "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      {accessTypeCopy[template.accessType]}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {template.instructorDisplayName ||
                        instructorNameById.get(template.primaryInstructorUserId) ||
                        template.primaryInstructorUserId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          template.isActive ? "secondary" : "outline"
                        }
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${template.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              openEditForm(template.id);
                            }}
                          >
                            Edit template
                          </DropdownMenuItem>
                          <DropdownMenuItem>View sessions</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!loading && filteredTemplates.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No templates match your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          } else {
            setIsFormOpen(true);
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:w-auto sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 top-4 sm:top-1/2 translate-y-0 sm:translate-y-[-50%]">
          <div className="p-4 sm:p-6">
            <ClassTemplateForm
              mode={formMode}
              initialTemplate={formMode === "edit" ? activeTemplate : undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
              locations={locations}
              instructors={instructors}
              membershipPlans={membershipPlans}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
