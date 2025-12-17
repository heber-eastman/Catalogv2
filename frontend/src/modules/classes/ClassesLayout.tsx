import * as React from "react";
import { CalendarClock, ListChecks, Plus } from "lucide-react";
import {
  SecondarySidebar,
  SidebarSection,
} from "../../components/layout/SecondarySidebar";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ClassTemplatesPage } from "./pages/ClassTemplatesPage";
import { ClassCalendarPage } from "./pages/ClassCalendarPage";

export type ClassesSection = "calendar" | "templates";

interface ClassesLayoutProps {
  activeSection: ClassesSection;
  onSectionChange: (sectionId: ClassesSection) => void;
}

const sidebarSections: SidebarSection[] = [
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarClock,
  },
  {
    id: "templates",
    label: "Templates",
    icon: ListChecks,
  },
];

export function ClassesLayout({
  activeSection,
  onSectionChange,
}: ClassesLayoutProps) {
  const headerConfig =
    activeSection === "templates"
      ? {
          title: "Class Templates",
          subtitle: "Define recurring programs, eligibility, and instructors.",
          actions: null,
        }
      : {
          title: "Classes Calendar",
          subtitle: "View sessions across locations and manage daily operations.",
          actions: (
            <div className="flex gap-2">
              <Button variant="outline">Week view</Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New session
              </Button>
            </div>
          ),
        };

  const renderContent = () =>
    activeSection === "templates"
      ? <ClassTemplatesPage />
      : <ClassCalendarPage />;

  return (
    <div className="flex flex-1 min-h-0 bg-background">
      <SecondarySidebar
        title="Classes"
        sections={sidebarSections}
        activeSection={activeSection}
        onSectionChange={(sectionId) =>
          onSectionChange(sectionId as ClassesSection)
        }
      />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-20 px-6 flex items-center justify-between border-b border-border bg-background shrink-0">
          <div>
            <h1>{headerConfig.title}</h1>
            <p className="text-muted-foreground">{headerConfig.subtitle}</p>
          </div>
          {headerConfig.actions && (
            <div className="hidden sm:flex">{headerConfig.actions}</div>
          )}
        </div>

        {headerConfig.actions && (
          <div className="sm:hidden p-4 border-b border-border">
            {headerConfig.actions}
          </div>
        )}

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">{renderContent()}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
