import * as React from "react";
import { CustomerSettingsLayout } from "./CustomerSettingsLayout";
import { CustomerSettingsLocationsPage } from "./CustomerSettingsLocationsPage";
import { CustomerSettingsMembershipPlansPage } from "./CustomerSettingsMembershipPlansPage";

type CustomerSettingsTab =
  | "locations"
  | "membership-plans"
  | "status-reasons"
  | "custom-fields"
  | "comms"
  | "automations"
  | "import-export";

export function CustomerSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<CustomerSettingsTab>("locations");

  const renderTabContent = () => {
    switch (activeTab) {
      case "locations":
        return <CustomerSettingsLocationsPage />;
      case "membership-plans":
        return <CustomerSettingsMembershipPlansPage />;
      case "status-reasons":
        return (
          <div className="border border-border rounded-lg p-8 bg-muted/30 text-center">
            <p className="text-muted-foreground">
              Status Reasons configuration - To be implemented
            </p>
          </div>
        );
      case "custom-fields":
        return (
          <div className="border border-border rounded-lg p-8 bg-muted/30 text-center">
            <p className="text-muted-foreground">
              Custom Fields configuration - To be implemented
            </p>
          </div>
        );
      case "comms":
        return (
          <div className="border border-border rounded-lg p-8 bg-muted/30 text-center">
            <p className="text-muted-foreground">
              Communication templates - To be implemented
            </p>
          </div>
        );
      case "automations":
        return (
          <div className="border border-border rounded-lg p-8 bg-muted/30 text-center">
            <p className="text-muted-foreground">
              Automation workflows - To be implemented
            </p>
          </div>
        );
      case "import-export":
        return (
          <div className="border border-border rounded-lg p-8 bg-muted/30 text-center">
            <p className="text-muted-foreground">
              Import / Export tools - To be implemented
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <CustomerSettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </CustomerSettingsLayout>
  );
}
