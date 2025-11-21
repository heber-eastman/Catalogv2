import * as React from "react";
import { Users, UserPlus, UserCheck, Snowflake, UserX } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { PeopleFilterBar, PeopleFilters } from "./PeopleFilterBar";
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

// Mock data for metrics
const metrics = {
  totalCustomers: { value: 2458, trend: { value: 12.5, label: "from last month" } },
  leads: { value: 342, trend: { value: 8.2, label: "from last month" } },
  activeMembers: { value: 1876, trend: { value: 5.3, label: "from last month" } },
  frozenMembers: { value: 124, trend: { value: -2.1, label: "from last month" } },
  cancelledMembers: { value: 116, trend: { value: -5.4, label: "from last month" } },
};

// Mock data for membership plans chart
const membershipPlanData = [
  { name: "Individual", value: 842, color: "hsl(var(--chart-1))" },
  { name: "Family", value: 567, color: "hsl(var(--chart-2))" },
  { name: "Premium", value: 289, color: "hsl(var(--chart-3))" },
  { name: "Junior", value: 178, color: "hsl(var(--chart-4))" },
];

// Mock data for members by location chart
const membersByLocationData = [
  { location: "North Club", members: 524 },
  { location: "South Club", members: 478 },
  { location: "East Club", members: 421 },
  { location: "West Club", members: 298 },
  { location: "Central Club", members: 155 },
];

// Mock data for people
const mockPeople: Person[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    status: "active" as CustomerStatus,
    primaryLocation: "North Club",
    membershipPlan: "Premium",
    primaryEmail: "sarah.johnson@email.com",
    primaryPhone: "(555) 123-4567",
    tags: ["VIP", "Board Member", "Golf League"],
  },
  {
    id: "2",
    name: "Michael Chen",
    status: "active" as CustomerStatus,
    primaryLocation: "South Club",
    membershipPlan: "Family",
    primaryEmail: "michael.chen@email.com",
    primaryPhone: "(555) 234-5678",
    tags: ["New Member", "Tennis"],
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    status: "frozen" as CustomerStatus,
    primaryLocation: "East Club",
    membershipPlan: "Individual",
    primaryEmail: "emily.rodriguez@email.com",
    primaryPhone: "(555) 345-6789",
    tags: ["Seasonal"],
  },
  {
    id: "4",
    name: "David Park",
    status: "cancelled" as CustomerStatus,
    primaryLocation: "West Club",
    membershipPlan: null,
    primaryEmail: "david.park@email.com",
    primaryPhone: "(555) 456-7890",
    tags: ["Former Member"],
  },
  {
    id: "5",
    name: "Jessica Williams",
    status: "lead" as CustomerStatus,
    primaryLocation: "Central Club",
    membershipPlan: null,
    primaryEmail: "jessica.williams@email.com",
    primaryPhone: "(555) 567-8901",
    tags: ["Interested", "Tour Scheduled"],
  },
  {
    id: "6",
    name: "Robert Taylor",
    status: "active" as CustomerStatus,
    primaryLocation: "North Club",
    membershipPlan: "Individual",
    primaryEmail: "robert.taylor@email.com",
    primaryPhone: "(555) 678-9012",
    tags: ["Golf", "Dining"],
  },
  {
    id: "7",
    name: "Amanda Martinez",
    status: "trial" as CustomerStatus,
    primaryLocation: "South Club",
    membershipPlan: "Junior",
    primaryEmail: "amanda.martinez@email.com",
    primaryPhone: "(555) 789-0123",
    tags: ["Student", "Swimming"],
  },
  {
    id: "8",
    name: "James Anderson",
    status: "active" as CustomerStatus,
    primaryLocation: "East Club",
    membershipPlan: "Family",
    primaryEmail: "james.anderson@email.com",
    primaryPhone: "(555) 890-1234",
    tags: ["Long Term Member", "Events Committee"],
  },
  {
    id: "9",
    name: "Lisa Thompson",
    status: "former" as CustomerStatus,
    primaryLocation: "West Club",
    membershipPlan: null,
    primaryEmail: "lisa.thompson@email.com",
    primaryPhone: "(555) 901-2345",
    tags: [],
  },
  {
    id: "10",
    name: "Christopher Lee",
    status: "active" as CustomerStatus,
    primaryLocation: "Central Club",
    membershipPlan: "Premium",
    primaryEmail: "christopher.lee@email.com",
    primaryPhone: "(555) 012-3456",
    tags: ["Corporate", "Networking", "Wellness"],
  },
  {
    id: "11",
    name: "Michelle Garcia",
    status: "lead" as CustomerStatus,
    primaryLocation: "North Club",
    membershipPlan: null,
    primaryEmail: "michelle.garcia@email.com",
    primaryPhone: "(555) 123-4568",
    tags: ["Referral"],
  },
  {
    id: "12",
    name: "Daniel Brown",
    status: "active" as CustomerStatus,
    primaryLocation: "South Club",
    membershipPlan: "Individual",
    primaryEmail: "daniel.brown@email.com",
    primaryPhone: "(555) 234-5679",
    tags: ["Fitness", "Pool"],
  },
];

