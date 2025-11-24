import * as React from "react";
import { Users, Building2, User } from "lucide-react";
import { SecondarySidebar, SidebarSection } from "../layout/SecondarySidebar";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CustomerSettingsLocationsPage } from "./CustomerSettingsLocationsPage";
import { CustomerSettingsMembershipPlansPage } from "./CustomerSettingsMembershipPlansPage";
import { CustomerSettingsStatusReasonsPage } from "./CustomerSettingsStatusReasonsPage";
import { CustomerSettingsCustomFieldsPage } from "./CustomerSettingsCustomFieldsPage";
import { CustomerSettingsCommsPage } from "./CustomerSettingsCommsPage";
import { CustomerSettingsAutomationsPage } from "./CustomerSettingsAutomationsPage";
import { CustomerSettingsImportExportPage } from "./CustomerSettingsImportExportPage";
import { SettingsPlaceholder } from "../customers/settings/SettingsPlaceholder";

// Define secondary navigation for Settings module
const settingsNavSections: SidebarSection[] = [
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "company",
    label: "Company",
    icon: Building2,
  },
  {
    id: "account",
    label: "Account",
    icon: User,
  },
];

interface SettingsLayoutProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function SettingsLayout({
  activeSection,
  onSectionChange,
}: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = React.useState("membership-plans");

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "customers":
        return (
          <>
            {/* Header */}
            <div className="px-6 max-w-7xl mx-auto w-full">
              <div>
                <h2>Customer Settings</h2>
                <p className="text-muted-foreground">
                  Configure customer-related settings and preferences
                </p>
              </div>
            </div>

            {/* Tertiary Navigation - Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <div className="px-6">
                <div className="max-w-7xl mx-auto w-full">
                  <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                    <TabsTrigger value="membership-plans">Membership Plans</TabsTrigger>
                    <TabsTrigger value="status-reasons">Status Reasons</TabsTrigger>
                    <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
                    <TabsTrigger value="comms">Comms</TabsTrigger>
                    <TabsTrigger value="automations">Automations</TabsTrigger>
                    <TabsTrigger value="import-export">Import / Export</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="px-6 max-w-7xl mx-auto w-full">
                <TabsContent value="membership-plans" className="mt-6">
                  <CustomerSettingsMembershipPlansPage />
                </TabsContent>

                <TabsContent value="status-reasons" className="mt-6">
                  <CustomerSettingsStatusReasonsPage />
                </TabsContent>

                <TabsContent value="custom-fields" className="mt-6">
                  <CustomerSettingsCustomFieldsPage />
                </TabsContent>

                <TabsContent value="comms" className="mt-6">
                  <CustomerSettingsCommsPage />
                </TabsContent>

                <TabsContent value="automations" className="mt-6">
                  <CustomerSettingsAutomationsPage />
                </TabsContent>

                <TabsContent value="import-export" className="mt-6">
                  <CustomerSettingsImportExportPage />
                </TabsContent>
              </div>
            </Tabs>
          </>
        );

      case "company":
        return (
          <div className="px-6 max-w-7xl mx-auto w-full space-y-6">
            <div>
              <h2>Company Settings</h2>
              <p className="text-muted-foreground">
                Manage company profile, locations, and organizational preferences
              </p>
            </div>
            <div className="mt-6">
              <CustomerSettingsLocationsPage />
            </div>
          </div>
        );

      case "account":
        return (
          <div className="px-6 max-w-7xl mx-auto w-full space-y-6">
            <div>
              <h2>Account Settings</h2>
              <p className="text-muted-foreground">
                Manage your personal account preferences and security
              </p>
            </div>
            <SettingsPlaceholder
              title="Account Settings"
              description="Update your profile, password, and notification preferences"
              route="/settings/account"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2>Customer Settings</h2>
              <p className="text-muted-foreground">
                Configure customer-related settings and preferences
              </p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="membership-plans">Membership Plans</TabsTrigger>
                <TabsTrigger value="status-reasons">Status Reasons</TabsTrigger>
                <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
                <TabsTrigger value="comms">Comms</TabsTrigger>
                <TabsTrigger value="automations">Automations</TabsTrigger>
                <TabsTrigger value="import-export">Import / Export</TabsTrigger>
              </TabsList>

              <TabsContent value="locations" className="mt-6">
                <CustomerSettingsLocationsPage />
              </TabsContent>

              <TabsContent value="membership-plans" className="mt-6">
                <CustomerSettingsMembershipPlansPage />
              </TabsContent>

              <TabsContent value="status-reasons" className="mt-6">
                <CustomerSettingsStatusReasonsPage />
              </TabsContent>

              <TabsContent value="custom-fields" className="mt-6">
                <CustomerSettingsCustomFieldsPage />
              </TabsContent>

              <TabsContent value="comms" className="mt-6">
                <CustomerSettingsCommsPage />
              </TabsContent>

              <TabsContent value="automations" className="mt-6">
                <CustomerSettingsAutomationsPage />
              </TabsContent>

              <TabsContent value="import-export" className="mt-6">
                <CustomerSettingsImportExportPage />
              </TabsContent>
            </Tabs>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Page Header - Spans full width above secondary nav and content */}
      <div className="h-20 px-6 flex items-center border-b border-border bg-background shrink-0">
        <div>
          <h1>Settings</h1>
          <p className="text-muted-foreground">
            Configure your application preferences and settings
          </p>
        </div>
      </div>

      {/* Content area with secondary nav and main content */}
      <div className="flex flex-1 min-h-0">
        {/* Secondary Sidebar for Settings Module */}
        <SecondarySidebar
          title="Settings"
          sections={settingsNavSections}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          <ScrollArea className="flex-1">
            {renderContent()}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}