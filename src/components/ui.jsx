import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Slot } from "@radix-ui/react-slot";
import { Check, X } from "lucide-react";
import { cn } from "../lib/utils";

export function Button({ className, variant = "primary", asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("btn", `btn-${variant}`, className)} {...props} />;
}

export function Card({ className, ...props }) {
  return <div className={cn("card", className)} {...props} />;
}

export function Badge({ className, variant = "neutral", ...props }) {
  return <span className={cn("badge", variant, className)} {...props} />;
}

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("input", className)} {...props} />;
});

export function Table({ className, ...props }) {
  return <table className={cn("table", className)} {...props} />;
}

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef(function DropdownMenuContent(
  { className, sideOffset = 6, align = "end", ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn("sh-dropdown-content", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export const DropdownMenuItem = React.forwardRef(function DropdownMenuItem(
  { className, inset, ...props },
  ref
) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn("sh-dropdown-item", inset && "sh-dropdown-item-inset", className)}
      {...props}
    />
  );
});

export function DropdownMenuSeparator({ className, ...props }) {
  return <DropdownMenuPrimitive.Separator className={cn("sh-dropdown-separator", className)} {...props} />;
}

export const Select = SelectPrimitive.Root;

export const SelectTrigger = React.forwardRef(function SelectTrigger(
  { className, children, ...props },
  ref
) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn("filter-select", "sh-select-trigger", className)} {...props}>
      {children}
    </SelectPrimitive.Trigger>
  );
});

export const SelectValue = SelectPrimitive.Value;

export const SelectContent = React.forwardRef(function SelectContent(
  { className, children, position = "popper", ...props },
  ref
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn("sh-select-content", className)}
        {...props}
      >
        <SelectPrimitive.Viewport className="sh-select-viewport">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectItem = React.forwardRef(function SelectItem(
  { className, children, ...props },
  ref
) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn("sh-select-item", className)} {...props}>
      <span className="sh-select-check">
        <SelectPrimitive.ItemIndicator><Check size={14} /></SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef(function SheetContent(
  { className, children, ...props },
  ref
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="drawer-overlay open" />
      <DialogPrimitive.Content ref={ref} className={cn("drawer", "open", "sh-sheet-content", className)} {...props}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function SheetHeader({ className, ...props }) {
  return <div className={cn("drawer-header", className)} {...props} />;
}

export function SheetFooter({ className, ...props }) {
  return <div className={cn("drawer-footer", className)} {...props} />;
}

export function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={className} {...props} />;
}

export function SheetDescription({ className, ...props }) {
  return <DialogPrimitive.Description className={className} {...props} />;
}

export function SheetCloseButton() {
  return (
    <DialogPrimitive.Close className="drawer-close" aria-label="Close drawer">
      <X size={17} />
    </DialogPrimitive.Close>
  );
}

export function Avatar({ src, alt, fallback, className }) {
  return (
    <AvatarPrimitive.Root className={cn("avatar", className)}>
      <AvatarPrimitive.Image className="avatar-photo" src={src} alt={alt} />
      <AvatarPrimitive.Fallback>{fallback}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
