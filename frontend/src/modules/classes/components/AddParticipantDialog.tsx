import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Card, CardContent } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Badge } from "../../../components/ui/badge";

interface AddParticipantDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectCustomer: (customerId: string) => Promise<boolean | void> | void;
  onCreateCustomer: (customer: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
  }) => Promise<{ id: string; firstName: string; lastName: string } | null>;
  searchCustomers: (query: string) => Promise<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
    }>
  >;
}

export function AddParticipantDialog({
  open,
  onClose,
  onSelectCustomer,
  onCreateCustomer,
  searchCustomers,
}: AddParticipantDialogProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [createForm, setCreateForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [latestCustomer, setLatestCustomer] = React.useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [searchResults, setSearchResults] = React.useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
    }>
  >([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
      setCreateForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
      });
      setError(null);
      setLatestCustomer(null);
    }
  }, [open]);

  React.useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchValue.trim()) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }
      setSearchLoading(true);
      setSearchError(null);
      try {
        const results = await searchCustomers(searchValue.trim());
        setSearchResults(results);
      } catch (err) {
        console.error(err);
        setSearchError("Search failed");
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchValue, searchCustomers]);

  const handleCreate = async () => {
    if (!createForm.firstName || !createForm.lastName) {
      setError("First and last name are required.");
      return;
    }
    if (!createForm.email && !createForm.phone) {
      setError("Provide at least an email or phone.");
      return;
    }

    const created = await onCreateCustomer({
      firstName: createForm.firstName,
      lastName: createForm.lastName,
      email: createForm.email || undefined,
      phone: createForm.phone || undefined,
      dateOfBirth: createForm.dob || undefined,
    });
    setError(null);
    if (created) {
      setLatestCustomer(created);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add participant</DialogTitle>
          <DialogDescription>
            Choose an existing customer or quick-create a new profile.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            <Label htmlFor="participant-search">Search customers</Label>
            <Input
              id="participant-search"
              placeholder="Search by name, email, or phone"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <ScrollArea className="h-64 border rounded-lg">
              <div className="divide-y">
                {searchLoading && (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    Searching...
                  </p>
                )}
                {searchError && (
                  <p className="text-sm text-destructive p-4 text-center">{searchError}</p>
                )}
                {!searchLoading &&
                  !searchError &&
                  searchResults.map((customer) => (
                    <button
                      key={customer.id}
                  onClick={async () => {
                    await onSelectCustomer(customer.id);
                  }}
                      className="w-full text-left p-3 hover:bg-muted/50 flex justify-between items-center gap-4"
                    >
                      <div>
                        <p className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email || "No email"} · {customer.phone || "No phone"}
                        </p>
                      </div>
                      <Badge variant="secondary">Add</Badge>
                    </button>
                  ))}
                {!searchLoading && !searchError && searchResults.length === 0 && searchValue && (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    No matching customers
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="font-medium">Quick create customer</p>
                <p className="text-sm text-muted-foreground">
                  Minimal details to keep the flow fast.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-first-name">First name</Label>
                <Input
                  id="create-first-name"
                  value={createForm.firstName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  placeholder="First name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-last-name">Last name</Label>
                <Input
                  id="create-last-name"
                  value={createForm.lastName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  placeholder="Last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  value={createForm.phone}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-dob">Date of birth</Label>
                <Input
                  id="create-dob"
                  type="date"
                  value={createForm.dob}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, dob: event.target.value }))
                  }
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {latestCustomer && (
                <div className="text-sm text-green-600 space-y-1">
                  <p>
                    Added {latestCustomer.firstName} {latestCustomer.lastName} to roster.
                  </p>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="secondary" onClick={handleCreate}>
                  Create &amp; add
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </DialogFooter>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
