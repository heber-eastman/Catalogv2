import * as React from "react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
  children?: SidebarItem[];
}

interface CustomersSecondarySidebarProps {
  title: string;
  items: SidebarItem[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function CustomersSecondarySidebar({
  title,
  items,
  activeSection,
  onSectionChange,
  className,
  mobileOpen = false,
  onMobileToggle,
}: CustomersSecondarySidebarProps) {
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    settings: true, // Settings expanded by default
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const renderItem = (item: SidebarItem, depth: number = 0) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                depth > 0 && "pl-8"
              )}
              aria-expanded={isExpanded}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span className="flex-1 truncate text-left">{item.label}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.id}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          depth > 0 && "pl-8"
        )}
        onClick={() => {
          onSectionChange(item.id);
          if (onMobileToggle && window.innerWidth < 768) {
            onMobileToggle();
          }
        }}
        aria-current={isActive ? "page" : undefined}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge !== undefined && (
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
            {item.badge}
          </span>
        )}
      </Button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-56 bg-muted/30 border-r border-border flex flex-col",
          "md:relative",
          // Mobile: fixed positioning with slide animation
          "fixed left-0 top-0 bottom-0 z-50 md:static transition-transform duration-300",
          !mobileOpen && "-translate-x-full md:translate-x-0",
          className
        )}
        aria-label={`${title} navigation`}
      >
        {/* Header - Only visible on mobile */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border md:hidden">
          <h2 className="truncate">{title}</h2>
          {onMobileToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMobileToggle}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1" aria-label={`${title} sections`}>
            {items.map((item) => renderItem(item))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile toggle button */}
      {onMobileToggle && !mobileOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-20 top-4 z-40 md:hidden"
          onClick={onMobileToggle}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}