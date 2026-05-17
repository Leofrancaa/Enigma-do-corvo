import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-mono font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30",
        magenta: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
        zinc: "bg-zinc-800 text-zinc-400 border border-zinc-700",
        destructive: "bg-red-500/20 text-red-400 border border-red-500/30",
        success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
