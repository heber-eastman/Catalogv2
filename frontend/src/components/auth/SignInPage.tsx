import { SignIn } from "@clerk/clerk-react";
import { Card } from "../ui/card";

export function SignInPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-3xl shadow-2xl border border-border/70 p-8">
        <SignIn
          appearance={{
            elements: {
              card: "bg-transparent shadow-none p-0",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              formFieldInput: "focus-visible:ring-2 focus-visible:ring-primary focus:border-primary",
              footerActionLink: "text-primary hover:text-primary/80",
            },
            variables: {
              colorPrimary: "rgb(24, 24, 27)",
              fontFamily: "var(--font-sans)",
            },
          }}
          redirectUrl="/"
        />
      </Card>
    </div>
  );
}
