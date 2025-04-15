
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "alert" | "success";
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden",
      variant === "alert" && "border-alert-high/50 bg-alert-high/5",
      variant === "success" && "border-alert-low/50 bg-alert-low/5"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn(
            "p-1.5 rounded-full",
            variant === "default" && "text-primary bg-primary/10",
            variant === "alert" && "text-alert-high bg-alert-high/10",
            variant === "success" && "text-alert-low bg-alert-low/10"
          )}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">{value}</div>
          {(description || trend) && (
            <div className="flex items-center">
              {trend && (
                <span
                  className={cn(
                    "mr-1 text-xs font-medium",
                    trend.isPositive ? "text-alert-low" : "text-alert-high"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
