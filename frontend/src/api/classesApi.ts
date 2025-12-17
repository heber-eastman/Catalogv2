export type ApiClient = <T>(path: string, options?: RequestInit) => Promise<T>;

export type ClassSessionStatus = "SCHEDULED" | "CANCELLED";

export type ClassAttendanceStatus =
  | "REGISTERED"
  | "ATTENDED"
  | "NO_SHOW"
  | "CANCELLED_BY_STAFF"
  | "CANCELLED_BY_MEMBER";

export type ClassSkillLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ALL_LEVELS";

export type ClassAccessType =
  | "INCLUDED_IN_MEMBERSHIP"
  | "PAID_DROPIN"
  | "EITHER";

export interface ClassTemplateListItem {
  id: string;
  organizationId: string;
  locationId: string;
    location?: { id: string; name: string };
  room?: string | null;
  name: string;
  description?: string | null;
  program?: string | null;
  skillLevel: ClassSkillLevel;
  tags: string[];
  startDate: string;
  endDate?: string | null;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  maxParticipants: number;
  accessType: ClassAccessType;
  dropInPriceCents?: number | null;
  currency?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  ageLabel?: string | null;
  membersOnly: boolean;
  prerequisiteLabel?: string | null;
  primaryInstructorUserId: string;
  instructorDisplayName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  requiredPlans?: Array<{
    membershipPlanId: string;
    membershipPlan: {
      id: string;
      name: string;
    };
  }>;
}

export type ClassTemplateDetail = ClassTemplateListItem;
export type ClassTemplateUpsertPayload = Partial<ClassTemplateDetail> & {
  requiredMembershipPlanIds?: string[];
};

export interface ClassRosterEntry {
  id: string;
  sessionId: string;
  customerProfileId: string;
  status: ClassAttendanceStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  customerProfile: {
    id: string;
    firstName: string;
    lastName: string;
    primaryEmail?: string | null;
    primaryPhone?: string | null;
  };
}

export interface ClassSessionListItem {
  id: string;
  templateId: string;
  organizationId: string;
  locationId: string;
  location?: { id: string; name: string };
  room?: string | null;
  startDateTime: string;
  endDateTime: string;
  maxParticipants: number;
  instructorUserId?: string | null;
  instructorDisplayName?: string | null;
  instructor?: { id: string; name: string | null };
  status: ClassSessionStatus;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    name: string;
    program?: string | null;
    skillLevel: ClassSkillLevel;
    accessType: ClassAccessType;
  };
  _count?: {
    rosterEntries: number;
  };
}

export interface ClassSessionDetail {
  id: string;
  templateId: string;
  organizationId: string;
  locationId: string;
  room?: string | null;
  startDateTime: string;
  endDateTime: string;
  maxParticipants: number;
  instructorUserId?: string | null;
  instructorDisplayName?: string | null;
  status: ClassSessionStatus;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string;
    name: string;
    program?: string | null;
    skillLevel: ClassSkillLevel;
    accessType: ClassAccessType;
    minAge?: number | null;
    maxAge?: number | null;
    ageLabel?: string | null;
    membersOnly: boolean;
    prerequisiteLabel?: string | null;
    requiredPlans: Array<{
      membershipPlanId: string;
      membershipPlan: {
        id: string;
        name: string;
      };
    }>;
  };
  rosterEntries: ClassRosterEntry[];
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function createClassesApi(apiClient: ApiClient) {
  return {
    getClassTemplates: async (
      params: Partial<{
        locationId: string;
        program: string;
        instructorUserId: string;
        isActive: boolean;
      }> = {},
    ): Promise<ClassTemplateListItem[]> => {
      const query = buildQuery(params);
      return apiClient<ClassTemplateListItem[]>(`/api/classes/templates${query}`);
    },

    getClassTemplate: async (id: string): Promise<ClassTemplateDetail> => {
      return apiClient<ClassTemplateDetail>(`/api/classes/templates/${id}`);
    },

    createClassTemplate: async (
      payload: ClassTemplateUpsertPayload,
    ): Promise<ClassTemplateDetail> => {
      return apiClient<ClassTemplateDetail>(`/api/classes/templates`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    updateClassTemplate: async (
      id: string,
      payload: ClassTemplateUpsertPayload,
    ): Promise<ClassTemplateDetail> => {
      return apiClient<ClassTemplateDetail>(`/api/classes/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    getClassSessions: async (
      params: {
        startDate: string;
        endDate: string;
        locationId?: string;
        program?: string;
        instructorUserId?: string;
        room?: string;
        status?: ClassSessionStatus;
      },
    ): Promise<ClassSessionListItem[]> => {
      const query = buildQuery(params);
      return apiClient<ClassSessionListItem[]>(`/api/classes/sessions${query}`);
    },

    getClassSession: async (id: string): Promise<ClassSessionDetail> => {
      return apiClient<ClassSessionDetail>(`/api/classes/sessions/${id}`);
    },

    updateClassSession: async (
      id: string,
      payload: Partial<{
        status: ClassSessionStatus;
        cancelReason?: string | null;
        instructorUserId?: string | null;
        instructorDisplayName?: string | null;
      }>,
    ): Promise<ClassSessionDetail> => {
      return apiClient<ClassSessionDetail>(`/api/classes/sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    addSessionParticipant: async (
      sessionId: string,
      payload:
        | {
            customerProfileId: string;
            status?: ClassAttendanceStatus;
          }
        | {
            newCustomer: {
              firstName: string;
              lastName: string;
              email?: string;
              phone?: string;
              dateOfBirth?: string;
            };
          },
    ): Promise<ClassSessionDetail> => {
      return apiClient<ClassSessionDetail>(
        `/api/classes/sessions/${sessionId}/participants`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },

    updateSessionParticipant: async (
      sessionId: string,
      participantId: string,
      payload: { status: ClassAttendanceStatus; note?: string },
    ): Promise<ClassSessionDetail> => {
      return apiClient<ClassSessionDetail>(
        `/api/classes/sessions/${sessionId}/participants/${participantId}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
    },

    removeSessionParticipant: async (
      sessionId: string,
      participantId: string,
    ): Promise<ClassSessionDetail> => {
      return apiClient<ClassSessionDetail>(
        `/api/classes/sessions/${sessionId}/participants/${participantId}`,
        {
          method: "DELETE",
        },
      );
    },
  };
}
