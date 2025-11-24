import * as React from "react";
import { StatusBadge, CustomerStatus } from "./StatusBadge";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";

export interface Person {
  id: string;
  name: string;
  status: CustomerStatus;
  primaryLocation: string;
  membershipPlan: string | null;
  primaryEmail: string;
  primaryPhone: string;
  tags: string[];
}

interface PeopleTableProps {
  people: Person[];
  onPersonClick: (personId: string) => void;
}

export function PeopleTable({ people, onPersonClick }: PeopleTableProps) {
  if (people.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 border border-border rounded-lg bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground">No people found</p>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left" scope="col">
                  Name
                </th>
                <th className="px-4 py-3 text-left" scope="col">
                  Status
                </th>
                <th className="px-4 py-3 text-left" scope="col">
                  Primary Location
                </th>
                <th className="px-4 py-3 text-left" scope="col">
                  Membership Plan
                </th>
                <th className="px-4 py-3 text-left" scope="col">
                  Primary Email
                </th>
                <th className="px-4 py-3 text-left" scope="col">
                  Primary Phone
                </th>
                <th className="px-4 py-3 text-left" scope="col">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {people.map((person) => (
                <tr
                  key={person.id}
                  onClick={() => onPersonClick(person.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPersonClick(person.id);
                    }
                  }}
                  className="hover:bg-muted/50 cursor-pointer transition-colors focus-within:bg-muted/50"
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${person.name}'s profile`}
                >
                  <td className="px-4 py-3">
                    <span className="truncate block max-w-[200px]">
                      {person.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={person.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground truncate block max-w-[150px]">
                      {person.primaryLocation}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground truncate block max-w-[150px]">
                      {person.membershipPlan || "None"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground truncate block max-w-[200px]">
                      {person.primaryEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground truncate block max-w-[150px]">
                      {person.primaryPhone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 max-w-[200px] overflow-hidden">
                      {person.tags.slice(0, 1).map((tag) => (
                        <Badge key={tag} variant="outline" className="shrink-0">
                          {tag}
                        </Badge>
                      ))}
                      {person.tags.length > 1 && (
                        <Badge variant="outline" className="shrink-0">
                          +{person.tags.length - 1}
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {people.map((person) => (
          <Card
            key={person.id}
            onClick={() => onPersonClick(person.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPersonClick(person.id);
              }
            }}
            className="cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring"
            tabIndex={0}
            role="button"
            aria-label={`View ${person.name}'s profile`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="truncate">{person.name}</p>
                  <p className="text-muted-foreground truncate">
                    {person.primaryEmail}
                  </p>
                </div>
                <StatusBadge status={person.status} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="truncate">{person.primaryLocation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="truncate">{person.primaryPhone}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Membership</p>
                <p className="truncate">
                  {person.membershipPlan || "None"}
                </p>
              </div>

              {person.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {person.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {person.tags.length > 3 && (
                    <Badge variant="outline">
                      +{person.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}