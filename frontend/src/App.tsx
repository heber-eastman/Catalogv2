import * as React from "react";
import { CatalogLayout } from "./components/layout/CatalogLayout";
import { CustomersLayoutNew } from "./components/customers/CustomersLayoutNew";
import { SettingsLayout } from "./components/settings/SettingsLayout";
import { ModuleId } from "./components/layout/ModuleSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { SignInPage } from "./components/auth/SignInPage";
import { UserProfilePage } from "./components/profile/UserProfilePage";
import { Toaster } from "./components/ui/sonner";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { ClassesLayout, ClassesSection } from "./modules/classes/ClassesLayout";

function AppContent() {
  const { isLoaded } = useUser();
  const [activeModule, setActiveModule] = React.useState<ModuleId>("customers");
  const [activeCustomerSection, setActiveCustomerSection] = React.useState("dashboard");
  const [activeSettingsSection, setActiveSettingsSection] = React.useState("customers");
  const [activeClassesSection, setActiveClassesSection] =
    React.useState<ClassesSection>("calendar");
  const [showProfile, setShowProfile] = React.useState(false);

  React.useEffect(() => {
    if (activeModule === "classes") {
      setActiveClassesSection("calendar");
    }
  }, [activeModule]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading experience…
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="w-full min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-6 p-6">
          <SignInPage />
          <div className="flex gap-3">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {showProfile ? (
          <CatalogLayout
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            onProfileClick={() => setShowProfile(true)}
          >
            <UserProfilePage onClose={() => setShowProfile(false)} />
          </CatalogLayout>
        ) : (
          <CatalogLayout
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            onProfileClick={() => setShowProfile(true)}
          >
            {activeModule === "customers" && (
              <CustomersLayoutNew
                activeSection={activeCustomerSection}
                onSectionChange={setActiveCustomerSection}
              />
            )}

            {activeModule === "classes" && (
              <ClassesLayout
                activeSection={activeClassesSection}
                onSectionChange={setActiveClassesSection}
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
        )}
      </SignedIn>
    </>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  );
}