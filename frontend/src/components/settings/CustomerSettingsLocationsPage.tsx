import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
import { useApiClient } from "../../hooks/useApiClient";

interface ApiLocation {
  id: string;
  name: string;
  code: string;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  isActive: boolean;
}

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

const emptyFormState = {
  name: "",
  code: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  active: true,
};

const mapApiLocationToLocal = (location: ApiLocation): Location => ({
  id: location.id,
  name: location.name,
  code: location.code,
  address: {
    street: location.addressLine1 ?? "",
    city: location.city ?? "",
    state: location.state ?? "",
    zip: location.postalCode ?? "",
  },
  active: location.isActive,
});

const buildLocationPayload = (data: typeof emptyFormState) => ({
  name: data.name,
  code: data.code,
  addressLine1: data.street || null,
  city: data.city || null,
  state: data.state || null,
  postalCode: data.zip || null,
  isActive: data.active,
});

export function CustomerSettingsLocationsPage() {
  const apiClient = useApiClient();
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);
  const [formData, setFormData] = React.useState(emptyFormState);

  const loadLocations = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiClient<ApiLocation[]>(
        "/api/settings/customers/locations"
      );
      setLocations(data.map(mapApiLocationToLocal));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  React.useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleNewLocation = () => {
    setEditingLocation(null);
    setFormData(emptyFormState);
    setActionError(null);
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
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleSaveLocation = async () => {
    setIsSubmitting(true);
    setActionError(null);
    const payload = buildLocationPayload(formData);

    try {
      const endpoint = editingLocation
        ? `/api/settings/customers/locations/${editingLocation.id}`
        : "/api/settings/customers/locations";
      const method = editingLocation ? "PATCH" : "POST";

      const saved = await apiClient<ApiLocation>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      const normalized = mapApiLocationToLocal(saved);

      setLocations((prev) =>
        editingLocation
          ? prev.map((loc) => (loc.id === normalized.id ? normalized : loc))
          : [...prev, normalized]
      );
      setIsDialogOpen(false);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (locationId: string) => {
    const target = locations.find((loc) => loc.id === locationId);
    if (!target) return;

    try {
      const updated = await apiClient<ApiLocation>(
        `/api/settings/customers/locations/${locationId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: !target.active }),
        }
      );
      setLocations((prev) =>
        prev.map((loc) => (loc.id === locationId ? mapApiLocationToLocal(updated) : loc))
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold leading-tight">Company Locations</h2>
        </div>
        <Button onClick={handleNewLocation} className="gap-2">
          <Plus className="h-4 w-4" />
          New Location
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Locations Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading locations...
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading locations...
              </div>
            ) : (
              locations.map((location) => (
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
              ))
            )}
          </div>

          {!isLoading && locations.length === 0 && (
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

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
            {actionError && (
              <div className="text-sm text-destructive flex-1">
                {actionError}
              </div>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLocation} disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingLocation
                    ? "Update Location"
                    : "Create Location"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
