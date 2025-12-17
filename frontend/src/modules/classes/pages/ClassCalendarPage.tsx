import * as React from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  FilterMenu,
  FilterOption,
} from "../../../components/filters/FilterMenu";
import {
  SessionDetailsDrawer,
  SessionRosterEntry,
  ClassSessionDetails,
  RosterStatus,
} from "../components/SessionDetailsDrawer";
import { AddParticipantDialog } from "../components/AddParticipantDialog";
import { useApiClient } from "../../../hooks/useApiClient";
import {
  ClassSessionListItem,
  createClassesApi,
  ClassSessionDetail as ApiClassSessionDetail,
  ClassAttendanceStatus,
} from "../../../api/classesApi";
import {
  createClassesLookupsApi,
  LocationLookup,
  InstructorLookup,
} from "../../../api/classesLookupsApi";

type SessionStatus = "SCHEDULED" | "CANCELLED";
type AccessType = "INCLUDED_IN_MEMBERSHIP" | "PAID_DROPIN" | "EITHER";

interface SessionEligibility {
  minAge?: number;
  maxAge?: number;
  ageLabel?: string;
  membersOnly: boolean;
  requiredPlans: string[];
  prerequisite?: string;
}

interface CalendarSession {
  id: string;
  templateId: string;
  name: string;
  organizationId: string;
  locationId: string;
  locationName: string;
  room?: string | null;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxParticipants: number;
  registeredCount: number;
  instructorName?: string | null;
  status: SessionStatus;
  accessType: AccessType;
  dropInPrice?: string | null;
  currency?: string | null;
  eligibility?: SessionEligibility;
}

const instructorOptions = [
  "Coach Amy",
  "Coach Malik",
  "Coach Jamie",
  "Coach Priya",
  "Coach Jordan",
];

type CalendarFilterKey =
  | "locations"
  | "rooms"
  | "programs"
  | "instructors"
  | "statuses";

type CalendarFilterState = Record<CalendarFilterKey, string[]>;

const calendarFilterLabels: Record<CalendarFilterKey, string> = {
  locations: "Location",
  rooms: "Room",
  programs: "Program",
  instructors: "Instructor",
  statuses: "Status",
};

const calendarFilterOrder: CalendarFilterKey[] = [
  "locations",
  "rooms",
  "programs",
  "instructors",
  "statuses",
];

const createInitialCalendarFilters = (): CalendarFilterState => ({
  locations: [],
  rooms: [],
  programs: [],
  instructors: [],
  statuses: [],
});

