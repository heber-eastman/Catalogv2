import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Zap,
  Plus,
  Send,
} from "lucide-react";

type InteractionType = "note" | "phone" | "email" | "sms" | "automation";

interface Interaction {
  id: string;
  type: InteractionType;
  timestamp: string;
  staffUser: string;
  summary: string;
  body: string;
  isOutbound?: boolean;
}

interface InteractionsTabProps {
  interactions: Interaction[];
}

const interactionConfig: Record<
  InteractionType,
  { icon: React.ElementType; label: string; color: string }
> = {
  note: {
    icon: FileText,
    label: "Note",
    color: "text-gray-600",
  },
  phone: {
    icon: Phone,
    label: "Phone Call",
    color: "text-blue-600",
  },
  email: {
    icon: Mail,
    label: "Email",
    color: "text-green-600",
  },
  sms: {
    icon: MessageSquare,
    label: "SMS",
    color: "text-purple-600",
  },
  automation: {
    icon: Zap,
    label: "Automation",
    color: "text-orange-600",
  },
};

export function InteractionsTab({ interactions }: InteractionsTabProps) {
  const [showLogForm, setShowLogForm] = React.useState(false);
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [showSMSForm, setShowSMSForm] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* New Interaction Actions */}
      <Card>
        <CardHeader>
          <CardTitle>New Interaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLogForm(!showLogForm);
                setShowEmailForm(false);
                setShowSMSForm(false);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Log Interaction
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailForm(!showEmailForm);
                setShowLogForm(false);
                setShowSMSForm(false);
              }}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSMSForm(!showSMSForm);
                setShowLogForm(false);
                setShowEmailForm(false);
              }}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Send SMS
            </Button>
          </div>

          {/* Log Interaction Form */}
          {showLogForm && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="interactionType">Interaction Type</Label>
                <Select defaultValue="note">
                  <SelectTrigger id="interactionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email (logged)</SelectItem>
                    <SelectItem value="sms">SMS (logged)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interactionChannel">Channel (Optional)</Label>
                <Input
                  id="interactionChannel"
                  placeholder="e.g., Front desk, Phone, In person"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interactionNote">Note</Label>
                <Textarea
                  id="interactionNote"
                  placeholder="Add details about this interaction..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowLogForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => console.log("Log interaction")}>
                  Save Interaction
                </Button>
              </div>
            </div>
          )}

          {/* Send Email Form */}
          {showEmailForm && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Template (Optional)</Label>
                <Select>
                  <SelectTrigger id="emailTemplate">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="renewal">Renewal Reminder</SelectItem>
                    <SelectItem value="payment">Payment Confirmation</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSubject">Subject</Label>
                <Input id="emailSubject" placeholder="Email subject" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailBody">Message</Label>
                <Textarea
                  id="emailBody"
                  placeholder="Email message..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEmailForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => console.log("Send email")} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          )}

          {/* Send SMS Form */}
          {showSMSForm && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="smsTemplate">Template (Optional)</Label>
                <Select>
                  <SelectTrigger id="smsTemplate">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment Reminder</SelectItem>
                    <SelectItem value="confirmation">Confirmation</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsBody">Message</Label>
                <Textarea
                  id="smsBody"
                  placeholder="SMS message..."
                  rows={4}
                  maxLength={160}
                />
                <p className="text-muted-foreground">160 characters maximum</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowSMSForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => console.log("Send SMS")} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send SMS
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {interactions.length > 0 ? (
            <div className="space-y-6">
              {interactions.map((interaction, index) => {
                const config = interactionConfig[interaction.type];
                const Icon = config.icon;

                return (
                  <div key={interaction.id} className="relative">
                    {/* Timeline line */}
                    {index < interactions.length - 1 && (
                      <div
                        className="absolute left-5 top-12 bottom-0 w-px bg-border"
                        aria-hidden="true"
                      />
                    )}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${
                          interaction.isOutbound ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-6">
                        <div
                          className={`rounded-lg border ${
                            interaction.isOutbound
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background"
                          } p-4 space-y-2`}
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1">
                              <p>
                                <span className={config.color}>{config.label}</span>
                                {interaction.isOutbound && (
                                  <span className="ml-2 text-muted-foreground">
                                    (Outbound)
                                  </span>
                                )}
                              </p>
                              <p className="text-muted-foreground">
                                {interaction.timestamp} • {interaction.staffUser}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p>{interaction.summary}</p>
                            {interaction.body && (
                              <p className="text-muted-foreground">
                                {interaction.body}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No interactions recorded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
