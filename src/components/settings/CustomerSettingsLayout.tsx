import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type CustomerSettingsTab =
  | "locations"
  | "membership-plans"
  | "status-reasons"
  | "custom-fields"
  | "comms"
  | "automations"
  | "import-export";

interface CustomerSettingsLayoutProps {
  children: React.ReactNode;
  activeTab: CustomerSettingsTab;
  onTabChange: (tab: CustomerSettingsTab) => void;
}

export function CustomerSettingsLayout({
  children,
  activeTab,
  onTabChange,
}: CustomerSettingsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1>Customer Settings</h1>
        <p className="text-muted-foreground">
          Manage locations, membership plans, and customer configuration
        </p>
      </div>

      {/* Tertiary Navigation - Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as CustomerSettingsTab)}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="membership-plans">Membership Plans</TabsTrigger>
          <TabsTrigger value="status-reasons">Status Reasons</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="comms">Comms</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="import-export">Import / Export</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
