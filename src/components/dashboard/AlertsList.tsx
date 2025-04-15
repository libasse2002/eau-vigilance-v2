
import { Alert } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertTriangleIcon, BellIcon, BellOffIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
}

export function AlertsList({ alerts, onAcknowledge }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <BellOffIcon className="h-12 w-12 mb-2 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Alerts</h3>
        <p className="text-sm">All systems are functioning normally.</p>
      </div>
    );
  }
  
  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "text-alert-high";
      case "medium":
        return "text-alert-medium";
      case "low":
        return "text-alert-low";
      default:
        return "text-muted-foreground";
    }
  };
  
  const getSeverityBg = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-alert-high/10";
      case "medium":
        return "bg-alert-medium/10";
      case "low":
        return "bg-alert-low/10";
      default:
        return "bg-muted";
    }
  };
  
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "p-3 rounded-md border",
            alert.acknowledged
              ? "bg-muted/50 border-gray-200"
              : `${getSeverityBg(alert.severity)} border-${getSeverityColor(alert.severity)}/30`
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={cn(
                  "p-1.5 rounded-full",
                  getSeverityColor(alert.severity),
                  getSeverityBg(alert.severity)
                )}
              >
                {alert.acknowledged ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <AlertTriangleIcon className="h-4 w-4" />
                )}
              </div>
              <div>
                <h4 className={cn(
                  "font-medium",
                  alert.acknowledged ? "text-muted-foreground" : "text-foreground"
                )}>
                  {alert.message}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(alert.timestamp), "MMM d, yyyy • h:mm a")}
                </p>
                {alert.acknowledged && alert.acknowledgedBy && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Acknowledged by {alert.acknowledgedBy}
                    {alert.acknowledgedAt && ` on ${format(new Date(alert.acknowledgedAt), "MMM d, yyyy")}`}
                  </p>
                )}
              </div>
            </div>
            
            {!alert.acknowledged && onAcknowledge && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAcknowledge(alert.id)}
                className="text-xs"
              >
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