// Available filter options
const availableLocations = ["North Club", "South Club", "East Club", "West Club", "Central Club"];
const availableStatuses = ["Lead", "Trial", "Active", "Frozen", "Cancelled", "Former"];
const availablePlans = ["Individual", "Family", "Premium", "Junior"];
const availableTags = [
  "VIP",
  "Board Member",
  "Golf League",
  "New Member",
  "Tennis",
  "Seasonal",
  "Former Member",
  "Interested",
  "Tour Scheduled",
  "Golf",
  "Dining",
  "Student",
  "Swimming",
  "Long Term Member",
  "Events Committee",
  "Corporate",
  "Networking",
  "Wellness",
  "Referral",
  "Fitness",
  "Pool",
];

export function CustomersPage({ onCustomerSelect }: { onCustomerSelect?: (customerId: string) => void }) {
  const [filters, setFilters] = React.useState<PeopleFilters>({
    search: "",
    locations: [],
    statuses: [],
    membershipPlans: [],
    tags: [],
  });

  // Filter people based on active filters
  const filteredPeople = React.useMemo(() => {
    return mockPeople.filter((person) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          person.name.toLowerCase().includes(searchLower) ||
          person.primaryEmail.toLowerCase().includes(searchLower) ||
          person.primaryPhone.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Location filter
      if (filters.locations.length > 0) {
        if (!filters.locations.includes(person.primaryLocation)) return false;
      }

      // Status filter
      if (filters.statuses.length > 0) {
        const statusLabel =
          person.status.charAt(0).toUpperCase() + person.status.slice(1);
        if (!filters.statuses.includes(statusLabel)) return false;
      }

      // Membership plan filter
      if (filters.membershipPlans.length > 0) {
        if (!person.membershipPlan || !filters.membershipPlans.includes(person.membershipPlan)) {
          return false;
        }
      }

      // Tag filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => person.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [filters]);

  const handlePersonClick = (personId: string) => {
    if (onCustomerSelect) {
      onCustomerSelect(personId);
    } else {
      console.log("Navigate to person:", personId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Analytics Section */}
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers.value.toLocaleString()}
            icon={Users}
            trend={metrics.totalCustomers.trend}
          />
          <MetricCard
            title="Leads"
            value={metrics.leads.value.toLocaleString()}
            icon={UserPlus}
            trend={metrics.leads.trend}
          />
          <MetricCard
            title="Active Members"
            value={metrics.activeMembers.value.toLocaleString()}
            icon={UserCheck}
            trend={metrics.activeMembers.trend}
          />
          <MetricCard
            title="Frozen Members"
            value={metrics.frozenMembers.value.toLocaleString()}
            icon={Snowflake}
            trend={metrics.frozenMembers.trend}
          />
          <MetricCard
            title="Cancelled Members"
            value={metrics.cancelledMembers.value.toLocaleString()}
            icon={UserX}
            trend={metrics.cancelledMembers.trend}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Members by Plan"
            description="Distribution of active memberships across plan types"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={membershipPlanData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {membershipPlanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Active Members by Location"
            description="Membership distribution across club locations"
          >
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
          </ChartCard>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* People List Section */}
      <div className="space-y-6">
        {/* Filter Bar */}
        <PeopleFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          availableLocations={availableLocations}
          availableStatuses={availableStatuses}
          availablePlans={availablePlans}
          availableTags={availableTags}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredPeople.length} of {mockPeople.length} people
          </p>
        </div>

        {/* People Table */}
        <PeopleTable people={filteredPeople} onPersonClick={handlePersonClick} />
      </div>
    </div>
  );
}