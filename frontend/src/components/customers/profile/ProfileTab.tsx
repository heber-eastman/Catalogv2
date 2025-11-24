import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { X, Plus } from "lucide-react";

interface ProfileData {
  personalDetails: {
    firstName: string;
    lastName: string;
    preferredName: string;
    dateOfBirth: string;
  };
  contactInformation: {
    primaryEmail: string;
    primaryPhone: string;
    secondaryPhones: string[];
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  tags: string[];
  communicationPreferences: {
    canEmail: boolean;
    canSMS: boolean;
  };
  customFields: Array<{
    id: string;
    label: string;
    type: "text" | "date" | "dropdown";
    value: string;
    options?: string[];
  }>;
}

interface ProfileTabProps {
  data: ProfileData;
  isEditable?: boolean;
}

export function ProfileTab({ data, isEditable = false }: ProfileTabProps) {
  const [tags, setTags] = React.useState(data.tags);
  const [canEmail, setCanEmail] = React.useState(data.communicationPreferences.canEmail);
  const [canSMS, setCanSMS] = React.useState(data.communicationPreferences.canSMS);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddTag = () => {
    // In real app, would open a tag selection dialog
    console.log("Add tag");
  };

  return (
    <div className="space-y-6">
      {/* Two-column layout on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={data.personalDetails.firstName}
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={data.personalDetails.lastName}
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name</Label>
                <Input
                  id="preferredName"
                  defaultValue={data.personalDetails.preferredName}
                  disabled={!isEditable}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  defaultValue={data.personalDetails.dateOfBirth}
                  disabled={!isEditable}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tags</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add tag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-2">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full hover:bg-muted"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No tags assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Communication Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="canEmail">Email Communications</Label>
                  <p className="text-muted-foreground">
                    Allow sending emails to this customer
                  </p>
                </div>
                <Switch
                  id="canEmail"
                  checked={canEmail}
                  onCheckedChange={setCanEmail}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="canSMS">SMS Communications</Label>
                  <p className="text-muted-foreground">
                    Allow sending text messages to this customer
                  </p>
                </div>
                <Switch
                  id="canSMS"
                  checked={canSMS}
                  onCheckedChange={setCanSMS}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryEmail">Primary Email</Label>
                <Input
                  id="primaryEmail"
                  type="email"
                  defaultValue={data.contactInformation.primaryEmail}
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryPhone">Primary Phone</Label>
                <Input
                  id="primaryPhone"
                  type="tel"
                  defaultValue={data.contactInformation.primaryPhone}
                  disabled={!isEditable}
                />
              </div>

              {data.contactInformation.secondaryPhones.length > 0 && (
                <div className="space-y-2">
                  <Label>Secondary Phones</Label>
                  {data.contactInformation.secondaryPhones.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="tel"
                        defaultValue={phone}
                        disabled={!isEditable}
                      />
                      {isEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Remove phone"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditable && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add phone number
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  defaultValue={data.contactInformation.address.street}
                  disabled={!isEditable}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    defaultValue={data.contactInformation.address.city}
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    defaultValue={data.contactInformation.address.state}
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    defaultValue={data.contactInformation.address.zip}
                    disabled={!isEditable}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.type === "text" && (
                    <Input
                      id={field.id}
                      defaultValue={field.value}
                      disabled={!isEditable}
                    />
                  )}
                  {field.type === "date" && (
                    <Input
                      id={field.id}
                      type="date"
                      defaultValue={field.value}
                      disabled={!isEditable}
                    />
                  )}
                  {field.type === "dropdown" && field.options && (
                    <Select defaultValue={field.value} disabled={!isEditable}>
                      <SelectTrigger id={field.id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              {data.customFields.length === 0 && (
                <p className="text-muted-foreground">No custom fields configured</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Actions */}
      {isEditable && (
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
