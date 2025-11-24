import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "./utils";

const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary text-primary-foreground",
        success: "bg-[--color-success] text-[--color-success-foreground]",
        warning: "bg-[--color-warning] text-[--color-warning-foreground]",
        info: "bg-[--color-info] text-[--color-info-foreground]",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-5 px-1.5 gap-0.5",
        default: "h-6 px-2",
        lg: "h-7 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {
  onRemove?: () => void;
  removable?: boolean;
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, size, onRemove, removable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tagVariants({ variant, size }), className)}
        {...props}
      >
        <span className="truncate">{children}</span>
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
