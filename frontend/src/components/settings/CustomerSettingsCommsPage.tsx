import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Mail, MessageSquare, Pencil, Plus, CheckCircle2, XCircle } from "lucide-react";

interface EmailChannel {
  fromName: string;
  fromEmail: string;
  configured: boolean;
}

interface SMSChannel {
  senderId: string;
  phoneNumber: string;
  configured: boolean;
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: "email" | "sms";
  subject?: string; // email only
  body: string;
  lastUpdated: string;
  usedInAutomations: number;
}

const mockEmailChannel: EmailChannel = {
  fromName: "Springfield Country Club",
  fromEmail: "membership@springfieldcc.com",
  configured: true,
};

const mockSMSChannel: SMSChannel = {
  senderId: "SCCCLUB",
  phoneNumber: "+1 (555) 123-4567",
  configured: true,
};

const mockTemplates: CommunicationTemplate[] = [
  {
    id: "1",
    name: "Welcome Email",
    type: "email",
    subject: "Welcome to {{club_name}}!",
    body: "Dear {{first_name}},\n\nWelcome to our club! We're excited to have you as part of our community.\n\nYour membership plan: {{plan_name}}\nStart date: {{start_date}}\n\nBest regards,\nThe Team",
    lastUpdated: "2025-01-15",
    usedInAutomations: 2,
  },
  {
    id: "2",
    name: "Renewal Reminder",
    type: "email",
    subject: "Your membership renews in {{days_until}} days",
    body: "Hi {{first_name}},\n\nYour {{plan_name}} membership will renew on {{renewal_date}}.\n\nAmount: ${{renewal_amount}}\n\nThank you for being a valued member!",
    lastUpdated: "2025-01-10",
    usedInAutomations: 1,
  },
  {
    id: "3",
    name: "Welcome SMS",
    type: "sms",
    body: "Welcome {{first_name}}! Thanks for joining {{club_name}}. Questions? Reply to this message or call us.",
    lastUpdated: "2025-01-12",
    usedInAutomations: 1,
  },
  {
    id: "4",
    name: "Payment Confirmation",
    type: "email",
    subject: "Payment received - {{invoice_number}}",
    body: "Hi {{first_name}},\n\nWe've received your payment of ${{amount}}.\n\nInvoice: {{invoice_number}}\nDate: {{payment_date}}\n\nThank you!",
    lastUpdated: "2025-01-08",
    usedInAutomations: 0,
  },
];

const mergeFields = [
  { token: "{{first_name}}", label: "First Name" },
  { token: "{{last_name}}", label: "Last Name" },
  { token: "{{email}}", label: "Email" },
  { token: "{{plan_name}}", label: "Plan Name" },
  { token: "{{club_name}}", label: "Club Name" },
  { token: "{{start_date}}", label: "Start Date" },
  { token: "{{renewal_date}}", label: "Renewal Date" },
  { token: "{{amount}}", label: "Amount" },
];

