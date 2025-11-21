import * as React from "react";
import { Button } from "../../ui/button";
import { StatusBadge, CustomerStatus } from "../StatusBadge";
import { Mail, MessageSquare, Pencil, MapPin } from "lucide-react";

interface CustomerProfileHeaderProps {
  customerName: string;
  status: CustomerStatus;
  primaryLocation: string;
  onEditProfile: () => void;
  onSendEmail: () => void;
  onSendSMS: () => void;
}

export function CustomerProfileHeader({
  customerName,
  status,
  primaryLocation,
  onEditProfile,
  onSendEmail,
  onSendSMS,
}: CustomerProfileHeaderProps) {
  return (
    <div className="border-b border-border pb-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left side - Customer info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>{customerName}</h1>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>{primaryLocation}</span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onEditProfile} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit profile
          </Button>
          <Button variant="outline" onClick={onSendEmail} className="gap-2">
            <Mail className="h-4 w-4" />
            Send email
          </Button>
          <Button variant="outline" onClick={onSendSMS} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Send SMS
          </Button>
        </div>
      </div>
    </div>
  );
}
