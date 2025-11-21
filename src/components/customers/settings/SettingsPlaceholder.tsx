import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

interface SettingsPlaceholderProps {
  title: string;
  description: string;
  route: string;
}

export function SettingsPlaceholder({
  title,
  description,
  route,
}: SettingsPlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This settings page is under construction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The {title} settings will allow you to configure and customize this aspect
            of your customer management system.
          </p>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-muted-foreground">
              <span className="text-primary">Conceptual route:</span> {route}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
