import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";

export interface PeopleFilters {
  search: string;
  locations: string[];
  statuses: string[];
  membershipPlans: string[];
  tags: string[];
}

interface PeopleFilterBarProps {
  filters: PeopleFilters;
  onFiltersChange: (filters: PeopleFilters) => void;
  availableLocations: string[];
  availableStatuses: string[];
  availablePlans: string[];
  availableTags: string[];
}

export function PeopleFilterBar({
  filters,
  onFiltersChange,
  availableLocations,
  availableStatuses,
  availablePlans,
  availableTags,
}: PeopleFilterBarProps) {
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [planOpen, setPlanOpen] = React.useState(false);
  const [tagOpen, setTagOpen] = React.useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location];
    onFiltersChange({ ...filters, locations: newLocations });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const togglePlan = (plan: string) => {
    const newPlans = filters.membershipPlans.includes(plan)
      ? filters.membershipPlans.filter((p) => p !== plan)
      : [...filters.membershipPlans, plan];
    onFiltersChange({ ...filters, membershipPlans: newPlans });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      locations: [],
      statuses: [],
      membershipPlans: [],
      tags: [],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.locations.length > 0 ||
    filters.statuses.length > 0 ||
    filters.membershipPlans.length > 0 ||
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by name, email, or phone"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search people"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {/* Location Filter */}
          <MultiSelectFilter
            label="Location"
            selectedValues={filters.locations}
            availableValues={availableLocations}
            onToggle={toggleLocation}
          />

          {/* Status Filter */}
          <MultiSelectFilter
            label="Status"
            selectedValues={filters.statuses}
            availableValues={availableStatuses}
            onToggle={toggleStatus}
          />

          {/* Membership Plan Filter */}
          <MultiSelectFilter
            label="Membership Plan"
            selectedValues={filters.membershipPlans}
            availableValues={availablePlans}
            onToggle={togglePlan}
          />

          {/* Tag Filter */}
          <MultiSelectFilter
            label="Tag"
            selectedValues={filters.tags}
            availableValues={availableTags}
            onToggle={toggleTag}
          />

          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-9"
              aria-label="Clear all filters"
            >
              Clear all
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.locations.map((location) => (
            <Badge key={location} variant="secondary" className="gap-1">
              Location: {location}
              <button
                onClick={() => toggleLocation(location)}
                className="ml-1 rounded-full hover:bg-muted"
                aria-label={`Remove ${location} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {status}
              <button
                onClick={() => toggleStatus(status)}
                className="ml-1 rounded-full hover:bg-muted"
                aria-label={`Remove ${status} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.membershipPlans.map((plan) => (
            <Badge key={plan} variant="secondary" className="gap-1">
              Plan: {plan}
              <button
                onClick={() => togglePlan(plan)}
                className="ml-1 rounded-full hover:bg-muted"
                aria-label={`Remove ${plan} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              Tag: {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 rounded-full hover:bg-muted"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component for multi-select filters
interface MultiSelectFilterProps {
  label: string;
  selectedValues: string[];
  availableValues: string[];
  onToggle: (value: string) => void;
}

function MultiSelectFilter({
  label,
  selectedValues,
  availableValues,
  onToggle,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="h-9 gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        {selectedValues.length > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0">
            {selectedValues.length}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-md border border-border bg-popover p-1 shadow-md">
            <div className="max-h-64 overflow-auto" role="listbox">
              {availableValues.map((value) => (
                <button
                  key={value}
                  onClick={() => onToggle(value)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent text-left"
                  role="option"
                  aria-selected={selectedValues.includes(value)}
                >
                  <div
                    className={`h-4 w-4 rounded border ${
                      selectedValues.includes(value)
                        ? "bg-primary border-primary"
                        : "border-input"
                    } flex items-center justify-center`}
                  >
                    {selectedValues.includes(value) && (
                      <div className="h-2 w-2 bg-primary-foreground rounded-sm" />
                    )}
                  </div>
                  <span className="flex-1">{value}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
