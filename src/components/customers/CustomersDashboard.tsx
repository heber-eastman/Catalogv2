import * as React from "react";
import { Users, UserPlus, UserCheck, Snowflake, UserX } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { RecentActivityCard } from "./RecentActivityCard";
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

// Mock data for recent activity
const recentActivities = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    customerInitials: "SJ",
    action: "Upgraded to Premium membership",
    type: "updated" as const,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    customerName: "Michael Chen",
    customerInitials: "MC",
    action: "New family membership created",
    type: "new" as const,
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    customerName: "Emily Rodriguez",
    customerInitials: "ER",
    action: "Membership frozen for 3 months",
    type: "frozen" as const,
    timestamp: "6 hours ago",
  },
  {
    id: "4",
    customerName: "David Park",
    customerInitials: "DP",
    action: "Membership cancelled - moving out of area",
    type: "cancelled" as const,
    timestamp: "1 day ago",
  },
  {
    id: "5",
    customerName: "Jessica Williams",
    customerInitials: "JW",
    action: "Updated contact information",
    type: "updated" as const,
    timestamp: "1 day ago",
  },
];

export function CustomersDashboard() {
  return (
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

      {/* Recent Activity */}
      <RecentActivityCard activities={recentActivities} />
    </div>
  );
}