import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../ui/utils";

export interface FilterOption {
  value: string;
  label: string;
  description?: string;
}

interface FilterMenuProps {
  label: string;
  selectedValues: string[];
  options: FilterOption[];
  onToggle: (value: string) => void;
  className?: string;
}

export function FilterMenu({
  label,
  selectedValues,
  options,
  onToggle,
  className,
}: FilterMenuProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCount = selectedValues.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 rounded-md px-4 text-sm font-medium",
            "flex items-center gap-2",
            className,
          )}
        >
          {label}
          {selectedCount > 0 && (
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[11px] leading-none rounded-full"
            >
              {selectedCount}
            </Badge>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-1"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command loop>
          <CommandList className="max-h-64">
            <CommandEmpty>No options available</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => onToggle(option.value)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md",
                      "data-[selected=true]:bg-accent data-[selected=true]:text-foreground",
                      "hover:bg-accent hover:text-foreground",
                    )}
                    aria-selected={isSelected}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-transparent",
                      )}
                    >
                      <Check className={cn("h-3 w-3 transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                    </div>
                    <span className="flex-1">
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.description && (
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
