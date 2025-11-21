import * as React from "react";
import {
  Plus,
  Download,
  ArrowLeft,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { CustomersPage } from "./CustomersPage";
import { CustomerProfilePage } from "./profile/CustomerProfilePage";

interface CustomersLayoutNewProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function CustomersLayoutNew({
  activeSection,
  onSectionChange,
}: CustomersLayoutNewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);

  // Handle customer selection from People list
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  // Handle back to People list
  const handleBackToPeople = () => {
    setSelectedCustomerId(null);
  };

  // Render content based on view
  const renderContent = () => {
    // If viewing a customer profile
    if (selectedCustomerId) {
      return (
        <CustomerProfilePage
          customerId={selectedCustomerId}
          onBack={handleBackToPeople}
        />
      );
    }

    // Otherwise render combined customers page
    return <CustomersPage onCustomerSelect={handleCustomerSelect} />;
  };

  // Get header configuration based on view
  const getHeaderConfig = () => {
    // Customer profile view
    if (selectedCustomerId) {
      return {
        title: "Customer Profile",
        subtitle: "View and manage customer details",
        actions: (
          <Button
            variant="outline"
            onClick={handleBackToPeople}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Button>
        ),
      };
    }

    // Main customers view
    return {
      title: "Customers",
      subtitle: "Overview and management of your customer base",
      actions: (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => console.log("Export CSV")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => console.log("New person")} className="gap-2">
            <Plus className="h-4 w-4" />
            New person
          </Button>
        </div>
      ),
    };
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Page Header - Spans full width above secondary nav and content */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-border bg-background shrink-0">
        <div>
          <h1>{headerConfig.title}</h1>
          <p className="text-muted-foreground">{headerConfig.subtitle}</p>
        </div>
        {headerConfig.actions && (
          <div className="hidden sm:flex">{headerConfig.actions}</div>
        )}
      </div>

      {/* Content area with secondary nav and main content */}
      <div className="flex flex-1 min-h-0">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          {/* Mobile action buttons */}
          {headerConfig.actions && (
            <div className="sm:hidden p-4 border-b border-border">
              {headerConfig.actions}
            </div>
          )}
          
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-7xl mx-auto w-full">
              {renderContent()}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}