export function CustomerSettingsCommsPage() {
  const [emailChannel, setEmailChannel] = React.useState(mockEmailChannel);
  const [smsChannel, setSMSChannel] = React.useState(mockSMSChannel);
  const [templates, setTemplates] = React.useState(mockTemplates);
  const [activeTemplateType, setActiveTemplateType] = React.useState<"email" | "sms">("email");
  const [isChannelDialogOpen, setIsChannelDialogOpen] = React.useState(false);
  const [editingChannel, setEditingChannel] = React.useState<"email" | "sms" | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<CommunicationTemplate | null>(null);
  const [templateFormData, setTemplateFormData] = React.useState({
    name: "",
    type: "email" as "email" | "sms",
    subject: "",
    body: "",
  });
  const [channelFormData, setChannelFormData] = React.useState({
    fromName: "",
    fromEmail: "",
    senderId: "",
    phoneNumber: "",
  });

  const handleEditEmailChannel = () => {
    setEditingChannel("email");
    setChannelFormData({
      fromName: emailChannel.fromName,
      fromEmail: emailChannel.fromEmail,
      senderId: "",
      phoneNumber: "",
    });
    setIsChannelDialogOpen(true);
  };

  const handleEditSMSChannel = () => {
    setEditingChannel("sms");
    setChannelFormData({
      fromName: "",
      fromEmail: "",
      senderId: smsChannel.senderId,
      phoneNumber: smsChannel.phoneNumber,
    });
    setIsChannelDialogOpen(true);
  };

  const handleSaveChannel = () => {
    if (editingChannel === "email") {
      setEmailChannel({
        fromName: channelFormData.fromName,
        fromEmail: channelFormData.fromEmail,
        configured: true,
      });
    } else if (editingChannel === "sms") {
      setSMSChannel({
        senderId: channelFormData.senderId,
        phoneNumber: channelFormData.phoneNumber,
        configured: true,
      });
    }
    setIsChannelDialogOpen(false);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateFormData({
      name: "",
      type: activeTemplateType,
      subject: "",
      body: "",
    });
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: CommunicationTemplate) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || "",
      body: template.body,
    });
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: templateFormData.name,
                type: templateFormData.type,
                subject: templateFormData.subject,
                body: templateFormData.body,
                lastUpdated: new Date().toISOString().split("T")[0],
              }
            : t
        )
      );
    } else {
      // Create new template
      const newTemplate: CommunicationTemplate = {
        id: (templates.length + 1).toString(),
        name: templateFormData.name,
        type: templateFormData.type,
        subject: templateFormData.subject,
        body: templateFormData.body,
        lastUpdated: new Date().toISOString().split("T")[0],
        usedInAutomations: 0,
      };
      setTemplates([...templates, newTemplate]);
    }
    setIsTemplateDialogOpen(false);
  };

  const handleInsertMergeField = (token: string) => {
    setTemplateFormData({
      ...templateFormData,
      body: templateFormData.body + token,
    });
  };

  const filteredTemplates = templates.filter((t) => t.type === activeTemplateType);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2>Customer Communications</h2>
        <p className="text-muted-foreground">
          Configure communication channels and message templates
        </p>
      </div>

      {/* Channels Section */}
      <div className="space-y-4">
        <h3>Communication Channels</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Email Channel Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Email Channel</CardTitle>
                </div>
                {emailChannel.configured ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">From Name</p>
                <p>{emailChannel.fromName || "—"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">From Email</p>
                <p>{emailChannel.fromEmail || "—"}</p>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleEditEmailChannel}
              >
                <Pencil className="h-4 w-4" />
                Edit Email Channel
              </Button>
            </CardContent>
          </Card>

          {/* SMS Channel Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>SMS Channel</CardTitle>
                </div>
                {smsChannel.configured ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">Sender ID</p>
                <p>{smsChannel.senderId || "—"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Phone Number</p>
                <p>{smsChannel.phoneNumber || "—"}</p>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleEditSMSChannel}
              >
                <Pencil className="h-4 w-4" />
                Edit SMS Channel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3>Message Templates</h3>
          <Button onClick={handleNewTemplate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>

        <Tabs value={activeTemplateType} onValueChange={(v) => setActiveTemplateType(v as "email" | "sms")}>
          <TabsList>
            <TabsTrigger value="email">Email Templates</TabsTrigger>
            <TabsTrigger value="sms">SMS Templates</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTemplateType} className="mt-4">
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
                            Type
                          </th>
                          <th className="px-4 py-3 text-left" scope="col">
                            Last Updated
                          </th>
                          <th className="px-4 py-3 text-left" scope="col">
                            Used in Automations
                          </th>
                          <th className="px-4 py-3 text-right" scope="col">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredTemplates.map((template) => (
                          <tr key={template.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">{template.name}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">
                                {template.type === "email" ? (
                                  <Mail className="h-3 w-3 mr-1" />
                                ) : (
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                )}
                                {template.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(template.lastUpdated).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              {template.usedInAutomations > 0 ? (
                                <Badge variant="secondary">
                                  {template.usedInAutomations}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
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
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <p>{template.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">
                              {template.type === "email" ? (
                                <Mail className="h-3 w-3 mr-1" />
                              ) : (
                                <MessageSquare className="h-3 w-3 mr-1" />
                              )}
                              {template.type.toUpperCase()}
                            </Badge>
                            {template.usedInAutomations > 0 && (
                              <Badge variant="secondary">
                                {template.usedInAutomations} automation(s)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground">
                        Updated {new Date(template.lastUpdated).toLocaleDateString()}
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="w-full gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Template
                      </Button>
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No {activeTemplateType} templates. Click "New Template" to create one.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Channel Edit Dialog */}
      <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChannel === "email" ? "Edit Email Channel" : "Edit SMS Channel"}
            </DialogTitle>
            <DialogDescription>
              Configure your {editingChannel === "email" ? "email" : "SMS"} sending settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editingChannel === "email" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={channelFormData.fromName}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, fromName: e.target.value })
                    }
                    placeholder="Springfield Country Club"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={channelFormData.fromEmail}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, fromEmail: e.target.value })
                    }
                    placeholder="membership@springfieldcc.com"
                  />
                </div>
              </>
            )}

            {editingChannel === "sms" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sender-id">Sender ID</Label>
                  <Input
                    id="sender-id"
                    value={channelFormData.senderId}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, senderId: e.target.value })
                    }
                    placeholder="SCCCLUB"
                    maxLength={11}
                  />
                  <p className="text-muted-foreground">
                    11 characters max (alphanumeric)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    value={channelFormData.phoneNumber}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, phoneNumber: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChannelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChannel}>Save Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Edit Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "New Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update the template details below."
                : "Create a new message template."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateFormData.name}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, name: e.target.value })
                  }
                  placeholder="Welcome Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-type">Type</Label>
                <Select
                  value={templateFormData.type}
                  onValueChange={(value: "email" | "sms") =>
                    setTemplateFormData({ ...templateFormData, type: value })
                  }
                  disabled={!!editingTemplate}
                >
                  <SelectTrigger id="template-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Subject */}
            {templateFormData.type === "email" && (
              <div className="space-y-2">
                <Label htmlFor="template-subject">Subject Line</Label>
                <Input
                  id="template-subject"
                  value={templateFormData.subject}
                  onChange={(e) =>
                    setTemplateFormData({ ...templateFormData, subject: e.target.value })
                  }
                  placeholder="Welcome to {{club_name}}!"
                />
              </div>
            )}

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="template-body">
                {templateFormData.type === "email" ? "Email Body" : "SMS Message"}
              </Label>
              <Textarea
                id="template-body"
                value={templateFormData.body}
                onChange={(e) =>
                  setTemplateFormData({ ...templateFormData, body: e.target.value })
                }
                placeholder={
                  templateFormData.type === "email"
                    ? "Dear {{first_name}},\n\nWelcome to our club..."
                    : "Hi {{first_name}}! Welcome to {{club_name}}."
                }
                rows={templateFormData.type === "email" ? 10 : 5}
              />
              {templateFormData.type === "sms" && (
                <p className="text-muted-foreground">
                  Characters: {templateFormData.body.length} / 160
                </p>
              )}
            </div>

            {/* Merge Fields */}
            <div className="space-y-2">
              <Label>Insert Merge Fields</Label>
              <div className="flex flex-wrap gap-2">
                {mergeFields.map((field) => (
                  <Button
                    key={field.token}
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertMergeField(field.token)}
                    type="button"
                  >
                    {field.label}
                  </Button>
                ))}
              </div>
              <p className="text-muted-foreground">
                Click a button to insert a merge field at the end of your message
              </p>
            </div>

            {/* Preview */}
            {templateFormData.type === "email" && (
              <div className="space-y-2 p-4 border border-border rounded-lg bg-muted/30">
                <h4>Preview</h4>
                <div className="bg-background border border-border rounded p-4 space-y-2">
                  <p>
                    <strong>Subject:</strong> {templateFormData.subject || "(No subject)"}
                  </p>
                  <div className="pt-2 border-t border-border whitespace-pre-wrap">
                    {templateFormData.body || "(Empty message)"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateFormData.name.trim()}>
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
