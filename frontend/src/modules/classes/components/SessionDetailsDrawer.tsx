import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../../../components/ui/drawer";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
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
import { Card, CardContent } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export type RosterStatus =
  | "REGISTERED"
  | "ATTENDED"
  | "NO_SHOW"
  | "CANCELLED_BY_STAFF"
  | "CANCELLED_BY_MEMBER";

export interface SessionRosterEntry {
  id: string;
  customerId: string;
  name: string;
  email?: string;
  phone?: string;
  status: RosterStatus;
  note?: string;
}

export interface ClassSessionDetails {
  id: string;
  templateId: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  dateIso: string;
  locationName: string;
  room: string;
  instructorName: string;
  accessType: "INCLUDED_IN_MEMBERSHIP" | "PAID_DROPIN" | "EITHER";
  dropInPrice?: string;
  currency?: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    ageLabel?: string;
    membersOnly: boolean;
    requiredPlans: string[];
    prerequisite?: string;
  };
  status: "SCHEDULED" | "CANCELLED";
  maxParticipants: number;
  registeredCount: number;
}

interface SessionDetailsDrawerProps {
  open: boolean;
  session: ClassSessionDetails | null;
  roster: SessionRosterEntry[];
  instructorOptions: string[];
  onClose: () => void;
  onAddParticipant: () => void;
  onUpdateParticipantStatus: (participantId: string, status: RosterStatus) => void;
  onRemoveParticipant: (participantId: string) => void;
  onCancelSession: () => void;
  onViewTemplate: (templateId: string) => void;
  onChangeInstructor: (instructorName: string) => void;
  onMarkAllAttended: () => void;
}

const statusCopy: Record<RosterStatus, string> = {
  REGISTERED: "Registered",
  ATTENDED: "Attended",
  NO_SHOW: "No show",
  CANCELLED_BY_STAFF: "Cancelled (staff)",
  CANCELLED_BY_MEMBER: "Cancelled (member)",
};

const statusVariant: Record<RosterStatus, "secondary" | "outline" | "default" | "destructive"> = {
  REGISTERED: "secondary",
  ATTENDED: "default",
  NO_SHOW: "outline",
  CANCELLED_BY_STAFF: "destructive",
  CANCELLED_BY_MEMBER: "outline",
};

export function SessionDetailsDrawer({
  open,
  session,
  roster,
  instructorOptions,
  onClose,
  onAddParticipant,
  onUpdateParticipantStatus,
  onRemoveParticipant,
  onCancelSession,
  onViewTemplate,
  onChangeInstructor,
  onMarkAllAttended,
}: SessionDetailsDrawerProps) {
  const [isEditingInstructor, setIsEditingInstructor] = React.useState(false);
  const [selectedInstructor, setSelectedInstructor] = React.useState(session?.instructorName ?? "");

  React.useEffect(() => {
    setSelectedInstructor(session?.instructorName ?? "");
    setIsEditingInstructor(false);
  }, [session]);

  if (!session) {
    return null;
  }

  const capacityOver = session.registeredCount > session.maxParticipants;

  return (
    <Drawer open={open} onOpenChange={(value) => !value && onClose()} direction="right">
      <DrawerContent className="sm:max-w-xl">
        <DrawerHeader className="gap-2 border-b">
          <DrawerTitle>{session.name}</DrawerTitle>
          <DrawerDescription>
            {session.dateLabel} · {session.timeLabel}
          </DrawerDescription>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{session.locationName}</span>
            <span>•</span>
            <span>{session.room}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.status === "CANCELLED" ? (
              <Badge variant="destructive">Cancelled</Badge>
            ) : (
              <Badge variant="secondary">Scheduled</Badge>
            )}
            <Badge variant="outline">{accessTypeText(session)}</Badge>
            {session.dropInPrice && (
              <Badge variant="outline">
                Drop-in {session.dropInPrice} {session.currency ?? "USD"}
              </Badge>
            )}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  {!isEditingInstructor ? (
                    <p className="text-base font-medium">{session.instructorName}</p>
                  ) : (
                    <Select
                      value={selectedInstructor}
                      onValueChange={(value) => setSelectedInstructor(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructorOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditingInstructor ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onChangeInstructor(selectedInstructor);
                          setIsEditingInstructor(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedInstructor(session.instructorName);
                          setIsEditingInstructor(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingInstructor(true)}
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>

              <EligibilitySummary eligibility={session.eligibility} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  Roster · {session.registeredCount} registered / {session.maxParticipants} capacity
                </p>
                {capacityOver && (
                  <p className="text-xs text-destructive">Over capacity — review roster</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onMarkAllAttended}>
                  Mark all attended
                </Button>
                <Button size="sm" onClick={onAddParticipant}>
                  Add participant
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <p className="text-sm text-muted-foreground text-center py-6">
                          No participants yet.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                  {roster.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{entry.name}</span>
                          {entry.note && (
                            <span className="text-xs text-muted-foreground">Note: {entry.note}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {entry.email || "—"}
                          <br />
                          {entry.phone || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[entry.status]}>
                          {statusCopy[entry.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Participant actions">
                              ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(
                              ["REGISTERED", "ATTENDED", "NO_SHOW", "CANCELLED_BY_STAFF"] as RosterStatus[]
                            ).map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onSelect={(event) => {
                                  event.preventDefault();
                                  onUpdateParticipantStatus(entry.id, status);
                                }}
                              >
                                Set {statusCopy[status]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault();
                                onRemoveParticipant(entry.id);
                              }}
                            >
                              Remove from roster
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="link" className="p-0" onClick={() => onViewTemplate(session.templateId)}>
              View class template
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={onCancelSession}>
                Cancel session
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function EligibilitySummary({
  eligibility,
}: {
  eligibility: ClassSessionDetails["eligibility"];
}) {
  const items: string[] = [];

  if (eligibility.ageLabel || eligibility.minAge || eligibility.maxAge) {
    if (eligibility.ageLabel) {
      items.push(eligibility.ageLabel);
    } else {
      const min = eligibility.minAge ?? "All";
      const max = eligibility.maxAge ?? "ages";
      items.push(`Ages ${min}–${max}`);
    }
  }

  if (eligibility.membersOnly) {
    items.push("Members only");
  }

  if (eligibility.requiredPlans.length > 0) {
    items.push(`Plans: ${eligibility.requiredPlans.join(", ")}`);
  }

  if (eligibility.prerequisite) {
    items.push(`Prerequisite: ${eligibility.prerequisite}`);
  }

  if (items.length === 0) {
    items.push("No eligibility restrictions");
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">Eligibility &amp; prerequisites</p>
      <p className="text-sm text-muted-foreground">{items.join(" • ")}</p>
    </div>
  );
}

function accessTypeText(session: ClassSessionDetails) {
  switch (session.accessType) {
    case "INCLUDED_IN_MEMBERSHIP":
      return "Included in membership";
    case "PAID_DROPIN":
      return "Paid drop-in";
    case "EITHER":
    default:
      return "Included or drop-in";
  }
}