const _mockSessions: CalendarSession[] = [
  {
    id: "session-1",
    templateId: "tmpl-1",
    name: "Kids BJJ – Beginners",
    organizationId: "org-1",
    locationId: "loc-main",
    locationName: "Main Campus",
    room: "Studio A",
    date: "2025-05-05",
    startTime: "17:00",
    endTime: "18:00",
    maxParticipants: 12,
    registeredCount: 11,
    instructorName: "Coach Amy",
    status: "SCHEDULED",
    accessType: "INCLUDED_IN_MEMBERSHIP",
    eligibility: {
      minAge: 6,
      maxAge: 9,
      ageLabel: "Kids 6–9",
      membersOnly: true,
      requiredPlans: ["Junior Program"],
      prerequisite: "No belt required",
    },
  },
  {
    id: "session-2",
    templateId: "tmpl-2",
    name: "Functional Fitness",
    organizationId: "org-1",
    locationId: "loc-perf",
    locationName: "Performance Center",
    room: "Lab 2",
    date: "2025-05-06",
    startTime: "06:30",
    endTime: "07:30",
    maxParticipants: 18,
    registeredCount: 19,
    instructorName: "Coach Malik",
    status: "SCHEDULED",
    accessType: "EITHER",
    dropInPrice: "35",
    currency: "USD",
    eligibility: {
      membersOnly: false,
      requiredPlans: [],
    },
  },
  {
    id: "session-3",
    templateId: "tmpl-3",
    name: "On-Course Strategy",
    organizationId: "org-1",
    locationId: "loc-west",
    locationName: "West Course",
    room: "Driving Range",
    date: "2025-05-07",
    startTime: "14:00",
    endTime: "15:30",
    maxParticipants: 8,
    registeredCount: 6,
    instructorName: "Coach Jamie",
    status: "CANCELLED",
    accessType: "PAID_DROPIN",
    dropInPrice: "75",
    currency: "USD",
    eligibility: {
      minAge: 14,
      membersOnly: false,
      requiredPlans: ["Golf Plus"],
      prerequisite: "Index 15 or lower",
    },
  },
  {
    id: "session-4",
    templateId: "tmpl-1",
    name: "Kids BJJ – Beginners",
    organizationId: "org-1",
    locationId: "loc-main",
    locationName: "Main Campus",
    room: "Studio A",
    date: "2025-05-07",
    startTime: "17:00",
    endTime: "18:00",
    maxParticipants: 12,
    registeredCount: 13,
    instructorName: "Coach Amy",
    status: "SCHEDULED",
    accessType: "INCLUDED_IN_MEMBERSHIP",
    eligibility: {
      minAge: 6,
      maxAge: 9,
      membersOnly: true,
      requiredPlans: ["Junior Program"],
    },
  },
  {
    id: "session-5",
    templateId: "tmpl-4",
    name: "Mobility & Recovery",
    organizationId: "org-1",
    locationId: "loc-main",
    locationName: "Main Campus",
    room: "Recovery Studio",
    date: "2025-05-09",
    startTime: "09:00",
    endTime: "10:00",
    maxParticipants: 16,
    registeredCount: 14,
    instructorName: "Coach Priya",
    status: "SCHEDULED",
    accessType: "INCLUDED_IN_MEMBERSHIP",
    eligibility: {
      membersOnly: true,
      requiredPlans: ["Wellness Unlimited"],
    },
  },
  {
    id: "session-6",
    templateId: "tmpl-2",
    name: "Functional Fitness",
    organizationId: "org-1",
    locationId: "loc-perf",
    locationName: "Performance Center",
    room: "Lab 2",
    date: "2025-05-08",
    startTime: "06:30",
    endTime: "07:30",
    maxParticipants: 18,
    registeredCount: 16,
    instructorName: "Coach Malik",
    status: "SCHEDULED",
    accessType: "EITHER",
    eligibility: {
      membersOnly: false,
      requiredPlans: [],
    },
  },
  {
    id: "session-7",
    templateId: "tmpl-5",
    name: "Junior Golf Short Game",
    organizationId: "org-1",
    locationId: "loc-west",
    locationName: "West Course",
    room: "Practice Green",
    date: "2025-05-08",
    startTime: "15:00",
    endTime: "16:00",
    maxParticipants: 10,
    registeredCount: 10,
    instructorName: "Coach Jordan",
    status: "SCHEDULED",
    accessType: "INCLUDED_IN_MEMBERSHIP",
    eligibility: {
      minAge: 10,
      maxAge: 14,
      membersOnly: false,
      requiredPlans: ["Junior Program"],
    },
  },
];

const mockSessions: CalendarSession[] = [];

const timeSlots = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];
const SLOT_HEIGHT = 80;
const WEEK_COLUMN_TEMPLATE = "120px repeat(7, minmax(0, 1fr))";

type ViewMode = "WEEK" | "DAY";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sunday
  // Start week on Sunday
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toTimeString(date: Date) {
  return date.toISOString().slice(11, 16);
}

