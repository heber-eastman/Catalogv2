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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
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

              <div className="max-w-7xl mx-auto w-full">
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
          <div className="max-w-7xl mx-auto w-full space-y-6">
            <CustomerSettingsLocationsPage />
          </div>
        );

      case "account":
        return (
          <div className="max-w-7xl mx-auto w-full space-y-6">
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
    <div className="flex flex-1 min-h-0 bg-background">
      <SecondarySidebar
        title="Settings"
        sections={settingsNavSections}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">{renderContent()}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}