import * as React from "react";
import { CatalogLayout } from "./components/layout/CatalogLayout";
import { CustomersLayoutNew } from "./components/customers/CustomersLayoutNew";
import { SettingsLayout } from "./components/settings/SettingsLayout";
import { ModuleId } from "./components/layout/ModuleSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SignInPage } from "./components/auth/SignInPage";
import { UserProfilePage } from "./components/profile/UserProfilePage";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = React.useState<ModuleId>("customers");
  const [activeCustomerSection, setActiveCustomerSection] = React.useState("dashboard");
  const [activeSettingsSection, setActiveSettingsSection] = React.useState("customers");
  const [showProfile, setShowProfile] = React.useState(false);

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  if (showProfile) {
    return (
      <CatalogLayout
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onProfileClick={() => setShowProfile(true)}
      >
        <UserProfilePage onClose={() => setShowProfile(false)} />
      </CatalogLayout>
    );
  }

  return (
    <CatalogLayout
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      onProfileClick={() => setShowProfile(true)}
    >
      {/* Render module-specific content based on activeModule */}
      {activeModule === "customers" && (
        <CustomersLayoutNew
          activeSection={activeCustomerSection}
          onSectionChange={setActiveCustomerSection}
        />
      )}

      {activeModule === "settings" && (
        <SettingsLayout
          activeSection={activeSettingsSection}
          onSectionChange={setActiveSettingsSection}
        />
      )}

      {activeModule === "tee-sheet" && (
        <div className="flex items-center justify-center h-full p-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Tee Sheet Module</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The Tee Sheet module will allow you to manage golf course bookings,
                tee times, and scheduling.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeModule === "pos" && (
        <div className="flex items-center justify-center h-full p-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Point of Sale Module</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The Point of Sale module will handle transactions, inventory
                management, and sales reporting.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeModule === "reports" && (
        <div className="flex items-center justify-center h-full p-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Reports Module</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The Reports module will provide analytics, insights, and detailed
                reports across all modules.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </CatalogLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}