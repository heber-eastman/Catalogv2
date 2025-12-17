import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  FilterMenu,
  FilterOption,
} from "../filters/FilterMenu";
export type { FilterOption };

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
  availableLocations: FilterOption[];
  availableStatuses: FilterOption[];
  availablePlans: FilterOption[];
  availableTags: FilterOption[];
}

export function PeopleFilterBar({
  filters,
  onFiltersChange,
  availableLocations,
  availableStatuses,
  availablePlans,
  availableTags,
}: PeopleFilterBarProps) {
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

  const findLabel = (value: string, options: FilterOption[]) =>
    options.find((option) => option.value === value)?.label ?? value;

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
          <FilterMenu
            label="Location"
            selectedValues={filters.locations}
            options={availableLocations}
            onToggle={toggleLocation}
          />

          {/* Status Filter */}
          <FilterMenu
            label="Status"
            selectedValues={filters.statuses}
            options={availableStatuses}
            onToggle={toggleStatus}
          />

          {/* Membership Plan Filter */}
          <FilterMenu
            label="Membership Plan"
            selectedValues={filters.membershipPlans}
            options={availablePlans}
            onToggle={togglePlan}
          />

          {/* Tag Filter */}
          <FilterMenu
            label="Tag"
            selectedValues={filters.tags}
            options={availableTags}
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
              Location: {findLabel(location, availableLocations)}
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
              Status: {findLabel(status, availableStatuses)}
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
              Plan: {findLabel(plan, availablePlans)}
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
              Tag: {findLabel(tag, availableTags)}
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
