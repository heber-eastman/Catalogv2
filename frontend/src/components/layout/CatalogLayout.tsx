import * as React from "react";
import { ModuleSidebar, ModuleId } from "./ModuleSidebar";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

interface CatalogLayoutProps {
  children: React.ReactNode;
  activeModule: ModuleId;
  onModuleChange: (moduleId: ModuleId) => void;
  onProfileClick: () => void;
  className?: string;
}

export function CatalogLayout({
  children,
  activeModule,
  onModuleChange,
  onProfileClick,
  className,
}: CatalogLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Module Sidebar */}
      <ModuleSidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        collapsed={collapsed}
        onToggleCollapse={() => {
          // Desktop: toggle collapsed state
          // Mobile: close menu (handled via mobileMenuOpen state)
          if (window.innerWidth >= 768) {
            setCollapsed(!collapsed);
          } else {
            setMobileMenuOpen(false);
          }
        }}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className={cn("flex-1 flex flex-col min-h-0", className)}>
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="ml-3">Catalog</h1>
          </div>
          <div className="flex items-center gap-2">
            <SignedIn>
              <Button variant="outline" size="sm" onClick={onProfileClick}>
                Profile
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton mode="modal" />
                <SignUpButton mode="modal" />
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Desktop Header with User Menu */}
        <div className="hidden md:flex items-center justify-end h-14 px-6 border-b border-border bg-card shrink-0">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={onProfileClick}>
                Profile
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex gap-2">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </div>
          </SignedOut>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}