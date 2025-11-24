import * as React from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Snowflake,
  UserX,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { FilterOption, PeopleFilterBar, PeopleFilters } from "./PeopleFilterBar";
import { PeopleTable, Person } from "./PeopleTable";
import { CustomerStatus } from "./StatusBadge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useApiClient } from "../../hooks/useApiClient";

const STATUS_OPTIONS: FilterOption[] = [
  { value: "LEAD", label: "Lead" },
  { value: "TRIAL", label: "Trial" },
  { value: "ACTIVE", label: "Active" },
  { value: "FROZEN", label: "Frozen" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FORMER", label: "Former" },
];

const STATUS_TO_BADGE: Record<string, CustomerStatus> = {
  LEAD: "lead",
  TRIAL: "trial",
  ACTIVE: "active",
  FROZEN: "frozen",
  CANCELLED: "cancelled",
  FORMER: "former",
};

interface ApiCustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  status: string;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  tags: string[];
  primaryLocation: { id: string; name: string } | null;
  memberships: Array<{
    id: string;
    status: string;
    membershipPlan: { id: string; name: string } | null;
  }>;
}

interface ApiLocationOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface ApiMembershipPlanOption {
  id: string;
  name: string;
  isActive: boolean;
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CustomersPage({
  onCustomerSelect,
  refreshKey = 0,
}: {
  onCustomerSelect?: (customerId: string) => void;
  refreshKey?: number;
}) {
  const apiClient = useApiClient();
  const [filters, setFilters] = React.useState<PeopleFilters>({
    search: "",
    locations: [],
    statuses: [],
    membershipPlans: [],
    tags: [],
  });
  const [customers, setCustomers] = React.useState<ApiCustomerListItem[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [locationOptions, setLocationOptions] = React.useState<FilterOption[]>([]);
  const [planOptions, setPlanOptions] = React.useState<FilterOption[]>([]);

  const loadFilterOptions = React.useCallback(async () => {
    setIsLoadingFilters(true);
    try {
      const [locations, plans] = await Promise.all([
        apiClient<ApiLocationOption[]>("/api/settings/customers/locations"),
        apiClient<ApiMembershipPlanOption[]>("/api/settings/customers/membership-plans"),
      ]);

      setLocationOptions(
        locations
          .filter((location) => location.isActive)
          .map((location) => ({ value: location.id, label: location.name }))
      );
      setPlanOptions(
        plans
          .filter((plan) => plan.isActive)
          .map((plan) => ({ value: plan.id, label: plan.name }))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingFilters(false);
    }
  }, [apiClient]);

  const loadCustomers = React.useCallback(async () => {
    setIsLoadingCustomers(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.locations.length) params.set("locations", filters.locations.join(","));
      if (filters.statuses.length) params.set("statuses", filters.statuses.join(","));
      if (filters.membershipPlans.length) {
        params.set("membershipPlanIds", filters.membershipPlans.join(","));
      }
      if (filters.tags.length) params.set("tags", filters.tags.join(","));

      const query = params.toString();
      const response = await apiClient<ApiCustomerListItem[]>(
        query ? `/api/customers?${query}` : "/api/customers"
      );
      setCustomers(response);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [apiClient, filters]);

    React.useEffect(() => {
      loadFilterOptions();
    }, [loadFilterOptions]);

    React.useEffect(() => {
      loadCustomers();
    }, [loadCustomers, refreshKey]);

  const people = React.useMemo<Person[]>(() => {
    return customers.map((customer) => {
      const badgeStatus =
        STATUS_TO_BADGE[customer.status] ?? STATUS_TO_BADGE.LEAD;
      const membershipName =
        customer.memberships[0]?.membershipPlan?.name ?? null;

      return {
        id: customer.id,
        name: customer.preferredName?.trim()
          ? customer.preferredName
          : `${customer.firstName} ${customer.lastName}`.trim(),
        status: badgeStatus,
        primaryLocation: customer.primaryLocation?.name ?? "Unassigned",
        membershipPlan: membershipName,
        primaryEmail: customer.primaryEmail ?? "—",
        primaryPhone: customer.primaryPhone ?? "—",
        tags: customer.tags ?? [],
      };
    });
  }, [customers]);

  const tagOptions = React.useMemo<FilterOption[]>(() => {
    const tags = new Set<string>();
    customers.forEach((customer) => {
      customer.tags?.forEach((tag) => {
        if (tag.trim()) {
          tags.add(tag);
        }
      });
    });
    return Array.from(tags)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({ value: tag, label: tag }));
  }, [customers]);

  const membershipPlanChartData = React.useMemo(() => {
    const counts = new Map<string, number>();
    people.forEach((person) => {
      const key = person.membershipPlan ?? "No Plan";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }));
  }, [people]);

  const membersByLocationData = React.useMemo(() => {
    const counts = new Map<string, number>();
    people.forEach((person) => {
      counts.set(person.primaryLocation, (counts.get(person.primaryLocation) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([location, members]) => ({
      location,
      members,
    }));
  }, [people]);

  const metrics = React.useMemo(() => {
    const totals = {
      totalCustomers: people.length,
      leads: 0,
      active: 0,
      frozen: 0,
      cancelled: 0,
    };

    people.forEach((person) => {
      switch (person.status) {
        case "lead":
          totals.leads += 1;
          break;
        case "active":
          totals.active += 1;
          break;
        case "frozen":
          totals.frozen += 1;
          break;
        case "cancelled":
        case "former":
          totals.cancelled += 1;
          break;
        default:
          break;
      }
    });

    return totals;
  }, [people]);

  const handlePersonClick = React.useCallback(
    (personId: string) => {
      if (onCustomerSelect) {
        onCustomerSelect(personId);
      }
    },
    [onCustomerSelect]
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard title="Total Customers" value={metrics.totalCustomers} icon={Users} />
          <MetricCard title="Leads" value={metrics.leads} icon={UserPlus} />
          <MetricCard title="Active Members" value={metrics.active} icon={UserCheck} />
          <MetricCard title="Frozen Members" value={metrics.frozen} icon={Snowflake} />
          <MetricCard title="Cancelled/Former" value={metrics.cancelled} icon={UserX} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Members by Plan"
            description="Distribution of customers across membership plans"
          >
            {membershipPlanChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipPlanChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {membershipPlanChartData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No membership data yet
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Customers by Location"
            description="Where members are primarily assigned"
          >
            {membersByLocationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={membersByLocationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="location"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No location data yet
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="space-y-6">
        <PeopleFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          availableLocations={locationOptions}
          availableStatuses={STATUS_OPTIONS}
          availablePlans={planOptions}
          availableTags={tagOptions}
        />

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {isLoadingCustomers
              ? "Loading customers…"
              : `Showing ${people.length} customer${people.length === 1 ? "" : "s"}`}
          </p>
          {isLoadingFilters && <p className="text-xs text-muted-foreground">Syncing filter options…</p>}
        </div>

        {isLoadingCustomers ? (
          <div className="flex items-center justify-center rounded-lg border border-border py-12 text-muted-foreground">
            Loading customer records…
          </div>
        ) : (
          <PeopleTable people={people} onPersonClick={handlePersonClick} />
        )}
      </div>
    </div>
  );
}