function formatTimeLabel(time: string) {
  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${displayHour}:${minute} ${suffix}`;
}

const searchCustomers = async (
  apiClient: ReturnType<typeof useApiClient>,
  query: string,
) => {
  if (!query) return [];
  const search = encodeURIComponent(query);
  return apiClient<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      primaryEmail?: string | null;
      primaryPhone?: string | null;
    }>
  >(`/api/customers?search=${search}`);
};

export function ClassCalendarPage() {
  const apiClient = useApiClient();
  const classesApi = React.useMemo(() => createClassesApi(apiClient), [apiClient]);
  const lookupsApi = React.useMemo(() => createClassesLookupsApi(apiClient), [apiClient]);

  const [sessions, setSessions] = React.useState<CalendarSession[]>([]);
  const [sessionDetail, setSessionDetail] = React.useState<ApiClassSessionDetail | null>(null);
  const [calendarFilters, setCalendarFilters] = React.useState<CalendarFilterState>(() =>
    createInitialCalendarFilters(),
  );
  const [locations, setLocations] = React.useState<LocationLookup[]>([]);
  const [instructors, setInstructors] = React.useState<InstructorLookup[]>([]);
  const [programs, setPrograms] = React.useState<string[]>([]);
  const [rooms, setRooms] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("WEEK");
  const [weekStart, setWeekStart] = React.useState<Date>(() => startOfWeek(new Date()));
  const [selectedDateIndex, setSelectedDateIndex] = React.useState(0);
  const [selectedSessionId, setSelectedSessionId] = React.useState<
    string | null
  >(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [pendingSessionId, setPendingSessionId] = React.useState<string | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const toggleCalendarFilter = React.useCallback(
    (key: CalendarFilterKey, value: string) => {
      setCalendarFilters((prev) => {
        const currentValues = prev[key];
        const nextValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];
        return { ...prev, [key]: nextValues };
      });
    },
    [],
  );

  const clearCalendarFilters = React.useCallback(() => {
    setCalendarFilters(createInitialCalendarFilters());
  }, []);

  const hasActiveCalendarFilters = React.useMemo(
    () => Object.values(calendarFilters).some((values) => values.length > 0),
    [calendarFilters],
  );

  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const selectedDate = weekDays[selectedDateIndex] ?? weekDays[0];

  const sessionsByDate = React.useMemo(() => {
    return sessions.reduce<Record<string, CalendarSession[]>>(
      (acc, session) => {
        (acc[session.date] ||= []).push(session);
        return acc;
      },
      {},
    );
  }, [sessions]);

  const selectedSession = selectedSessionId
    ? (sessions.find((session) => session.id === selectedSessionId) ?? null)
    : null;

  const drawerSession: ClassSessionDetails | null = sessionDetail
    ? {
        id: sessionDetail.id,
        templateId: sessionDetail.templateId,
        name: sessionDetail.template.name,
        dateLabel: formatDateLabel(sessionDetail.startDateTime),
        timeLabel: `${formatTimeLabel(sessionDetail.startDateTime.slice(11, 16))} – ${formatTimeLabel(sessionDetail.endDateTime.slice(11, 16))}`,
        dateIso: sessionDetail.startDateTime.slice(0, 10),
        locationName: sessionDetail.locationId,
        room: sessionDetail.room ?? "",
        instructorName: sessionDetail.instructorDisplayName ?? "Instructor",
        accessType: sessionDetail.template.accessType,
        dropInPrice: undefined,
        currency: undefined,
        eligibility: {
          minAge: sessionDetail.template.minAge ?? undefined,
          maxAge: sessionDetail.template.maxAge ?? undefined,
          ageLabel: sessionDetail.template.ageLabel ?? undefined,
          membersOnly: sessionDetail.template.membersOnly,
          requiredPlans:
            sessionDetail.template.requiredPlans?.map((p) => p.membershipPlan.name) ?? [],
          prerequisite: sessionDetail.template.prerequisiteLabel ?? undefined,
        },
        status: sessionDetail.status,
        maxParticipants: sessionDetail.maxParticipants,
        registeredCount: sessionDetail.rosterEntries.length,
      }
    : null;

  const selectedRoster = sessionDetail
    ? sessionDetail.rosterEntries.map((entry) => ({
        id: entry.id,
        customerId: entry.customerProfileId,
        name: `${entry.customerProfile.firstName} ${entry.customerProfile.lastName}`,
        email: entry.customerProfile.primaryEmail ?? undefined,
        phone: entry.customerProfile.primaryPhone ?? undefined,
        status: entry.status as RosterStatus,
        note: entry.note ?? undefined,
      }))
    : [];

  React.useEffect(() => {
    fetchSessions();
    void fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, viewMode, selectedDateIndex, calendarFilters]);

  async function fetchSessions() {
    setLoading(true);
    setError(null);
    const rangeStart =
      viewMode === "WEEK" ? weekStart : selectedDate;
    const rangeEnd =
      viewMode === "WEEK" ? addDays(weekStart, 6) : selectedDate;

    try {
      const result = await classesApi.getClassSessions({
        startDate: rangeStart.toISOString(),
        endDate: rangeEnd.toISOString(),
        locationId: calendarFilters.locations[0],
        program: calendarFilters.programs[0],
        instructorUserId: calendarFilters.instructors[0],
        room: calendarFilters.rooms[0],
        status: calendarFilters.statuses[0] as "SCHEDULED" | "CANCELLED" | undefined,
      });
      setSessions(result.map(mapApiSession));
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLookups() {
    try {
      const [locs, instr, progs, rms] = await Promise.all([
        lookupsApi.getLocations(),
        lookupsApi.getInstructors(),
        lookupsApi.getPrograms(),
        lookupsApi.getRooms(),
      ]);
      setLocations(locs);
      setInstructors(instr);
      setPrograms(progs);
      setRooms(rms);
    } catch (err) {
      console.error(err);
    }
  }

  function mapApiSession(item: ClassSessionListItem): CalendarSession {
    const start = new Date(item.startDateTime);
    const end = new Date(item.endDateTime);
    return {
      id: item.id,
      templateId: item.templateId,
      name: item.template.name,
      organizationId: item.organizationId,
      locationId: item.locationId,
      locationName: item.location?.name ?? item.locationId,
      room: item.room ?? null,
      date: toDateString(start),
      startTime: toTimeString(start),
      endTime: toTimeString(end),
      maxParticipants: item.maxParticipants,
      registeredCount: item._count?.rosterEntries ?? 0,
      instructorName:
        item.instructorDisplayName ?? item.instructor?.name ?? undefined,
      status: item.status,
      accessType: item.template.accessType,
      dropInPrice: null,
      currency: null,
      eligibility: undefined,
    };
  }

  const handleSessionClick = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsDrawerOpen(true);
    setSessionDetail(null);
    try {
      const detail = await classesApi.getClassSession(sessionId);
      setSessionDetail(detail);
      // sync calendar registered count with latest roster size from detail
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, registeredCount: detail.rosterEntries.length }
            : s,
        ),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load session details.");
    }
  };

  const handleUpdateParticipantStatus = async (
    participantId: string,
    status: RosterStatus,
  ) => {
    if (!selectedSessionId) return;
    try {
      const updated = await classesApi.updateSessionParticipant(
        selectedSessionId,
        participantId,
        { status: status as ClassAttendanceStatus },
      );
      setSessionDetail(updated);
      await fetchSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to update participant.");
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!selectedSessionId) return;
    try {
      const updated = await classesApi.removeSessionParticipant(
        selectedSessionId,
        participantId,
      );
      setSessionDetail(updated);
      await fetchSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to remove participant.");
    }
  };

  const handleMarkAllAttended = async () => {
    if (!selectedSessionId || !sessionDetail) return;
    try {
      const updated = await Promise.all(
        sessionDetail.rosterEntries.map((entry) =>
          classesApi.updateSessionParticipant(selectedSessionId, entry.id, {
            status: "ATTENDED",
          }),
        ),
      );
      const last = updated[updated.length - 1];
      if (last) {
        setSessionDetail(last);
        await fetchSessions();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to mark attended.");
    }
  };

  const handleOpenAddParticipant = (sessionId: string) => {
    setPendingSessionId(sessionId);
    setIsAddDialogOpen(true);
  };

  const handleSelectCustomer = async (customerId: string) => {
    if (!pendingSessionId) return;
    try {
      const updated = await classesApi.addSessionParticipant(pendingSessionId, {
        customerProfileId: customerId,
      });
      setSessionDetail(updated);
      await fetchSessions();
      return true;
    } catch (err) {
      console.error(err);
      setError("Failed to add participant.");
      return false;
    } finally {
      setIsAddDialogOpen(false);
      setPendingSessionId(null);
    }
  };

  const handleCreateCustomer = async (customer: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
  }): Promise<{ id: string; firstName: string; lastName: string } | null> => {
    if (!pendingSessionId) return null;
    try {
      const prevIds = new Set(sessionDetail?.rosterEntries.map((r) => r.customerProfileId) ?? []);
      const updated = await classesApi.addSessionParticipant(pendingSessionId, {
        newCustomer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email ?? undefined,
          phone: customer.phone ?? undefined,
        },
      });
      setSessionDetail(updated);
      await fetchSessions();
      const newest =
        updated.rosterEntries.find((entry) => !prevIds.has(entry.customerProfileId)) ??
        updated.rosterEntries[updated.rosterEntries.length - 1];
      return newest
        ? {
            id: newest.customerProfileId,
            firstName: newest.customerProfile.firstName,
            lastName: newest.customerProfile.lastName,
          }
        : null;
    } catch (err) {
      console.error(err);
      setError("Failed to add participant.");
      return null;
    } finally {
      setIsAddDialogOpen(false);
      setPendingSessionId(null);
    }
  };

  const handleCancelSession = async () => {
    if (!selectedSessionId) return;
    try {
      const updated = await classesApi.updateClassSession(selectedSessionId, {
        status: "CANCELLED",
        cancelReason: "Cancelled",
      });
      setSessionDetail(updated);
      await fetchSessions();
    } catch (err) {
      console.error(err);
      setError("Failed to cancel session.");
    }
  };

  const handleChangeInstructor = (name: string) => {
    if (!selectedSessionId) return;
    classesApi
      .updateClassSession(selectedSessionId, {
        instructorDisplayName: name,
      })
      .then(async (updated) => {
        setSessionDetail(updated);
        await fetchSessions();
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to update instructor.");
      });
  };

  const handleViewTemplate = (templateId: string) => {
    console.log("Navigate to template", templateId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setWeekStart((prev) => addDays(prev, -7));
              }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Week of</p>
              <p className="text-lg font-semibold">May 5 – 11, 2025</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setWeekStart((prev) => addDays(prev, 7));
              }}
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "WEEK" ? "secondary" : "outline"}
              onClick={() => setViewMode("WEEK")}
            >
              Week
            </Button>
            <Button
              variant={viewMode === "DAY" ? "secondary" : "outline"}
              onClick={() => setViewMode("DAY")}
            >
              Day
            </Button>
          </div>
          {viewMode === "DAY" && (
            <Select
              value={String(selectedDateIndex)}
              onValueChange={(value) => setSelectedDateIndex(Number(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((day, index) => (
                  <SelectItem key={day.toISOString()} value={String(index)}>
                    {day.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <CalendarFiltersBar
          filters={calendarFilters}
          onToggle={toggleCalendarFilter}
          onClear={clearCalendarFilters}
          hasActiveFilters={hasActiveCalendarFilters}
          options={{
            locations,
            rooms,
            programs,
            instructors,
          }}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      {viewMode === "WEEK" ? (
        <WeekView
          sessionsByDate={sessionsByDate}
          onSessionClick={handleSessionClick}
          weekDays={weekDays}
        />
      ) : (
        <DayView
          dayDate={selectedDate}
          sessions={(
            sessionsByDate[selectedDate.toISOString().slice(0, 10)] ?? []
          ).sort((a, b) => a.startTime.localeCompare(b.startTime))}
          onSessionClick={handleSessionClick}
        />
      )}

      <SessionDetailsDrawer
        open={isDrawerOpen}
        session={drawerSession}
        roster={selectedRoster}
        instructorOptions={instructorOptions}
        onClose={() => setIsDrawerOpen(false)}
        onAddParticipant={() =>
          selectedSessionId && handleOpenAddParticipant(selectedSessionId)
        }
        onUpdateParticipantStatus={handleUpdateParticipantStatus}
        onRemoveParticipant={handleRemoveParticipant}
        onCancelSession={handleCancelSession}
        onViewTemplate={handleViewTemplate}
        onChangeInstructor={handleChangeInstructor}
        onMarkAllAttended={handleMarkAllAttended}
      />

      <AddParticipantDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSelectCustomer={handleSelectCustomer}
        onCreateCustomer={handleCreateCustomer}
        searchCustomers={(query) => searchCustomers(apiClient, query)}
      />
    </div>
  );
}

function WeekView({
  sessionsByDate,
  onSessionClick,
  weekDays,
}: {
  sessionsByDate: Record<string, CalendarSession[]>;
  onSessionClick: (sessionId: string) => void;
  weekDays: Date[];
}) {
  const columnHeight = timeSlots.length * SLOT_HEIGHT;

  return (
    <div className="border rounded-xl bg-card overflow-x-auto">
      <div className="min-w-[1150px]">
        <div
          className="grid border-b bg-muted/40"
          style={{ gridTemplateColumns: WEEK_COLUMN_TEMPLATE }}
        >
          <div className="border-r p-3 text-xs font-semibold uppercase text-muted-foreground">
            Time
          </div>
          {weekDays.map((day) => (
            <div key={day.toDateString()} className="border-r p-3 text-sm font-semibold last:border-r-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p>
                {day.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: WEEK_COLUMN_TEMPLATE }}
        >
          <div
            className="relative border-r bg-background"
            style={{ height: columnHeight }}
          >
            {timeSlots.map((slot, index) => (
              <div
                key={slot}
                className={`flex items-start justify-end pr-3 text-xs text-muted-foreground border-b ${
                  index === 0 ? "border-t" : ""
                } ${index === timeSlots.length - 1 ? "border-b-0" : ""}`}
                style={{ height: SLOT_HEIGHT }}
              >
                {formatTimeLabel(slot)}
              </div>
            ))}
          </div>

          {weekDays.map((day) => {
            const iso = day.toISOString().slice(0, 10);
            const daySessions = sessionsByDate[iso] ?? [];

            return (
              <div
                key={iso}
                className="relative border-r bg-background last:border-r-0"
                style={{ height: columnHeight }}
              >
                <div className="absolute inset-0 pointer-events-none">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={slot}
                      className={`border-b ${index === 0 ? "border-t" : ""} ${
                        index === timeSlots.length - 1 ? "border-b-0" : ""
                      }`}
                      style={{ height: SLOT_HEIGHT }}
                    />
                  ))}
                </div>

                {daySessions.map((session) => (
                  <WeekSessionBlock
                    key={session.id}
                    session={session}
                    onClick={() => onSessionClick(session.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayView({
  dayDate,
  sessions,
  onSessionClick,
}: {
  dayDate: Date;
  sessions: CalendarSession[];
  onSessionClick: (sessionId: string) => void;
}) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">
          {dayDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {sessions.length} session{sessions.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No sessions scheduled for this day.
          </p>
        )}

        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionClick(session.id)}
            className="w-full text-left border rounded-lg p-4 hover:bg-muted/50 transition flex flex-col gap-1"
          >
            <div className="flex items-center gap-2">
              <p className="font-medium">{session.name}</p>
              {session.status === "CANCELLED" && (
                <Badge variant="destructive" className="text-xs">
                  Cancelled
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
          {formatTimeLabel(session.startTime)} – {formatTimeLabel(session.endTime)} · {session.room}
            </p>
            <p className="text-sm text-muted-foreground">
              Instructor: {session.instructorName}
            </p>
            <CapacityIndicator session={session} />
          </button>
        ))}
      </div>
    </Card>
  );
}

interface CalendarFiltersBarProps {
  filters: CalendarFilterState;
  onToggle: (key: CalendarFilterKey, value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  options: {
    locations: LocationLookup[];
    rooms: string[];
    programs: string[];
    instructors: InstructorLookup[];
  };
}

function CalendarFiltersBar({
  filters,
  onToggle,
  onClear,
  hasActiveFilters,
  options,
}: CalendarFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {calendarFilterOrder.map((key) => {
        const optionList: FilterOption[] =
          key === "locations"
            ? options.locations.map((loc) => ({ value: loc.id, label: loc.name }))
            : key === "rooms"
              ? options.rooms.map((r) => ({ value: r, label: r }))
              : key === "programs"
                ? options.programs.map((p) => ({ value: p, label: p }))
                : key === "instructors"
                  ? options.instructors.map((inst) => ({
                      value: inst.id,
                label: inst.name ?? inst.email ?? inst.id,
                    }))
                  : [
                      { value: "SCHEDULED", label: "Scheduled" },
                      { value: "CANCELLED", label: "Cancelled" },
                    ];

        return (
          <FilterMenu
            key={key}
            label={calendarFilterLabels[key]}
            selectedValues={filters[key]}
            options={optionList}
            onToggle={(value) => onToggle(key, value)}
          />
        );
      })}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1 text-sm"
          onClick={onClear}
        >
          Clear all
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

function WeekSessionBlock({
  session,
  onClick,
}: {
  session: CalendarSession;
  onClick: () => void;
}) {
  const startHour = parseInt(session.startTime.slice(0, 2), 10);
  const endHour = parseInt(session.endTime.slice(0, 2), 10);
  const startMinutes = parseInt(session.startTime.slice(3, 5), 10);
  const endMinutes = parseInt(session.endTime.slice(3, 5), 10);
  const totalMinutes =
    endHour * 60 + endMinutes - (startHour * 60 + startMinutes);
  const durationHours = totalMinutes / 60;
  const firstSlotHour = parseInt(timeSlots[0].slice(0, 2), 10);
  const topOffset =
    (startHour - firstSlotHour + startMinutes / 60) * SLOT_HEIGHT;
  const height = Math.max((totalMinutes / 60) * SLOT_HEIGHT - 12, 32);
  const isCancelled = session.status === "CANCELLED";
  const isShortEvent = durationHours <= 1;
  const showRoom = durationHours >= 1.25;
  const showInstructor = durationHours >= 1.5;

  return (
    <button
      onClick={onClick}
      className="absolute left-1 right-1 flex flex-col gap-1 overflow-hidden rounded-xl border border-border bg-card px-3 py-2 text-left text-xs shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
      style={{ top: topOffset, height }}
    >
      <div className="space-y-1 overflow-hidden min-h-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight">
          <span
            className={`text-sm font-semibold leading-tight break-words min-w-0 flex-1 ${
              isShortEvent ? "line-clamp-1" : "line-clamp-2"
            }`}
          >
            {session.name}
          </span>
          {isCancelled && (
            <Badge
              variant="destructive"
              className="text-[10px] px-2 py-0 h-5 shrink-0"
            >
              Cancelled
            </Badge>
          )}
        </div>
        <p
          className={`text-muted-foreground text-[11px] ${
            isShortEvent ? "line-clamp-1" : ""
          }`}
        >
          {formatTimeLabel(session.startTime)} – {formatTimeLabel(session.endTime)}
        </p>
        {showRoom && (
          <p className="text-muted-foreground text-[11px] line-clamp-1">
            {session.room}
          </p>
        )}
        {showInstructor && (
          <p className="text-muted-foreground text-[11px] line-clamp-1">
            Instructor: {session.instructorName}
          </p>
        )}
      </div>
    </button>
  );
}

function CapacityIndicator({
  session,
  isCompact = false,
  showStatusText = true,
}: {
  session: CalendarSession;
  isCompact?: boolean;
  showStatusText?: boolean;
}) {
  const isOverCapacity = session.registeredCount > session.maxParticipants;
  const containerClasses = isCompact
    ? "flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] w-full"
    : "flex items-center gap-2";

  return (
    <div className={containerClasses}>
      <Badge
        variant={isOverCapacity ? "destructive" : "secondary"}
        className={isCompact ? "px-2 py-0 text-[11px]" : undefined}
      >
        {session.registeredCount} / {session.maxParticipants}
      </Badge>
      {isOverCapacity && showStatusText && (
        <span
          className={`text-destructive ${
            isCompact ? "text-[11px]" : "text-xs"
          } max-w-full break-words`}
        >
          {isCompact ? "Over capacity" : "Over capacity – review roster"}
        </span>
      )}
    </div>
  );
}

function formatDateLabel(isoDate: string) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
