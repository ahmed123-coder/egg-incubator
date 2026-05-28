import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  status?: "success" | "warning" | "danger" | "info";
}

const statusVariants = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-red-500",
  info: "text-blue-500",
};

export function StatusCard({ title, value, unit, icon: Icon, status = "info" }: StatusCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("rounded-lg bg-muted p-2.5", statusVariants[status])}>
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl font-bold tabular-nums">
            {value}
            {unit && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{unit}</span>}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
