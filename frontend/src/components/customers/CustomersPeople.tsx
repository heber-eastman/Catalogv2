import * as React from "react";
import { Button } from "../ui/button";
import { Download, Plus } from "lucide-react";
import { FilterOption, PeopleFilterBar, PeopleFilters } from "./PeopleFilterBar";
import { PeopleTable, Person } from "./PeopleTable";
import { CustomerStatus } from "./StatusBadge";

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

const toOptions = (values: string[]): FilterOption[] =>
  values.map((value) => ({ value, label: value }));

export function CustomersPeople({ onCustomerSelect }: { onCustomerSelect?: (customerId: string) => void }) {
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

  const handleNewPerson = () => {
    // TODO: Open new person dialog
    console.log("Open new person dialog");
  };

  const handleExportCSV = () => {
    // TODO: Export data to CSV
    console.log("Export to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PeopleFilterBar
        filters={filters}
        onFiltersChange={setFilters}
          availableLocations={toOptions(availableLocations)}
          availableStatuses={toOptions(availableStatuses)}
          availablePlans={toOptions(availablePlans)}
          availableTags={toOptions(availableTags)}
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
  );
}