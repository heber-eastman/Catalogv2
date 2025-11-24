import * as React from "react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

export interface SidebarSection {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
}

interface SecondarySidebarProps {
  title: string;
  sections: SidebarSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

export function SecondarySidebar({
  title,
  sections,
  activeSection,
  onSectionChange,
  className,
}: SecondarySidebarProps) {
  return (
    <aside
      className={cn(
        "w-56 bg-muted/30 border-r border-border flex flex-col",
        className
      )}
      aria-label={`${title} navigation`}
    >
      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1" aria-label={`${title} sections`}>
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <Button
                key={section.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => onSectionChange(section.id)}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                <span className="flex-1 truncate text-left">{section.label}</span>
                {section.badge !== undefined && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
                    {section.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}