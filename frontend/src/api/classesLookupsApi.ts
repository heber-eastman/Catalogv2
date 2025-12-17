import { ApiClient } from "./classesApi";

export interface LocationLookup {
  id: string;
  name: string;
  code?: string | null;
}

export interface InstructorLookup {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface MembershipPlanLookup {
  id: string;
  name: string;
  isActive?: boolean;
}

type ApiMembershipPlan = {
  id: string;
  name: string;
  isActive: boolean;
};

export function createClassesLookupsApi(apiClient: ApiClient) {
  return {
    getLocations: () =>
      apiClient<LocationLookup[]>("/api/classes/lookups/locations"),
    getInstructors: () =>
      apiClient<InstructorLookup[]>("/api/classes/lookups/instructors"),
    getPrograms: () => apiClient<string[]>("/api/classes/lookups/programs"),
    getRooms: () => apiClient<string[]>("/api/classes/lookups/rooms"),
    getMembershipPlans: () =>
      apiClient<ApiMembershipPlan[]>(
        "/api/settings/customers/membership-plans",
      ).then((plans) =>
        plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          isActive: plan.isActive,
        })),
      ),
  };
}
