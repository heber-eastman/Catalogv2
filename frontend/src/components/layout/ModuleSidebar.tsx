import * as React from "react";
import {
  CalendarClock,
  CalendarDays,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export type ModuleId =
  | "tee-sheet"
  | "customers"
  | "classes"
  | "pos"
  | "reports"
  | "settings";

interface Module {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
}

const modules: Module[] = [
  {
    id: "tee-sheet",
    label: "Tee Sheet",
    icon: CalendarDays,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "classes",
    label: "Classes",
    icon: CalendarClock,
  },
  {
    id: "pos",
    label: "Point of Sale",
    icon: ShoppingCart,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

interface ModuleSidebarProps {
  activeModule: ModuleId;
  onModuleChange: (moduleId: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileMenuOpen?: boolean;
}

export function ModuleSidebar({
  activeModule,
  onModuleChange,
  collapsed,
  onToggleCollapse,
  mobileMenuOpen,
}: ModuleSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "flex flex-col bg-card border-r border-border transition-all duration-300",
          // Desktop behavior - collapsible sidebar
          "hidden md:flex",
          collapsed ? "w-16" : "w-56"
        )}
        aria-label="Module navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          {!collapsed && <h1 className="truncate">Catalog</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1" aria-label="Module navigation">
          <TooltipProvider delayDuration={0}>
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;

              if (collapsed) {
                return (
                  <Tooltip key={module.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-center px-0"
                        onClick={() => onModuleChange(module.id)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {module.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Button
                  key={module.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => onModuleChange(module.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{module.label}</span>
                </Button>
              );
            })}
          </TooltipProvider>
        </nav>
      </aside>

      {/* Mobile Sidebar - Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggleCollapse}
            aria-hidden="true"
          />
          
          {/* Mobile Menu */}
          <aside
            className={cn(
              "fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-card border-r border-border w-56 md:hidden"
            )}
            aria-label="Module navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <h1 className="truncate">Catalog</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8 shrink-0"
                aria-label="Close menu"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1" aria-label="Module navigation">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;

                return (
                  <Button
                    key={module.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onModuleChange(module.id);
                      onToggleCollapse(); // Close menu after selection on mobile
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{module.label}</span>
                  </Button>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}