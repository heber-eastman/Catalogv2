import * as React from "react";
import { 
  Users, 
  UserPlus, 
  Building2, 
  Tags, 
  Settings,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { SecondarySidebar, SidebarSection } from "../layout/SecondarySidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tag } from "../ui/tag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

const customerSections: SidebarSection[] = [
  {
    id: "all",
    label: "All Customers",
    icon: Users,
    badge: 1247,
  },
  {
    id: "new",
    label: "New Customers",
    icon: UserPlus,
    badge: 23,
  },
  {
    id: "companies",
    label: "Companies",
    icon: Building2,
    badge: 156,
  },
  {
    id: "segments",
    label: "Segments",
    icon: Tags,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

interface CustomersLayoutProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function CustomersLayout({
  activeSection,
  onSectionChange,
}: CustomersLayoutProps) {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [tags, setTags] = React.useState(["VIP", "Golf Member", "Regular"]);

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Secondary Sidebar for Customers Module */}
      <SecondarySidebar
        title="Customers"
        sections={customerSections}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Main Content with Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <header className="h-14 px-6 border-b border-border flex items-center justify-between bg-background">
          <div>
            <h2>Customer Management</h2>
            <p className="text-muted-foreground">
              Manage and organize your customer database
            </p>
          </div>
          <Button>Add Customer</Button>
        </header>

        {/* Content Area with Tabs */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Customers</CardTitle>
                      <CardDescription>Active customer accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-foreground">1,247</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>New This Month</CardTitle>
                      <CardDescription>Recently added</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-foreground">23</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Companies</CardTitle>
                      <CardDescription>Corporate accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-foreground">156</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>Find customers quickly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                          id="search"
                          placeholder="Search by name, email, or phone..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="segment">Segment</Label>
                        <Select>
                          <SelectTrigger id="segment">
                            <SelectValue placeholder="All segments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All segments</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      Basic details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3>Contact Information</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            <Mail className="inline h-4 w-4 mr-2" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            <Phone className="inline h-4 w-4 mr-2" />
                            Phone
                          </Label>
                          <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">
                            <MapPin className="inline h-4 w-4 mr-2" />
                            Address
                          </Label>
                          <Textarea
                            id="address"
                            placeholder="123 Main Street, City, State, ZIP"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3>Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Tag
                            key={index}
                            variant="default"
                            removable
                            onRemove={() => handleRemoveTag(index)}
                          >
                            {tag}
                          </Tag>
                        ))}
                        <Button variant="outline" size="sm">
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Customer engagement history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p>Tee time booking confirmed</p>
                          <p className="text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-success mt-2" />
                        <div className="flex-1">
                          <p>Payment received</p>
                          <p className="text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-info mt-2" />
                        <div className="flex-1">
                          <p>Profile updated</p>
                          <p className="text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Preferences</CardTitle>
                    <CardDescription>
                      Manage how you communicate with this customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">
                            Email Notifications
                          </Label>
                          <p className="text-muted-foreground">
                            Send booking confirmations and updates via email
                          </p>
                        </div>
                        <Switch id="email-notifications" defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                          <p className="text-muted-foreground">
                            Send reminders and alerts via text message
                          </p>
                        </div>
                        <Switch id="sms-notifications" />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="marketing">Marketing Communications</Label>
                          <p className="text-muted-foreground">
                            Receive promotional offers and newsletters
                          </p>
                        </div>
                        <Switch id="marketing" defaultChecked />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Preferred Contact Method</Label>
                      <RadioGroup defaultValue="email">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="pref-email" />
                          <Label htmlFor="pref-email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="pref-phone" />
                          <Label htmlFor="pref-phone">Phone</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sms" id="pref-sms" />
                          <Label htmlFor="pref-sms">SMS</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Additional Options</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="newsletter" defaultChecked />
                          <Label htmlFor="newsletter" className="cursor-pointer">
                            Subscribe to monthly newsletter
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="special-offers" />
                          <Label htmlFor="special-offers" className="cursor-pointer">
                            Receive special offers
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="event-invites" defaultChecked />
                          <Label htmlFor="event-invites" className="cursor-pointer">
                            Event invitations
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
