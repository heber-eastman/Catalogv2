import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Plus, Pencil, MapPin } from "lucide-react";

interface Location {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  active: boolean;
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "North Club",
    code: "NORTH",
    address: {
      street: "1000 Country Club Drive",
      city: "Springfield",
      state: "CA",
      zip: "90210",
    },
    active: true,
  },
  {
    id: "2",
    name: "South Club",
    code: "SOUTH",
    address: {
      street: "2500 Golf Course Road",
      city: "Springfield",
      state: "CA",
      zip: "90211",
    },
    active: true,
  },
  {
    id: "3",
    name: "East Facility",
    code: "EAST",
    address: {
      street: "750 Sports Complex Lane",
      city: "Springfield",
      state: "CA",
      zip: "90212",
    },
    active: false,
  },
];

export function CustomerSettingsLocationsPage() {
  const [locations, setLocations] = React.useState(mockLocations);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    active: true,
  });

  const handleNewLocation = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      code: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      code: location.code,
      street: location.address.street,
      city: location.address.city,
      state: location.address.state,
      zip: location.address.zip,
      active: location.active,
    });
    setIsDialogOpen(true);
  };

  const handleSaveLocation = () => {
    if (editingLocation) {
      // Update existing location
      setLocations(
        locations.map((loc) =>
          loc.id === editingLocation.id
            ? {
                ...loc,
                name: formData.name,
                code: formData.code,
                address: {
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  zip: formData.zip,
                },
                active: formData.active,
              }
            : loc
        )
      );
    } else {
      // Create new location
      const newLocation: Location = {
        id: (locations.length + 1).toString(),
        name: formData.name,
        code: formData.code,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        active: formData.active,
      };
      setLocations([...locations, newLocation]);
    }
    setIsDialogOpen(false);
  };

  const handleToggleActive = (locationId: string) => {
    setLocations(
      locations.map((loc) =>
        loc.id === locationId ? { ...loc, active: !loc.active } : loc
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2>Customer Locations</h2>
          <p className="text-muted-foreground">
            Manage physical locations where customers can access services
          </p>
        </div>
        <Button onClick={handleNewLocation} className="gap-2">
          <Plus className="h-4 w-4" />
          New Location
        </Button>
      </div>

      {/* Locations Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left" scope="col">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left" scope="col">
                      Active
                    </th>
                    <th className="px-4 py-3 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {location.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {location.code}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {location.address.street}, {location.address.city},{" "}
                        {location.address.state} {location.address.zip}
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={location.active}
                          onCheckedChange={() => handleToggleActive(location.id)}
                          aria-label={`Toggle ${location.name} active status`}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLocation(location)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {locations.map((location) => (
              <div key={location.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p>{location.name}</p>
                    </div>
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {location.code}
                    </code>
                  </div>
                  <Switch
                    checked={location.active}
                    onCheckedChange={() => handleToggleActive(location.id)}
                    aria-label={`Toggle ${location.name} active status`}
                  />
                </div>

                <p className="text-muted-foreground">
                  {location.address.street}, {location.address.city},{" "}
                  {location.address.state} {location.address.zip}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditLocation(location)}
                  className="w-full gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Location
                </Button>
              </div>
            ))}
          </div>

          {locations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No locations configured. Click "New Location" to add one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "New Location"}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? "Update the location details below."
                : "Add a new customer location."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="North Club"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-code">Code / Slug</Label>
              <Input
                id="location-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="NORTH"
              />
              <p className="text-muted-foreground">
                Unique identifier (letters and numbers only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-street">Street Address</Label>
              <Input
                id="location-street"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                placeholder="1000 Country Club Drive"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="location-city">City</Label>
                <Input
                  id="location-city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Springfield"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-state">State</Label>
                <Input
                  id="location-state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="CA"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-zip">ZIP Code</Label>
                <Input
                  id="location-zip"
                  value={formData.zip}
                  onChange={(e) =>
                    setFormData({ ...formData, zip: e.target.value })
                  }
                  placeholder="90210"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="location-active">Active</Label>
                <p className="text-muted-foreground">
                  Location is available for customer assignment
                </p>
              </div>
              <Switch
                id="location-active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocation}>
              {editingLocation ? "Update Location" : "Create Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
