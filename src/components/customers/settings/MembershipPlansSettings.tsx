import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Plus, Edit, Trash2, Users } from "lucide-react";

// Conceptual route: /settings/customers/membership-plans

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "annual";
  benefits: string[];
  activeMembers: number;
  isActive: boolean;
}

const mockPlans: MembershipPlan[] = [
  {
    id: "1",
    name: "Gold Membership",
    price: 299,
    interval: "monthly",
    benefits: ["Unlimited tee times", "Pro shop discount", "Free cart rental"],
    activeMembers: 234,
    isActive: true,
  },
  {
    id: "2",
    name: "Silver Membership",
    price: 1999,
    interval: "annual",
    benefits: ["Priority booking", "10% pro shop discount"],
    activeMembers: 156,
    isActive: true,
  },
  {
    id: "3",
    name: "Bronze Membership",
    price: 99,
    interval: "monthly",
    benefits: ["5% pro shop discount", "Member newsletter"],
    activeMembers: 412,
    isActive: true,
  },
];

export function MembershipPlansSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Membership Plans</h2>
          <p className="text-muted-foreground">
            Create and manage membership tiers and pricing
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="text-foreground">
                      ${plan.price}
                    </span>
                    /{plan.interval === "monthly" ? "mo" : "yr"}
                  </CardDescription>
                </div>
                {plan.isActive && <Badge variant="default">Active</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4>Benefits</h4>
                <ul className="space-y-1">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-success mt-1">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{plan.activeMembers} active members</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>Side-by-side comparison of all membership plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Active Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>${plan.price}</TableCell>
                    <TableCell className="capitalize">{plan.interval}</TableCell>
                    <TableCell>{plan.activeMembers}</TableCell>
                    <TableCell>
                      {plan.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
